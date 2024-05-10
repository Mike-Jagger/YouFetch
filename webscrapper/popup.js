/* Starting the extension */

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

/* Launch Search */

// Check search button is clicked
document.getElementById("searchButton").addEventListener('click', launchSearch);

// Check if enter is pressed
document.getElementById('searchBar').addEventListener('keydown', handleEnterPress);

/* Menu Bar triggers */

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


// Set current search results as preset
let cancel = false;
document.getElementById("setPreset").addEventListener('click', async function() {
    // Change 
    setPresetButton = document.getElementById("setPreset");

    // Disable the setPresetButton
    if (!cancel) {
        //setPresetButton.disabled = true;
        setPresetButton.className = "footer-button preseting-loading"
        setPresetButton.textContent = "Processing...";

        // Simulate a request to the server
        await fetch("http://localhost:3000/preset?SetPreset=true")
            .then(response => {
                setPresetButton.textContent = response.json().message;
            })
            .then(data => {
                // Simulate processing delay
                setPresetButton.className = "footer-button preseting-successful"
                setPresetButton.textContent = "Preset successfully set";

                setTimeout(() => {
                    setPresetButton.textContent = "Cancel Preseting";
                    setPresetButton.className = "footer-button cancel";
                }, 2000);  // Wait for 2 seconds
                cancel = true;
            })
            .catch(error => {
                console.error('Error:', error);
                setPresetButton.textContent = "Failed Preseting";
                //setPresetButton.disabled = false;  // Re-enable the setPresetButton
            });
    }

    
});


/* Helper functions */

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