const puppeteer = require("puppeteer");
const express = require("express");
const app = express();
const PORT = 3000;
var fs = require("fs");
const extensionURL = "chrome-extension://hfampifggiplieplldnfcceebhafllpm";
const pathToHistory = "browse_data/search_history_and_results.json";

// Load preset values on launch
let searchValue;
let presetResults;
getPreset()

app.get("/history", async (req, res) => {});


// Manage preset
app.get("/preset", async (req, res) => {
	/* Sending response with following header to prevent blockage from CORS*/
	res.setHeader("Access-Control-Allow-Origin", extensionURL);

    /* Getting query message */
	const setPreset = req.query.SetPreset;
	console.log("\n Should set preset:", setPreset);

    if (setPreset === 'true') {
        // Set preset
        setPreset();

    } else {
        // Load preset
        console.log("Loading preset...");

        console.log(presetResults);

        res.json([searchValue, presetResults]);

        console.log("Preset values succesfully sent");
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

			/* Write contents to browsing history file */
			//addResultToHistory(searchQuery, videoTitles, timeSearched);
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
	console.log(`Server running on http://localhost:${PORT}`);
});

/* Helper functions */

//Write contents to browsing history file
function addResultToHistory(searchQuery, videoTitles, timeSearched) {
	fs.readFile(pathToHistory, "utf8", function readFileCallback(err, data) {
		if (err) {
			console.log(err);
		} else {
			let browsingHistory = JSON.parse(data); //now it's an object

			/* Check if browsing history is empty */
			if (browsingHistory.history.length === 0) {
				console.log("No search resuls in search history");
			}
			browsingHistory.history.push({
				query: searchQuery,
				result: videoTitles,
				dateSearched: timeSearched,
			}); //add some data

			json = JSON.stringify(browsingHistory); //convert it back to json

			// Define a callback function for writeFile
			function writeFileCallback(err) {
				if (err) {
					console.log(err);
				} else {
					console.log("JSON data is saved.");
				}
			}
			// Write back to file
			fs.writeFile(pathToHistory, json, "utf8", writeFileCallback);
		}
	});
}

// Get preset from history file
function getPreset() {
	fs.readFile(pathToHistory, "utf8", function readFileCallback(err, data) {
		if (err) {
			console.log(err);
		} else {
			let browsingHistory = JSON.parse(data); //now it's an object

			/* Check if browsing history is empty */
			if (browsingHistory.history.length === 0) {
				console.log("Preset not found in results in search history");
				presetResults = null;
			} else {
				browsingHistory.history.forEach((title) => {
					if (title.timeSearched === browsingHistory.presetId) {
                        console.log("Preset successfully Loaded");
						presetResults = title.result;
                        searchValue = title.query;
					}
				});
			}
		}
	});
}

// Set preset value to current search
function setPreset() {
	fs.readFile(pathToHistory, "utf8", function readFileCallback(err, data) {
		if (err) {
			console.log(err);
		} else {
			let browsingHistory = JSON.parse(data); //now it's an object

			/* Check if browsing history is empty */
			if (browsingHistory.history.length === 0) {
				console.log("Preset not found in results in search history");
				presetResults = null;
			} else {
                let lastSearch = browsingHistory.history[-1];
				browsingHistory.presetId = lastSearch.timeSearched;

                json = JSON.stringify(browsingHistory); //convert it back to json

                // Define a callback function for writeFile
                function writeFileCallback(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("JSON data is saved.");
                    }
                }

                // Write back to file
                fs.writeFile(pathToHistory, json, "utf8", writeFileCallback);
            }
		}
	});
}
