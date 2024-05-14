const puppeteer = require("puppeteer");
const express = require("express");
const app = express();
const PORT = 3000;
var fs = require("fs").promises;
const extensionURL = "chrome-extension://hfampifggiplieplldnfcceebhafllpm";
const pathToHistory = "browse_data/search_history_and_results.json";

// Manage preset variables
let searchValue;
let previousePresetId;
let presetResults;

manageHistory("getPreset");

app.get("/history", async (req, res) => {
    /* Sending response with following header to prevent blockage from CORS*/
	res.setHeader("Access-Control-Allow-Origin", extensionURL);


});


// Manage preset
app.get("/preset", async (req, res) => {
	/* Sending response with following header to prevent blockage from CORS*/
	res.setHeader("Access-Control-Allow-Origin", extensionURL);

    /* Getting query message */
	const setPreset = req.query.SetPreset;

    if (setPreset === 'true') {
        const shouldCancel = req.query.Cancel;

        // Cancel setting preset
        if(shouldCancel === 'true') {
            console.log("\nShould cancel:", req.query.Cancel);
            let responseMessage = await manageHistory("cancelPreseting");
            console.log(responseMessage);
            setTimeout(() => {
                res.json({ message: responseMessage});
            }, 1000);

        // Set preset to current search
        } else if (shouldCancel === 'false') {
            console.log("\nShould set preset:", setPreset);
            await manageHistory("setPreset");
            setTimeout(() => {
                res.json({ message: 'Preset now set to Search'});
            }, 1000);

        // Throw error if request can't be processed
        } else {
            res.sendStatus(400);
        }

    } else if (setPreset === 'false') {
        // Load preset
        console.log("Loading preset...");

        console.log(presetResults);

        res.json([searchValue, presetResults]);

        console.log("Preset values succesfully sent\n");
    } else {
        res.sendStatus(400);
    }
});

app.get("/search", async (req, res) => {
	// Get time of search
	const timeSearched = Date.now();

	/* Getting query message */
	const searchQuery = req.query.Query;
	console.log("\nSearch:", searchQuery);

	/* Sending response with following header to prevent blockage from CORS*/
	res.setHeader("Access-Control-Allow-Origin", extensionURL);

	console.log("Starting");

	const browser = await puppeteer.launch({ headless: true });
    console.log("Browser opened");

	const page = await browser.newPage();
    console.log("Page opened");

	let isContentLoaded = false;
    
    console.log("Searching...");

	while (!isContentLoaded) {
		try {
			await page.goto("https://www.youtube.com");
			await page.type('input[name="search_query"]', searchQuery);
			await page.click("button#search-icon-legacy");

			await page.waitForSelector("#video-title");
			console.log("Content Loaded");

			const videoTitles = await page.evaluate(() => {
				const titles = Array.from(
					document.querySelectorAll("#video-title")
				);
				return titles.map((t) => [
					t.innerText,
					t.getAttribute("aria-label"),
					t.href,
				]);
			});

			console.log("Video titles added:");
			console.log(videoTitles);

			await browser.close();
			console.log("Browser closed");

			res.json(videoTitles);
			console.log("Video titles sent successfully");

			isContentLoaded = true;

			// Write contents to browsing history file
            manageHistory("addToHistory", [searchQuery, videoTitles, timeSearched]);

		} catch (error) {
			if (error.name === "TimeoutError") {
				console.log("Might take a little longer...");
				isContentLoaded = false;
			} else {
				console.log(error.name + ": " + error.message);
				isContentLoaded = true;
				await browser.close();
			}
		}
	}
});

app.listen(PORT, function (err) {
	if (err) console.log(err);
	console.log(`\nServer running on http://localhost:${PORT}\n`);
});

/* Helper functions */

async function manageHistory(manageOption, manageArgs) {
    try {
        let data = await fs.readFile(pathToHistory, "utf8");
        let browsingHistory = JSON.parse(data);

        switch (manageOption) {
            case "addToHistory":
                console.log(manageArgs[0]);
                addResultToHistory(manageArgs[0], manageArgs[1], manageArgs[2], browsingHistory);
                break;
            case "setPreset":
                await setPresetToLastSearch(browsingHistory);
                break;
            case "getPreset":
                await getPresetFromHistory(browsingHistory);
                break;
            case "cancelPreseting":
                return await cancelPreset(browsingHistory);
            case "getHistory":
                return await getFullHistory(browsingHistory);
            default:
                console.log("Manage History option not recognized");
        }
    } catch (err) {
        console.log("Error managing history:", err);
    }
}

//Write contents to browsing history file
async function addResultToHistory(searchQuery, videoTitles, timeLogged, browsingHistory) {
    /* Check if browsing history is empty */
    if (browsingHistory.history.length === 0) {
        console.log("No search resuls in search history");
    }
    browsingHistory.history.push({
        query: searchQuery,
        result: videoTitles,
        timeSearched: timeLogged,
    }); //add some data

    console.log({
        query: searchQuery,
        result: videoTitles,
        timeSearched: timeLogged,
    });

    await writeBackToHistoryFile(browsingHistory);
    console.log(`Search: '${searchQuery}', added successfully`);
}

async function cancelPreset(browsingHistory) {
    console.log("Starting cancellation");

    // Check if there is no previous preset
    if (browsingHistory.presetId === null || previousePresetId === null) {
        return "No preset found";
    // Set current presetId to previous
    } else {
        console.log("Cancelling...")
        browsingHistory.presetId = previousePresetId;
        await writeBackToHistoryFile(browsingHistory);
        await getPresetFromHistory(browsingHistory);
        return "Cancelled Successfully";
    }
        
}

// Get preset from history file
async function getPresetFromHistory(browsingHistory) {            
    /* Check if browsing history is empty */
    if (browsingHistory.history.length === 0) {
        console.log("Preset not found in results in search history");
        presetResults = null;
    } else {
        browsingHistory.history.forEach((title) => {
            if (title.timeSearched === browsingHistory.presetId) {
                console.log("Preset Loaded successfully");
                presetResults = title.result;
                searchValue = title.query;
            }
        });
    }
}

// Set preset value to current search
async function setPresetToLastSearch(browsingHistory) {
    /* Check if browsing history is empty */
    let completed = false;
    if (browsingHistory.history.length === 0) {
        console.log("Preset not found in results in search history");
        browsingHistory.presetId = null;
        presetResults = null;
        completed = true;
    } else {
        // Get last search made which is the current search
        let lastSearch = browsingHistory.history.slice(-1)[0];

        // Get value of presetId to handle in case of cancellation
        previousePresetId = browsingHistory.presetId;

        // Set presetId to last search 
        browsingHistory.presetId = lastSearch.timeSearched;

        // Werite back to file
        await writeBackToHistoryFile(browsingHistory);
        
        completed = true;
    }
    await getPresetFromHistory(browsingHistory);
    console.log("Preset updated successfully\n");
}

// Function to get full browsing history
async function getFullHistory(browsingHistory) {
    
}


// Function to write back to json file using promises
async function writeBackToHistoryFile(jsonObject) {
    const json = JSON.stringify(jsonObject);  // Convert it back to json

    try {
        await fs.writeFile(pathToHistory, json, "utf8");  // Write back to file
        console.log("Writing completed");
    } catch (err) {
        console.log(err);
    }
}

