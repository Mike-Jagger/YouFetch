# YouFetch (1.0.0)

## Overview
Version: 1.0.0
The YouTube Search Results extension allows users to perform YouTube searches directly from the extension popup, view and set search presets, and manage their search history. This documentation provides detailed information on the features, usage, and development setup of the extension.

## Features
- **Search YouTube Videos:** Perform searches directly from the extension and view results within the popup.
- **Set Search Presets:** Save your last search as a preset and easily revert to previous presets.
- **View Search History:** View your past searches and their results.
- **Responsive UI:** The extension offers a responsive and user-friendly interface.

## Installation
To install the YouTube Search Results extension:
1. Clone the repository:
    ``` bash
    git clone https://github.com/Mike-Jagger/YouFetch
    ```
2. Navigate to the `webscrapper` directory.
3. Load the extension in Chrome:
    - Open Chrome and go to [chrome://extensions/](chrome://extensions/).
    - Enable "Developer mode" in the top right corner.
    - Click "Load unpacked" and select the webscrapper directory.

## Usage
### Performing a Search
1. Open the extension popup.
2. Enter a search query in the search bar.
3. Click the search button or press Enter.
4. The search results will be displayed in the popup

### Canceling a Search Preset
1. If a preset is set, click the "Cancel Preseting" button.
2. The button will display "Processing..." and then revert to "Set Preset" if successful.

### Viewing Search History
1. Click the "View History" button.
2. The extension will fetch and display your search history.
3. Click "Hide History" to collapse the history section.


## Project Structure
``` bash
.
├── browse_data
│   └── search_history_and_results.json
├── Demos
│   └── demo1.gif
├── node_modules
│   ├── ... (Node.js dependencies)
├── webscrapper
│   ├── icons
│   │   ├── icon16.png
│   │   └── icon48.png
│   ├── manifest.json
│   ├── popup.css
│   ├── popup.html
│   ├── popup.js
├── .gitignore
├── LICENSE
├── package-lock.json
├── package.json
├── README.md
├── searchYoutube.js
└── Task_List.txt
```

## Dependencies
- **Express:** Web framework for Node.js.
- **Puppeteer:** Headless Chrome Node.js API for web scraping and automation.

To install dependencies, run:
``` bash
npm install
```
## Development
This section provides detailed explanations of each file in the project, their purpose, and key code snippets to help developers understand the structure and functionality of the extension.

### browse_data/search_history_and_results.json:
- **Purpose:** Stores the search history and results.
- **Content:**
    ``` json
    {
        "history": [
            {
                "query": "example search",
                "result": [["Video Title", "Video Description", "Video URL"]],
                "timeSearched": 1620000000000
            }
        ],
        "presetId": null
    }
    ```
- **Usage:** Used by the backend to save and load search history and presets.

### Demos/demo1.gif
- **Purpose:** A demo GIF showing the extension in action.
- **Usage:** Useful for visual documentation and showcasing the extension's functionality.

### node_modules/
- **Purpose:** Contains all Node.js dependencies.
- **Usage:** Automatically generated by npm when running npm install.

### webscrapper/
- **Purpose:** Main directory containing the extension files.
- **Files:**
    - **Icons/:** Contains the icons for the extension.
        - icon16.png: 16x16 icon for the toolbar.
        - icon48.png: 48x48 icon for other UI elements.
    - **manifest.json:** Defines the extension's metadata, permissions, and main components
        ``` json
        {
            "manifest_version": 3,
            "name": "YouTube Search Results",
            "version": "3",
            "permissions": ["activeTab", "tabs"],
            "action": {
                "default_popup": "popup.html",
                "default_icon": "icons/icon16.png"
            },
            "icons": {
                "16": "icons/icon16.png",
                "48": "icons/icon48.png"
            }
        }
        ```
    - **popup.css:** Contains the styles for the popup interface.
        ``` css
        .search-container {
            display: flex;
            align-items: center;
        }
        .search-input {
            width: 80%;
            padding: 8px;
        }
        .search-button {
            width: 20%;
            cursor: pointer;
        }
        ```
    - **popup.html:** Defines the structure of the extension's popup interface.
        ``` html
        <div class="search-container">
            <input type="text" id="searchBar" placeholder="Search" class="search-input">
            <button id="searchButton" class="search-button">
                <!-- SVG Icon for search -->
            </button>
        </div>
        ```
    - **popup.js:** Contains the JavaScript logic for the popup interface.
        ``` js
        document.addEventListener('DOMContentLoaded', async function() {
            loadSkeleton();
            const response = await fetch('http://localhost:3000/preset?SetPreset=false');
            const preset = await response.json();
            document.getElementById('searchBar').value = preset[0];
            loadContents(preset[1]);
        });

        document.getElementById("searchButton").addEventListener('click', launchSearch);
        document.getElementById('searchBar').addEventListener('keydown', handleEnterPress);
        ```
### searchYoutube.js
**Purpose**: Implements the backend server for handling YouTube searches, managing presets, and maintaining search history.
``` js
const puppeteer = require("puppeteer");
const express = require("express");
const app = express();
const PORT = 3000;

app.get("/search", async (req, res) => {
    const searchQuery = req.query.Query;
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://www.youtube.com");
    await page.type('input[name="search_query"]', searchQuery);
    await page.click("button#search-icon-legacy");
    await page.waitForSelector("#video-title");
    const videoTitles = await page.evaluate(() => {
        const titles = Array.from(document.querySelectorAll("#video-title"));
        return titles.map(t => [t.innerText, t.getAttribute("aria-label"), t.href]);
    });
    await browser.close();
    res.json(videoTitles);
});

app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log(`Server running on http://localhost:${PORT}`);
});
```
### Task_List.txt
**Purpose:** Contains a list of tasks and features, organized in a Kanban board style. It was used as the testing framework for unit testing during development.
``` txt
To Do:
- Implement search feature
- Add preset functionality

