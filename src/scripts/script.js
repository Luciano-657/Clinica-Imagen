//Menu Hamburgeusa

const header = document.getElementById("main-header");
const toggleBtn = document.getElementById("toggle-btn");
const closeBtn = document.getElementById("close-btn");
const overlay = document.getElementById("overlay");

toggleBtn.addEventListener("click", () => {
    header.classList.add("nav-open");
});

closeBtn.addEventListener("click", () => {
    header.classList.remove("nav-open");
});

overlay.addEventListener("click", () => {
    header.classList.remove("nav-open");
});

