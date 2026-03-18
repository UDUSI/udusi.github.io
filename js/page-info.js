/**
 * page-info.js
 *
 * Included by all pages (pages/*.html).
 *
 * When the page is loaded inside the index.html iframe, sends the page
 * title and provenance data to the parent frame via postMessage so the
 * parent can update the subtitle and provenance panel.
 */

window.addEventListener('load', () => {
    window.parent.postMessage({
        type: 'page-info',
        title: document.title,
        provenance: document.getElementById('provenance-data')?.innerHTML || ''
    }, '*');
});
