// Function to update the UI with last updated information
function updateLastUpdatedUI(date, file) {
    const lastUpdatedElement = document.getElementById('last-updated-info');
    
    if (!lastUpdatedElement) {
        console.error('Last updated element not found in the DOM');
        return;
    }
    
    if (date) {
        const formattedDate = formatDate(date);
        lastUpdatedElement.textContent = `Last updated: ${formattedDate}`;
        lastUpdatedElement.title = `Most recently modified file: ${file}`;
    } else {
        lastUpdatedElement.textContent = 'Last updated: Unknown';
    }
}

// Format date into a readable string (reused from download-page.js)
function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) return 'Unknown';

    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Implementation for GitHub Pages using HEAD requests
// This is the recommended approach for static hosting like GitHub Pages
async function checkLastUpdatedViaHeadRequests() {
    // List of important files to check - optimized for GitHub Pages
    // These are the files you want to track for the "last updated" info
    const filesToCheck = [
        'pages/base-units.html',
        'pages/constants.html',
        'pages/prefixes.html',
        'pages/special-units.html',
        'pages/nonsi-units.html',
        'pages/udu-common-units.html',
        'pages/about-page.html',
        'downloads/udusi.zip',
        'downloads/udusi-combined.zip'
    ];
    
    let mostRecentDate = null;
    let mostRecentFile = '';
    let successfulChecks = 0;
    
    // Add a timestamp to prevent caching of HEAD requests
    const cacheBuster = `?_=${new Date().getTime()}`;
    
    // Process files in parallel for better performance
    const promises = filesToCheck.map(async (filePath) => {
        try {
            // Add cache buster to ensure we get the correct Last-Modified date
            const response = await fetch(`${filePath}${cacheBuster}`, { 
                method: 'HEAD',
                // Handling CORS issues that might occur on GitHub Pages
                credentials: 'same-origin'
            });
            
            if (response.ok) {
                successfulChecks++;
                const lastModified = response.headers.get('Last-Modified');
                
                if (lastModified) {
                    const fileDate = new Date(lastModified);
                    return { path: filePath, date: fileDate };
                }
            }
            return null;
        } catch (error) {
            console.error(`Error checking file ${filePath}:`, error);
            return null;
        }
    });
    
    // Wait for all requests to complete
    const results = await Promise.all(promises);
    
    // Find the most recent file from the results
    results.forEach(result => {
        if (result && (!mostRecentDate || result.date > mostRecentDate)) {
            mostRecentDate = result.date;
            mostRecentFile = result.path;
        }
    });
    
    // Update the UI with the last updated info
    updateLastUpdatedUI(mostRecentDate, mostRecentFile);
    
    // Log success rate for debugging
    console.log(`Successfully checked ${successfulChecks} of ${filesToCheck.length} files`);
    
    // If GitHub Pages is having issues with HEAD requests, try fallback method
    if (successfulChecks === 0) {
        console.log("All HEAD requests failed. GitHub Pages might be restricting them.");
        useFallbackUpdateMethod();
    }
}

// Fallback method if GitHub Pages blocks HEAD requests
function useFallbackUpdateMethod() {
    // Use a pre-defined date or fetch it from a special file
    // For example, you could maintain a last-updated.json file with the date
    fetch('last-updated.json')
        .then(response => response.json())
        .then(data => {
            if (data.lastUpdated) {
                const date = new Date(data.lastUpdated);
                updateLastUpdatedUI(date, 'last-updated.json');
            }
        })
        .catch(error => {
            console.error('Fallback method failed:', error);
            // Use build date as absolute fallback
            const buildDate = new Date(document.lastModified);
            updateLastUpdatedUI(buildDate, 'document.lastModified');
        });
}

// Initialize the last updated info when the page loads
document.addEventListener('DOMContentLoaded', function() {
    checkLastUpdatedViaHeadRequests();
});
