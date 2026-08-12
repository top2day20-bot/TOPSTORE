/* =========================================================
   TOP STORE - نظام الصلاحيات الموحد
   استبدل permissions.js القديم بهذا الملف
========================================================= */

"use strict";

const TS = {
    currentKeys: [
        "topStoreCurrentUser",
        "currentUser",
        "loggedInUser",
        "topstore_current_user",
        "user"
    ],
    usersKey: "topStoreUsers"
};

const DEFAULT_EMPLOYEE_PERMISSIONS = {
    dashboard: true,
    sales: true,
    products: true,
    returns: true,
    maintenance: true,
    accounts: false,
    expenses: false,
    reports: false,
    users: false
};

const ALL_PERMISSIONS = {
    dashboard: true,
    sales: true,
    products: true,
    returns: true,
    maintenance: true,
    accounts: true,
    expenses: true,
    reports: true,
    users: true
};

const PAGE_PERMISSION = {
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

function tsReadJSON(key) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (e) {
        return null;
    }
}

function tsGetCurrentUser() {
    for (const key of TS.currentKeys) {
        const value = tsReadJSON(key);
        if (value && typeof value === "object") return value;
    }

    // دعم أنظمة الدخول القديمة التي تحفظ username فقط
    const username =
        localStorage.getItem("username") ||
        localStorage.getItem("currentUsername") ||
        localStorage.getItem("loggedInUsername");

    if (username) {
        return { username };
    }

    return null;
}

function tsNormalizeRole(user) {
    if (!user) return null;

    const username = String(
        user.username || user.userName || user.name || ""
    ).trim().toLowerCase();

    if (username === "admin") return "admin";

    const role = String(
        user.role ||
        user.type ||
        user.userRole ||
        user.permissionRole ||
        "employee"
    ).trim().toLowerCase();

    if ([
        "admin", "administrator", "manager",
        "مدير", "المدير"
    ].includes(role)) {
        return "admin";
    }

    return "employee";
}

function tsGetUsers() {
    const users = tsReadJSON(TS.usersKey);
    return Array.isArray(users) ? users : [];
}

function tsFindStoredUser(current) {
    if (!current) return null;

    const users = tsGetUsers();

    const username = String(
        current.username ||
        current.userName ||
        current.name ||
        ""
    ).trim().toLowerCase();

    if (!username) return current;

    return users.find(u =>
        String(
            u.username || u.userName || u.name || ""
        ).trim().toLowerCase() === username
    ) || current;
}

function tsGetPermissions(user) {
    if (!user) return {};

    const role = tsNormalizeRole(user);

    if (role === "admin") return { ...ALL_PERMISSIONS };

    const stored = tsFindStoredUser(user);

    // لو المستخدم عنده permissions محفوظة من صفحة المستخدمين
    if (
        stored &&
        stored.permissions &&
        typeof stored.permissions === "object"
    ) {
        return {
            ...DEFAULT_EMPLOYEE_PERMISSIONS,
            ...stored.permissions
        };
    }

    // دعم أسماء مفاتيح قديمة
    if (
        stored &&
        stored.pagePermissions &&
        typeof stored.pagePermissions === "object"
    ) {
        return {
            ...DEFAULT_EMPLOYEE_PERMISSIONS,
            ...stored.pagePermissions
        };
    }

    return { ...DEFAULT_EMPLOYEE_PERMISSIONS };
}

function tsHasPermission(permission) {
    const user = tsGetCurrentUser();
    if (!user) return false;

    if (
        user.active === false ||
        user.active === "false" ||
        user.status === "inactive"
    ) return false;

    return tsGetPermissions(user)[permission] === true;
}

function tsLogout() {
    TS.currentKeys.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem("username");
    localStorage.removeItem("currentUsername");
    localStorage.removeItem("loggedInUsername");
    sessionStorage.clear();
    window.location.href = "index.html";
}

function tsProtectPage() {
    const user = tsGetCurrentUser();

    if (!user) {
        window.location.href = "index.html";
        return false;
    }

    if (
        user.active === false ||
        user.active === "false" ||
        user.status === "inactive"
    ) {
        alert("هذا الحساب متوقف. تواصل مع المدير.");
        tsLogout();
        return false;
    }

    const page = (
        window.location.pathname.split("/").pop() ||
        "dashboard.html"
    ).toLowerCase();

    const permission = PAGE_PERMISSION[page];

    if (!permission) return true;

    if (tsHasPermission(permission)) return true;

    alert("ليس لديك صلاحية للدخول إلى هذه الصفحة.");
    window.location.href = "dashboard.html";
    return false;
}

function tsApplyMenu() {
    document.querySelectorAll(".menu-item, a[href]").forEach(el => {
        const href = el.getAttribute("href");
        if (!href || !href.toLowerCase().endsWith(".html")) return;

        const page = href.split("/").pop().toLowerCase();
        const permission = PAGE_PERMISSION[page];

        if (permission && !tsHasPermission(permission)) {
            el.style.display = "none";
        }
    });
}

function tsDisplayUser() {
    const user = tsGetCurrentUser();
    if (!user) return;

    const name =
        user.fullName ||
        user.displayName ||
        user.username ||
        user.userName ||
        user.name ||
        "المستخدم";

    const role = tsNormalizeRole(user);

    const nameEl = document.getElementById("usernameDisplay");
    const roleEl = document.getElementById("roleDisplay");
    const avatar = document.getElementById("userAvatar") ||
                   document.querySelector(".user-avatar");

    if (nameEl) nameEl.textContent = name;
    if (roleEl) roleEl.textContent = role === "admin" ? "المدير" : "الموظف";
    if (avatar) avatar.textContent = String(name).charAt(0).toUpperCase();
}

function tsSetupLogout() {
    document.querySelectorAll(
        "#logoutButton, .logout-button, [data-logout]"
    ).forEach(button => {
        if (button.dataset.tsLogoutReady) return;

        button.dataset.tsLogoutReady = "1";
        button.addEventListener("click", e => {
            e.preventDefault();
            if (confirm("هل تريد تسجيل الخروج؟")) tsLogout();
        });
    });
}

function tsInitPermissions() {
    if (!tsProtectPage()) return;
    tsApplyMenu();
    tsDisplayUser();
    tsSetupLogout();
}

window.TOPSTORE = {
    getCurrentUser: tsGetCurrentUser,
    getRole: () => tsNormalizeRole(tsGetCurrentUser()),
    getPermissions: () => tsGetPermissions(tsGetCurrentUser()),
    hasPermission: tsHasPermission,
    logout: tsLogout
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tsInitPermissions);
} else {
    tsInitPermissions();
}
