const menuOpenButton = document.querySelector("#menu-open-button");

menuOpenButton.addEventListener("click", () => {
    document.body.classList.toggle("show-mobile-menu");
});