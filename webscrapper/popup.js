/****  Starting the extension ****/

document.addEventListener('DOMContentLoaded', async function() {
    // Load skeleton on launch
    loadSkeleton();

    const response = await fetch('http://localhost:3000/preset?SetPreset=false');

    const preset = await response.json();

    const searchValue = preset[0];
    const videoTitles = preset[1];

    document.getElementById('searchBar').value = searchValue;

    loadContents(videoTitles);
});

/**** Launch Search ****/

// Check search button is clicked
document.getElementById("searchButton").addEventListener('click', launchSearch);

// Check if enter is pressed
document.getElementById('searchBar').addEventListener('keydown', handleEnterPress);

/**** Menu Bar triggers ****/

// Activate menu bar
var isFooterDisplayed = false; // variable to check if button is clicked
document.getElementById("displayFooter").addEventListener('click', function() {
        const footer = document.getElementById("footer"); // Get footer element
        
        // Display footer if not displayed
        if (!isFooterDisplayed) {
            isFooterDisplayed = true;
            footer.style.bottom = "0px";

        // Hide footer if displayed
        } else {
            footer.style.bottom = "-280px";
            isFooterDisplayed = false;
        }
});


// Handle managing setPreset button
let cancel = false;
document.getElementById("setPreset").addEventListener('click', async function() {
    // Button to monitor 
    let setPresetButton = document.getElementById("setPreset");

    // Manage setting preset
    if (!cancel) {
        responseStatus = await handleButtonOnStatus(
                    setPresetButton,
                    "http://localhost:3000/preset?SetPreset=true&&Cancel=false", 
                    [
                        "Processing...",
                        "Cancel Preseting",
                        "Failed Preseting",
                        "Set Preset"
                    ],
                    "setPreset"
                );

        // Switch to cancel preseting if operation was successful
        cancel = responseStatus ? true : false;
        console.log("Setting successful?", cancel);

    // Manage cancelling preset
    } else {
        responseStatus = await handleButtonOnStatus(
                    setPresetButton,
                    "http://localhost:3000/preset?SetPreset=true&&Cancel=true", 
                    [
                        "Processing...",
                        "Set Preset",
                        "Failed Cancelling",
                        "Cancel Preset"
                    ],
                    "cancelPreset"
                );

        // Switch to set preset if operation was successful
        cancel = responseStatus ? false : true;
        console.log("Cancel successful?", cancel);
    }
});

// Handle viewing history
let viewHistory = false;
document.getElementById("viewHistory").addEventListener('click', async function() {
    // Button to monitor 
    let viewHistoryButton = document.getElementById("viewHistory");

    // Manage showing history
    if (!viewHistory) {
        responseStatus = await handleButtonOnStatus(
                        viewHistoryButton,
                        "http://localhost:3000/history", 
                        [
                            "Processing...",
                            "Hide History",
                            "Loading Failed",
                            "View History"
                        ],
                        "viewHistory"
                    );

        // Switch to hide history if operation was successful
        viewHistory = responseStatus.status ? true : false;
        console.log("View history off?", viewHistory);

        // Turn on dark mode on successful fetch
        if (viewHistory) {
            document.getElementById("footerMenu").style.backgroundColor = "#282828";
            document.getElementById("history").style.backgroundColor = "#3c3c3cc4";
        }

    // Manage hiding history
    } else {
        // Turn button back to View History
        viewHistoryButton.className = "footer-button";
        viewHistoryButton.textContent = "View History";

        // Empty history
        document.getElementById('history').innerHTML = '';
        viewHistory = false;

        // Turn off dark mode
        document.getElementById("footerMenu").style.backgroundColor = "#f3f4f7";
        document.getElementById("history").style.backgroundColor = "#fff";

    }
});


/**** Helper functions ****/

