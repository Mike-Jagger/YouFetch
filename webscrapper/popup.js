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

    // Add triggers once search is done loading
    document.getElementById("searchButton").addEventListener('click', launchSearch);
    document.getElementById('searchBar').addEventListener('keydown', handleEnterPress);
}

// Load skeleton on launch
loadSkeleton();

// Starting the extension
document.addEventListener('DOMContentLoaded', async function() {
    const response = await fetch('http://localhost:3000/preset?SetPreset=false');

    const preset = await response.json();

    const searchValue = preset[0];
    const videoTitles = preset[1];

    if (videoTitles !== null) {
        const resultsElement = document.getElementById('mainContent');

        resultsElement.innerHTML = '';

        videoTitles.forEach(title => {
            document.getElementById('searchBar').value = searchValue;
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
});

// Trigger to search results
document.getElementById("searchButton").addEventListener('click', launchSearch);

// Check if enter is pressed when searching
document.getElementById('searchBar').addEventListener('keydown', handleEnterPress);

// Displayinng the footer
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