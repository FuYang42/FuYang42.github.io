// Theme Switcher Script
(function() {
  'use strict';

  const THEME_KEY = 'preferred-theme';
  const DEFAULT_THEME = 'sepia';

  // Get saved theme or use default
  function getSavedTheme() {
    return localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
  }

  // Save theme preference
  function saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
  }

  // Apply theme to document
  function applyTheme(theme) {
    const root = document.documentElement;

    if (theme === 'sepia') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }

    // Update active button state
    updateActiveButton(theme);
  }

  // Update active button styling
  function updateActiveButton(theme) {
    const buttons = document.querySelectorAll('.theme-btn');
    buttons.forEach(btn => {
      if (btn.dataset.theme === theme) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Initialize theme on page load
  function initTheme() {
    const savedTheme = getSavedTheme();
    applyTheme(savedTheme);
  }

  // Set up theme switcher buttons
  function setupThemeSwitcher() {
    const buttons = document.querySelectorAll('.theme-btn');

    buttons.forEach(button => {
      button.addEventListener('click', function() {
        const theme = this.dataset.theme;
        applyTheme(theme);
        saveTheme(theme);
      });
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initTheme();
      setupThemeSwitcher();
    });
  } else {
    initTheme();
    setupThemeSwitcher();
  }

})();
