// Function to update the progress
function updateProgress() {
    const checkboxes = document.querySelectorAll('.topic-checkbox');
    const checkedCheckboxes = document.querySelectorAll('.topic-checkbox:checked');
    const progress = (checkedCheckboxes.length / checkboxes.length) * 100;

    // Update the progress bar width and text
    document.getElementById('progress-bar').style.width = progress + '%';
    document.getElementById('progress-text').innerText = Math.round(progress) + '% Completed';
}

// Animate progress bar on load
window.addEventListener('DOMContentLoaded', function() {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = '0%';
        setTimeout(() => {
            updateProgress();
        }, 300);
    }
    // Fade in main content
    const content = document.querySelector('.content');
    if (content) {
        content.style.opacity = 0;
        setTimeout(() => {
            content.style.opacity = 1;
        }, 200);
    }
});

// Function to toggle the visibility of dropdowns
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
        // Toggle visibility by adding/removing 'hidden' class
        dropdown.classList.toggle('hidden');
        if (!dropdown.classList.contains('hidden')) {
            dropdown.style.opacity = 0;
            dropdown.style.maxHeight = '0px';
            setTimeout(() => {
                dropdown.style.opacity = 1;
                dropdown.style.maxHeight = '500px';
            }, 10);
        } else {
            dropdown.style.opacity = 0;
            dropdown.style.maxHeight = '0px';
        }
    }
}

// --- USER-SPECIFIC CHECKBOX STATE LOGIC --

// Get current user ID from global JS variable set in EJS template
function getCurrentUserId() {
    return window.currentUserId || null;
}

// Get the localStorage key for the current user
function getUserProgressKey() {
    const userId = getCurrentUserId();
    return userId ? `progress_${userId}` : null;
}

// Load checkbox state for the current user
function loadCheckboxState() {
    const key = getUserProgressKey();
    let state = {};
    if (key) {
        try {
            state = JSON.parse(localStorage.getItem(key)) || {};
        } catch { state = {}; }
    }
    document.querySelectorAll('.topic-checkbox').forEach(function(checkbox) {
        const checkboxId = checkbox.getAttribute('data-topic');
        checkbox.checked = !!state[checkboxId];
    });
    updateProgress();
}

// Save checkbox state for the current user
function saveCheckboxState() {
    const key = getUserProgressKey();
    if (!key) return;
    const state = {};
    document.querySelectorAll('.topic-checkbox').forEach(function(checkbox) {
        const checkboxId = checkbox.getAttribute('data-topic');
        state[checkboxId] = checkbox.checked;
    });
    localStorage.setItem(key, JSON.stringify(state));
    updateProgress();
}

// Add event listener to all checkboxes to save their state when changed
document.querySelectorAll('.topic-checkbox').forEach(function(checkbox) {
    checkbox.addEventListener('change', saveCheckboxState);
});

// Load the checkbox state and update progress on page load
window.onload = function() {
    loadCheckboxState();
}

// Animate logo on hover (for non-CSS fallback)
const logo = document.querySelector('.logo');
if (logo) {
    logo.addEventListener('mouseenter', () => {
        logo.style.transform = 'scale(1.08) rotate(-2deg)';
        logo.style.color = '#6fed6f';
    });
    logo.addEventListener('mouseleave', () => {
        logo.style.transform = '';
        logo.style.color = '';
    });
}
