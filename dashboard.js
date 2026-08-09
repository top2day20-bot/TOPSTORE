"use strict";


/* ==================================
   Check Login
   ================================== */

const loggedIn =
    sessionStorage.getItem("topStoreLoggedIn");


if (loggedIn !== "true") {

    window.location.href =
        "index.html";
}


/* ==================================
   User Data
   ================================== */

const username =
    sessionStorage.getItem(
        "topStoreUsername"
    ) || "admin";


const usernameDisplay =
    document.getElementById(
        "usernameDisplay"
    );


if (usernameDisplay) {

    usernameDisplay.textContent =
        username;
}


/* ==================================
   Logout
   ================================== */

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            const confirmLogout =
                confirm(
                    "هل تريد تسجيل الخروج؟"
                );


            if (!confirmLogout) {
                return;
            }


            sessionStorage.removeItem(
                "topStoreLoggedIn"
            );

            sessionStorage.removeItem(
                "topStoreUsername"
            );

            sessionStorage.removeItem(
                "topStoreRole"
            );


            window.location.href =
                "index.html";

        }
    );
}


/* ==================================
   Mobile Menu
   ================================== */

const menuButton =
    document.getElementById(
        "menuButton"
    );


const sidebar =
    document.getElementById(
        "sidebar"
    );


if (menuButton && sidebar) {

    menuButton.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "open"
            );

        }
    );
}


/* ==================================
   Close Sidebar
   ================================== */

document.addEventListener(
    "click",
    function (event) {

        if (
            window.innerWidth <= 800 &&
            sidebar &&
            menuButton &&
            sidebar.classList.contains("open")
        ) {

            if (
                !sidebar.contains(event.target) &&
                !menuButton.contains(event.target)
            ) {

                sidebar.classList.remove(
                    "open"
                );
            }
        }

    }
);