const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const PORT = 3000;
var fs = require('fs');
const extensionURL = 'chrome-extension://hfampifggiplieplldnfcceebhafllpm';
const pathToHistory = 'browse_data/search_history_and_results.json';

app.get('/history', async (req, res) => {
    
});

app.get('/preset', async (req, res) => {
    /* Sending response with following header to prevent blockage from CORS*/
    res.setHeader('Access-Control-Allow-Origin', extensionURL);

    console.log("Starting");

});

app.get('/search', async (req, res) => {
    /* Getting query message */
    const searchQuery = req.query.Query;
    console.log(searchQuery);

    /* Sending response with following header to prevent blockage from CORS*/
    res.setHeader('Access-Control-Allow-Origin', extensionURL);

    console.log("Starting");

    const browser = await puppeteer.launch({ headless: true });

    console.log("Browser opened");

    const page = await browser.newPage();

    console.log("Page opened");

    let isContentLoaded = false;

    console.log("Searching...");

    while (!isContentLoaded) {
        try {
            await page.goto('https://www.youtube.com');
            await page.type('input[name="search_query"]', searchQuery);
            await page.click('button#search-icon-legacy');

            await page.waitForSelector('#video-title');

            console.log("Content Loaded");

            const videoTitles = await page.evaluate(() => {
                const titles = Array.from(document.querySelectorAll('#video-title'));
                return titles.map(t => [t.innerText, t.getAttribute('aria-label'), t.href]);                
            });        

            console.log("Video titles added:");

            console.log(videoTitles);

            await browser.close();

            console.log("Browser closed");

            res.json(videoTitles);

            console.log("Titles sent successfully");

            isContentLoaded = true;

            /* Write contents to browsing history file */
            // fs.readFile(pathToHistory, 'utf8', function readFileCallback(err, data){
            //     if (err){
            //         console.log(err);
            //     } else {
            //         let browsingHistory = JSON.parse(data); //now it's an object

            //         /* Check if browsing history is empty */
            //         if (browsingHistory.history[0].query === null || browsingHistory.history.length === 0) {
            //             console.log("No search resuls in search history");
            //             browsingHistory.history.shift();
            //         }

            //         browsingHistory.history.push({
            //             query: searchQuery, 
            //             result: videoTitles,
            //             dateSearched: Date.now()
            //         }); //add some data

            //         json = JSON.stringify(browsingHistory); //convert it back to json

            //         // Define a callback function for writeFile
            //         function writeFileCallback(err) {
            //             if (err) {
            //                 console.log(err);
            //             } else {
            //                 console.log('JSON data is saved.');
            //             }
            //         }

            //         fs.writeFile(pathToHistory, json, 'utf8', writeFileCallback); // write it back 
            //     }
            // });

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