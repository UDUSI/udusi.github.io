/**
 * about-page.js
 *
 * Modal popup functionality for the About page.
 */

window.addEventListener('load', () => {
    const modal = document.getElementById("licenseModal");
    const btn = document.getElementById("openLicenseBtn");
    const closeBtn = document.getElementsByClassName("close-modal-btn")[0];

    btn.onclick = function() {
        modal.style.display = "block";
    };

    closeBtn.onclick = function() {
        modal.style.display = "none";
    };

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };
});
