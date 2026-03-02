/**
 * Unit search functionality for UDUSI.
 *
 * - Lookup table is fetched lazily on first activation.
 * - Filters keys by prefix (case-sensitive) or substring, showing up to 5 results.
 * - On selection, loads the correct page into the iframe and scrolls to the unit card.
 * - Updates the active nav button to match the loaded page.
 */

(function () {
    'use strict';

    const MAX_RESULTS = 10;
    const LOOKUP_URL = 'lookup.json';

    let lookup = null;       // null = not yet fetched
    let fetchPromise = null; // avoid duplicate fetches

    // --- DOM refs (populated in init) ---
    let toggleBtn, overlay, searchInput, closeBtn, dropdown, iframe, navList;

    // ---------------------------------------------------------------------------
    // Lookup loading
    // ---------------------------------------------------------------------------

    function ensureLookup() {
        if (lookup !== null) return Promise.resolve(lookup);
        if (fetchPromise) return fetchPromise;

        fetchPromise = fetch(LOOKUP_URL)
            .then(r => {
                if (!r.ok) throw new Error(`Failed to fetch ${LOOKUP_URL}: ${r.status}`);
                return r.json();
            })
            .then(data => {
                lookup = data;
                return lookup;
            })
            .catch(err => {
                console.error('UDUSI search: could not load lookup.json', err);
                lookup = {};
                return lookup;
            });

        return fetchPromise;
    }

    // ---------------------------------------------------------------------------
    // Filtering
    // ---------------------------------------------------------------------------

    function getMatches(query) {
        if (!query || !lookup) return [];

        const results = [];

        // First pass: keys that start with the query (prefix matches, case-sensitive)
        for (const key of Object.keys(lookup)) {
            if (key.startsWith(query)) {
                results.push(key);
                if (results.length >= MAX_RESULTS) return results;
            }
        }

        // Second pass: substring matches not already included
        if (results.length < MAX_RESULTS) {
            for (const key of Object.keys(lookup)) {
                if (!key.startsWith(query) && key.includes(query)) {
                    results.push(key);
                    if (results.length >= MAX_RESULTS) return results;
                }
            }
        }

        return results;
    }

    // ---------------------------------------------------------------------------
    // Dropdown rendering
    // ---------------------------------------------------------------------------

    function showDropdown(matches, totalCount) {
        dropdown.innerHTML = '';
        const ul = document.createElement('ul');

        if (matches.length === 0) {
            const li = document.createElement('li');
            li.className = 'search-hint';
            li.textContent = 'No matches found';
            ul.appendChild(li);
        } else {
            matches.forEach((key, idx) => {
                const li = document.createElement('li');
                li.textContent = key;
                li.dataset.key = key;
                li.addEventListener('mousedown', (e) => {
                    // Use mousedown so it fires before the input blur event
                    e.preventDefault();
                    selectResult(key);
                });
                ul.appendChild(li);
            });

            if (totalCount > MAX_RESULTS) {
                const hint = document.createElement('li');
                hint.className = 'search-hint';
                hint.textContent = `…and ${totalCount - MAX_RESULTS} more — keep typing`;
                ul.appendChild(hint);
            }
        }

        dropdown.appendChild(ul);
        dropdown.classList.add('active');
    }

    function hideDropdown() {
        dropdown.classList.remove('active');
        dropdown.innerHTML = '';
        highlightedIndex = -1;
    }

    // ---------------------------------------------------------------------------
    // Keyboard navigation within dropdown
    // ---------------------------------------------------------------------------

    let highlightedIndex = -1;

    function getItems() {
        return Array.from(dropdown.querySelectorAll('li:not(.search-hint)'));
    }

    function setHighlight(index) {
        const items = getItems();
        items.forEach(li => li.classList.remove('highlighted'));
        if (index >= 0 && index < items.length) {
            items[index].classList.add('highlighted');
            highlightedIndex = index;
        } else {
            highlightedIndex = -1;
        }
    }

    // ---------------------------------------------------------------------------
    // Navigation to result
    // ---------------------------------------------------------------------------

    function selectResult(key) {
        const entry = lookup[key];
        if (!entry) return;

        const { page, anchor } = entry;
        const targetSrc = `pages/${page}#${anchor}`;
        const currentSrc = iframe.src; // full absolute URL

        // Check if the correct page is already loaded (compare pathname)
        const targetPath = `pages/${page}`;
        const alreadyLoaded = currentSrc.endsWith(targetPath) ||
            currentSrc.includes(`/${targetPath}`);

        if (alreadyLoaded) {
            // Just update the hash — no reload
            try {
                iframe.contentWindow.location.hash = anchor;
            } catch (e) {
                // Cross-origin fallback (shouldn't happen on same origin)
                iframe.src = targetSrc;
            }
        } else {
            // Need to load a different page
            if (typeof loadContent === 'function') {
                loadContent(targetSrc);
            } else {
                iframe.src = targetSrc;
            }
        }

        // Update active nav button
        updateActiveNav(targetPath);

        closeSearch();
    }

    function updateActiveNav(targetPath) {
        navList.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.page === targetPath) {
                btn.classList.add('active');
            }
        });
    }

    // ---------------------------------------------------------------------------
    // Open / close overlay
    // ---------------------------------------------------------------------------

    function openSearch() {
        overlay.classList.add('active');
        searchInput.value = '';
        searchInput.focus();
        ensureLookup(); // start fetch early if not done yet
    }

    function closeSearch() {
        overlay.classList.remove('active');
        hideDropdown();
        searchInput.value = '';
    }

    // ---------------------------------------------------------------------------
    // Event wiring
    // ---------------------------------------------------------------------------

    function onInput() {
        const query = searchInput.value;
        if (!query) {
            hideDropdown();
            return;
        }

        ensureLookup().then(() => {
            // Count all matches for the "and N more" hint
            let totalCount = 0;
            for (const key of Object.keys(lookup)) {
                if (key.startsWith(query) || key.includes(query)) totalCount++;
            }

            const matches = getMatches(query);
            if (matches.length > 0 || query.length > 0) {
                showDropdown(matches, totalCount);
            } else {
                hideDropdown();
            }
        });
    }

    function onKeydown(e) {
        const items = getItems();

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlight(Math.min(highlightedIndex + 1, items.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlight(Math.max(highlightedIndex - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && items[highlightedIndex]) {
                    selectResult(items[highlightedIndex].dataset.key);
                } else if (items.length === 1) {
                    selectResult(items[0].dataset.key);
                }
                break;
            case 'Escape':
                closeSearch();
                break;
        }
    }

    // ---------------------------------------------------------------------------
    // Init
    // ---------------------------------------------------------------------------

    document.addEventListener('DOMContentLoaded', () => {
        toggleBtn   = document.getElementById('search-toggle-btn');
        overlay     = document.getElementById('search-overlay');
        searchInput = document.getElementById('search-input');
        closeBtn    = document.getElementById('search-close-btn');
        dropdown    = document.getElementById('search-dropdown');
        iframe      = document.getElementById('content-container');
        navList     = document.querySelector('.nav-list');

        if (!toggleBtn || !overlay || !searchInput) {
            console.warn('UDUSI search: required elements not found in DOM');
            return;
        }

        toggleBtn.addEventListener('click', openSearch);
        closeBtn.addEventListener('click', closeSearch);
        searchInput.addEventListener('input', onInput);
        searchInput.addEventListener('keydown', onKeydown);

        // Close on click outside overlay and dropdown
        document.addEventListener('mousedown', (e) => {
            if (overlay.classList.contains('active') &&
                !overlay.contains(e.target) &&
                !dropdown.contains(e.target) &&
                e.target !== toggleBtn) {
                closeSearch();
            }
        });
    });

})();
