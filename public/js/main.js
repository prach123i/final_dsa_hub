// Function to update the progress
function updateProgress() {
    const checkboxes = document.querySelectorAll('.topic-checkbox');
    const checkedCheckboxes = document.querySelectorAll('.topic-checkbox:checked');
    const progress = (checkedCheckboxes.length / checkboxes.length) * 100;

    // Update the progress bar width and text
    document.getElementById('progress-bar').style.width = progress + '%';
    document.getElementById('progress-text').innerText = Math.round(progress) + '% Completed';
}

// Function to toggle the visibility of dropdowns
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
        // Toggle visibility by adding/removing 'hidden' class
        dropdown.classList.toggle('hidden');
    }
}


// Function to load the checkbox state from localStorage
function loadCheckboxState() {
    const checkboxes = document.querySelectorAll('.topic-checkbox');
    checkboxes.forEach(function(checkbox) {
        const checkboxId = checkbox.getAttribute('data-topic');
        const isChecked = localStorage.getItem(checkboxId) === 'true';
        checkbox.checked = isChecked;
    });

    // Update the progress bar after loading the checkbox state
    updateProgress();
}

// Function to save the checkbox state to localStorage
function saveCheckboxState() {
    const checkboxes = document.querySelectorAll('.topic-checkbox');
    checkboxes.forEach(function(checkbox) {
        const checkboxId = checkbox.getAttribute('data-topic');
        localStorage.setItem(checkboxId, checkbox.checked);
    });

    // Update the progress bar after saving the state
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