In Progress:
- Integrate Puppeteer with backend

Done:
- Create basic UI for popup
- Set up Express server
```
**Explanation:**
- **To Do:** This section lists tasks that need to be completed. It includes features or bug fixes that are planned but not yet started.
- **In Progress:** This section tracks tasks that are currently being worked on. It helps in understanding the current focus and workload.
- **Done:** This section includes tasks that have been completed. It serves as a record of progress and accomplishments.

## Demo
Here is a demo of the extension in action:
![](https://github.com/Mike-Jagger/YouFetch/blob/main/Demos/demo1.gif)

You can also view the design on Canva using this [link](https://www.canva.com/design/DAGEm-7s6lo/YYPz2w9HZcPzxKjpuLRfUw/edit?utm_content=DAGEm-7s6lo&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton).

## Testing
**Unit Testing**: The tasks and features listed in the [Kanban board](https://www.figma.com/board/L7wDKDxPugZ3aMLXLRre0P/YouFetch?t=Y70IPMqby1BIO1up-1) also serve as the basis for unit testing. Each task represents a unit of functionality that should be tested individually.<br>

**Example Test Cases**
- Search Feature:
    - Test that the search bar correctly accepts input.
    - Verify that clicking the search button triggers the search.
    - Ensure that search results are displayed correctly.
- Preset Functionality:
    - Test setting a preset with the current search.
    - Verify that the preset can be canceled and reverted to the previous preset.
    - Ensure that the preset is correctly loaded on extension launch.
- Backend Integration:
    - Test the `/search` endpoint to ensure it correctly fetches and returns search results from YouTube.
    - Verify that the `/preset` endpoint correctly handles setting, canceling, and retrieving presets.
    - Ensure that the search history is correctly saved and loaded from the `search_history_and_results.json` file.

## Conclusion
The YouTube Search Results extension provides a seamless way to search YouTube, set presets, and manage search history all from within a Chrome extension. With a simple setup and an intuitive interface, it aims to enhance your browsing experience. For any questions or contributions, feel free to reach out or submit a pull request.