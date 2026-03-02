/**
 * iframe-redirect.js
 *
 * Included by all unit pages (pages/*.html).
 *
 * If a unit page is opened directly in the browser (not embedded in the
 * index.html iframe), redirect to index.html and pass the requested page
 * and anchor as a query parameter so index.html can load and scroll to it.
 *
 * Direct link example:
 *   pages/base-units.html#ampere
 * Redirects to:
 *   ../index.html?page=pages/base-units.html#ampere
 */

(function () {
    'use strict';

    if (window.self !== window.top) {
        // Running inside an iframe — normal operation, do nothing.
        return;
    }

    // Derive "pages/<filename>" from the current URL path.
    const parts = location.pathname.split('/');
    const filename = parts[parts.length - 1];          // e.g. "base-units.html"
    const dir = parts[parts.length - 2] || 'pages';    // e.g. "pages"
    const pagePath = dir + '/' + filename;             // e.g. "pages/base-units.html"

    // Preserve the fragment (anchor) if present.
    const hash = location.hash;                        // e.g. "#ampere", or ""

    // Redirect to index.html one level up, passing page + anchor as query param.
    location.replace('../index.html?page=' + encodeURIComponent(pagePath) + hash);
})();
