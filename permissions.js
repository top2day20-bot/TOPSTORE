"use strict";

const TOPSTORE_USER_KEY = "topStoreCurrentUser";

const TOPSTORE_PAGE_PERMISSIONS = {
    "dashboard.html": "dashboard",
    "sales.html": "sales",
    "products.html": "products",
    "returns.html": "returns",
    "maintenance.html": "maintenance",
    "accounts.html": "accounts",
    "expenses.html": "expenses",
    "reports.html": "reports",
    "users.html": "users"
};

const ADMIN_PERMISSIONS = {
    dashboard: true, sales: true, products: true, returns: true,
    maintenance: true, accounts: true, expenses: true,
    reports: true, users: true
};

const EMPLOYEE_PERMISSIONS = {
    dashboard: true, sales: true, products: true, returns: true,
    maintenance: true, accounts: false, expenses: false,
    reports: false, users: false
};

function getTopStoreCurrentUser() {
    try {
        const saved = localStorage.getItem(TOPSTORE_USER_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error("TOP STORE USER ERROR:", error);
        return null;
    }
}

function getTopStoreRole(user) {
    if (!user) return null;

    const username = String(user.username || "").trim().toLowerCase();
    if (username === "admin") return "admin";

    const value = String(
        user.role || user.type || user.userRole || user.permission || "employee"
    ).trim().toLowerCase();

    if (["admin", "administrator", "manager", "مدير", "المدير"].includes(value)) {
        return "admin";
    }

    return "employee";
}

function hasTopStorePermission(permission) {
    const user = getTopStoreCurrentUser();
    if (!user) return false;

    if (user.active === false || user.active === "false") return false;

    const role = getTopStoreRole(user);
    const permissions = role === "admin"
        ? ADMIN_PERMISSIONS
        : EMPLOYEE_PERMISSIONS;

    return permissions[permission] === true;
}

function protectTopStorePage() {
    const user = getTopStoreCurrentUser();

    if (!user) {
        window.location.replace("index.html");
        return false;
    }

    if (user.active === false || user.active === "false") {
        localStorage.removeItem(TOPSTORE_USER_KEY);
        alert("هذا الحساب متوقف. تواصل مع المدير.");
        window.location.replace("index.html");
        return false;
    }

    let page = window.location.pathname.split("/").pop().toLowerCase();
    if (!page) page = "dashboard.html";

    const permission = TOPSTORE_PAGE_PERMISSIONS[page];
    if (!permission || hasTopStorePermission(permission)) return true;

    alert("ليس لديك صلاحية للدخول إلى هذه الصفحة.");
    window.location.replace("dashboard.html");
    return false;
}

function applyTopStoreMenuPermissions() {
    document.querySelectorAll(".menu-item").forEach(link => {
        const href = link.getAttribute("href");
        if (!href) return;

        const page = href.split("/").pop().toLowerCase();
        const permission = TOPSTORE_PAGE_PERMISSIONS[page];

        if (permission && !hasTopStorePermission(permission)) {
            link.style.display = "none";
        }
    });
}

function applyTopStoreButtonPermissions() {
    document.querySelectorAll("[data-permission]").forEach(element => {
        const permission = element.getAttribute("data-permission");
        if (!hasTopStorePermission(permission)) {
            element.style.display = "none";
        }
    });
}

function displayTopStoreUser() {
    const user = getTopStoreCurrentUser();
    if (!user) return;

    const name = user.fullName || user.name || user.username || "المستخدم";
    const role = getTopStoreRole(user);

    const usernameDisplay = document.getElementById("usernameDisplay");
    const roleDisplay = document.getElementById("roleDisplay");
    const avatar = document.getElementById("userAvatar") ||
                   document.querySelector(".user-avatar");

    if (usernameDisplay) usernameDisplay.textContent = name;
    if (roleDisplay) roleDisplay.textContent = role === "admin" ? "المدير" : "الموظف";
    if (avatar) avatar.textContent = name.charAt(0).toUpperCase();
}

function topStoreLogout() {
    localStorage.removeItem(TOPSTORE_USER_KEY);
    sessionStorage.clear();
    window.location.replace("index.html");
}

function setupTopStoreLogout() {
    document.querySelectorAll("#logoutButton, .logout-button, [data-logout]")
        .forEach(button => {
            if (button.dataset.logoutReady === "true") return;

            button.dataset.logoutReady = "true";
            button.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();

                if (confirm("هل تريد تسجيل الخروج؟")) {
                    topStoreLogout();
                }
            });
        });
}

function initTopStorePermissions() {
    if (!protectTopStorePage()) return;

    applyTopStoreMenuPermissions();
    applyTopStoreButtonPermissions();
    displayTopStoreUser();
    setupTopStoreLogout();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTopStorePermissions);
} else {
    initTopStorePermissions();
}
