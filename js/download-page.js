// File information object with version numbers (which can't be detected automatically)
const fileInfo = {
    'udusi': {
        path: '../downloads/udusi.zip'
    },
    'udusi-combined': {
        path: '../downloads/udusi-combined.zip'
    }
};

// Function to fetch file metadata and update the display
async function fetchFileMetadata() {
    for (const [fileId, info] of Object.entries(fileInfo)) {
        try {
            const response = await fetch(info.path, { method: 'HEAD' });

            if (response.ok) {
                // Get the file size from the Content-Length header
                const size = response.headers.get('Content-Length');
                const sizeFormatted = formatFileSize(size);

                // Get the last modified date from the Last-Modified header
                const lastModified = response.headers.get('Last-Modified');
                const dateFormatted = formatDate(new Date(lastModified));

                // Update the file info object
                info.size = sizeFormatted;
                info.date = dateFormatted;

                // Update the display
                updateFileDisplay(fileId);
            } else {
                console.error(`Error fetching metadata for ${info.path}: ${response.status} ${response.statusText}`);
                // Set placeholder values if the file can't be accessed
                info.size = 'Unknown';
                info.date = 'Unknown';
                updateFileDisplay(fileId);
            }
        } catch (error) {
            console.error(`Error fetching metadata for ${info.path}:`, error);
            // Set placeholder values if an error occurs
            info.size = 'Unknown';
            info.date = 'Unknown';
            updateFileDisplay(fileId);
        }
    }
}

// Format file size into a human-readable string
function formatFileSize(bytes) {
    if (!bytes || isNaN(bytes)) return 'Unknown';

    bytes = parseInt(bytes);
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    if (i === 0) return bytes + ' ' + sizes[i];

    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}

// Format date into a nice string
function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) return 'Unknown';

    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Update the display for a specific file
function updateFileDisplay(fileId) {
    const info = fileInfo[fileId];
    const infoElement = document.getElementById(`${fileId}-info`);

    if (infoElement && info) {
        infoElement.textContent = `Size: ${info.size} | Last updated: ${info.date}`;
    }
}

// Update file version manually (size and date are automatic)
function updateFileVersion(fileId, version) {
    if (fileInfo[fileId]) {
        fileInfo[fileId].version = version;
        updateFileDisplay(fileId);
    }
}

// Initialize file info when page loads
document.addEventListener('DOMContentLoaded', function() {
    fetchFileMetadata();
});
