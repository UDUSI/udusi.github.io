// Keyboard navigation for the menu
document.addEventListener('DOMContentLoaded', () => {
    // Get all menu buttons
    const menuButtons = Array.from(document.querySelectorAll('.nav-list button'));
    
    // Skip non-button elements like nav-subtitle divs
    const focusableButtons = menuButtons.filter(el => el.tagName === 'BUTTON');
    
    // Add tabindex to all buttons to make them focusable
    focusableButtons.forEach(button => {
        button.setAttribute('tabindex', '0');
    });
    
    // Track the currently focused button index
    let currentFocusIndex = focusableButtons.findIndex(btn => btn.classList.contains('active'));
    if (currentFocusIndex === -1) currentFocusIndex = 0;
    
    // Initialize keyboard navigation by setting tabindex=0 on the active button
    // and tabindex=-1 on all others (following proper focus management)
    focusableButtons.forEach((button, index) => {
        if (index === currentFocusIndex) {
            button.setAttribute('tabindex', '0');
        } else {
            button.setAttribute('tabindex', '-1');
        }
    });
    
    // Force initial focus to enable keyboard nav immediately
    window.addEventListener('load', () => {
        // Small delay to ensure DOM is fully ready
        setTimeout(() => {
            // Only auto-focus in response to a keyboard event
            // This prevents auto-focus but enables immediate keyboard navigation
            document.addEventListener('keydown', function initFocus(e) {
                if (e.key === 'Tab' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    focusableButtons[currentFocusIndex].focus();
                    document.removeEventListener('keydown', initFocus);
                }
            });
        }, 100);
    });
    
    // Function to navigate to a specific button
    function navigateToButton(index) {
        // Keep index in bounds
        if (index < 0) index = focusableButtons.length - 1;
        if (index >= focusableButtons.length) index = 0;
        
        // Update focus
        currentFocusIndex = index;
        
        // Update tabindex values - set -1 on all except current
        focusableButtons.forEach((button, idx) => {
            button.setAttribute('tabindex', idx === currentFocusIndex ? '0' : '-1');
        });
        
        // Focus the current button
        focusableButtons[currentFocusIndex].focus();
    }
    
    // Function to activate the currently focused button
    function activateCurrentButton() {
        const button = focusableButtons[currentFocusIndex];
        
        // Remove active class from all buttons
        menuButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to the current button
        button.classList.add('active');
        
        // Load the corresponding content
        if (button.dataset.page) {
            loadContent(button.dataset.page);
        }
    }
    
    // Handle keyboard events on the document
    document.addEventListener('keydown', (e) => {
        // Only handle keyboard navigation when a menu button has focus
        const activeElement = document.activeElement;
        if (!focusableButtons.includes(activeElement)) return;
        
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                navigateToButton(currentFocusIndex - 1);
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                navigateToButton(currentFocusIndex + 1);
                break;
                
            case 'Enter':
            case ' ': // Space key
                e.preventDefault();
                activateCurrentButton();
                break;
                
            case 'Home':
                e.preventDefault();
                navigateToButton(0);
                break;
                
            case 'End':
                e.preventDefault();
                navigateToButton(focusableButtons.length - 1);
                break;
        }
    });
    
    // Add focus handling to buttons
    focusableButtons.forEach((button, index) => {
        // Update current index when a button is focused directly (e.g., with Tab key)
        button.addEventListener('focus', () => {
            currentFocusIndex = index;
        });
    });
});
