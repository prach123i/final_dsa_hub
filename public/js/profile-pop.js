
function toggleProfileMenu() {
    var menu = document.getElementById("profile-menu");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  }

  // Close menu when clicking outside
  document.addEventListener("click", function(event) {
    var profileContainer = document.querySelector(".profile-container");
    var profileMenu = document.getElementById("profile-menu");

    if (!profileContainer.contains(event.target)) {
      profileMenu.style.display = "none";
    }
  });