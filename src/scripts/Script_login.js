const registerButton = document.getElementById("register");
const loginButton = document.getElementById("login");
const container = document.getElementById("container");

// Para modo desktop/tablet
registerButton?.addEventListener("click", () => {
    container.classList.add("right-panel-active");
});

loginButton?.addEventListener("click", () => {
    container.classList.remove("right-panel-active");
});

// Para modo mobile
const mobileRegister = document.getElementById("show-register");
const mobileBack = document.getElementById("back-to-login");

mobileRegister?.addEventListener("click", () => {
    container.classList.add("mobile-register-active");
});

mobileBack?.addEventListener("click", () => {
    container.classList.remove("mobile-register-active");
});