// Load contents
function loadContents(videoTitles) {
    if (videoTitles !== null) {
        const resultsElement = document.getElementById('mainContent');

        resultsElement.innerHTML = '';

        videoTitles.forEach(title => {
            
            let youtubeTitle = document.createElement('div');
            youtubeTitle.className = 'youtube-title';

            let anchor = document.createElement('a');

            anchor.className = 'actual-content';
            anchor.innerHTML = (title[2] !== null) ? title[0].slice(0, 66) : title[0].slice(0, 50) + ' [No link]';
            anchor.href = title[2];
            anchor.title = title[1] || 'No description available';
            anchor.target = '_blank';

            youtubeTitle.appendChild(anchor);
            
            resultsElement.appendChild(youtubeTitle);
        });
    }
}

// Load skeleton
function loadSkeleton() {
    const grid = document.querySelector('div.main-content');

    let skeletonCard = document.createElement('div');
    skeletonCard.className = 'youtube-title skeleton';
    skeletonCard.id = 'skeletonTemplate';

    let skeletonText = document.createElement('div');
    skeletonText.className = 'skeleton-text';
    let lastSkeletonText = skeletonText.cloneNode(true);

    skeletonCard.appendChild(skeletonText);
    skeletonCard.appendChild(lastSkeletonText);

    const cardTemplate = skeletonCard;
    for (let i = 0; i < 10; i++) {
        grid.append(cardTemplate.cloneNode(true));
    }
}

// Handle when button Enter is pressed
function handleEnterPress(event) {
    // Check if the key pressed is the Enter key
    if (event.key === 'Enter' && !event.repeat) {
        event.preventDefault();
        launchSearch();
    }
}

// Launch search
async function launchSearch() {
    // Block search from being initiated again by pressing enter or search button
    document.getElementById("searchButton").removeEventListener('click', launchSearch);
    document.getElementById('searchBar').removeEventListener('keydown', handleEnterPress);

    const resultsElement = document.getElementById('mainContent');

    resultsElement.innerHTML = '';

    loadSkeleton();

    const searchQuery = document.getElementById('searchBar').value;
    const response = await fetch(`http://localhost:3000/search?Query=${searchQuery}`);
    const videoTitles = await response.json();

    loadContents(videoTitles);

    // Add triggers once search is done loading
    document.getElementById("searchButton").addEventListener('click', launchSearch);
    document.getElementById('searchBar').addEventListener('keydown', handleEnterPress);
}

// Handle button on status
async function handleButtonOnStatus(button, requestURL, messages, buttonName) {
    // Start logic
    button.className = "footer-button loading"
    button.textContent = messages[0];

    let requestMessage;
    let status;

    // Request to server
    await fetch(requestURL)
        .then(async response => {
            // Get confirmation message from server
            requestMessage = await response.json();   
        })
        .then(data => {
            //Confirm operation was successful and display server message
            button.className = "footer-button successful";
            button.textContent = requestMessage.message;
            status = true;

            // Turn button to next state
            setTimeout(() => {
                //Assign class based on button name
                let className;
                switch (buttonName) {
                    case "setPreset":
                        className = "footer-button cancel";
                        break;
                    case "cancelPreset":
                        className = "footer-button";
                        break;
                    case "viewHistory":
                        className = "footer-button hide-history";
                        break;
                }

                button.className = className;
                button.textContent = messages[1];
            }, 2000);  // Wait for 2 seconds

        })
        .catch(error => {
            // Revert button to previous state on error
            console.error('Error:', error);

            // Turn button to failed load
            button.className = "footer-button failed";
            button.textContent = messages[2];
            status = false;

            // Turn button back original state
            setTimeout( () => {
                if (buttonName === "cancelPreset") {
                    button.className = "footer-button cancel";
                } else {
                    button.className = "footer-button";
                }
                button.textContent = messages[3];
            }, 2000);
            
        });

    if (buttonName === "viewHistory") {
        return {
            status: status, 
            history: requestMessage.history
        };
    }
    return status;
}