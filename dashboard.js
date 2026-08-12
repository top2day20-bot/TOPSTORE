"use strict";

const CURRENT_USER_KEY = "topStoreCurrentUser";

function getCurrentUser() {
    try {
        const data = localStorage.getItem(CURRENT_USER_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Current user error:", error);
        return null;
    }
}

function displayUser(user) {
    if (!user) return;

    const name = user.fullName || user.name || user.username || "المستخدم";
    const role = String(user.role || "").toLowerCase();

    const usernameDisplay = document.getElementById("usernameDisplay");
    const roleDisplay = document.getElementById("roleDisplay");
    const avatar = document.getElementById("userAvatar") ||
                   document.querySelector(".user-avatar");

    if (usernameDisplay) usernameDisplay.textContent = name;
    if (roleDisplay) {
        roleDisplay.textContent =
            (user.username === "admin" ||
             ["admin", "manager", "مدير", "المدير"].includes(role))
            ? "المدير"
            : "الموظف";
    }
    if (avatar) avatar.textContent = name.charAt(0).toUpperCase();
}

function setupMobileMenu() {
    const menuButton = document.getElementById("menuButton");
    const sidebar = document.getElementById("sidebar");

    if (!menuButton || !sidebar) return;

    menuButton.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });
}

function initDashboard() {
    const user = getCurrentUser();

    if (!user) {
        window.location.replace("index.html");
        return;
    }

    if (user.active === false || user.active === "false") {
        localStorage.removeItem(CURRENT_USER_KEY);
        alert("هذا الحساب متوقف. تواصل مع المدير.");
        window.location.replace("index.html");
        return;
    }

    displayUser(user);
    setupMobileMenu();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDashboard);
} else {
    initDashboard();
}
