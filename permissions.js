/* =========================================================
   TOP STORE - permissions.js
   نظام الصلاحيات المركزي
========================================================= */

"use strict";

const TS_USER_KEY = "TOPSTORE_CURRENT_USER";
const TS_USERS_KEY = "TOPSTORE_USERS";

const TS_PAGES = {
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

const TS_DEFAULT_EMPLOYEE = {
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

const TS_ADMIN_PERMISSIONS = {
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

function tsJsonGet(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        if (!value) return fallback;
        const data = JSON.parse(value);
        return data ?? fallback;
    } catch {
        return fallback;
    }
}

function tsGetCurrentUser() {
    return tsJsonGet(TS_USER_KEY, null);
}

function tsSetCurrentUser(user) {
    if (!user) {
        localStorage.removeItem(TS_USER_KEY);
        return;
    }

    localStorage.setItem(TS_USER_KEY, JSON.stringify(user));
}

function tsGetUsers() {
    let users = tsJsonGet(TS_USERS_KEY, []);

    if (!Array.isArray(users)) {
        users = [];
    }

    return users;
}

function tsSaveUsers(users) {
    localStorage.setItem(TS_USERS_KEY, JSON.stringify(users));
}

function tsIsAdmin(user) {
    if (!user) return false;

    const username = String(
        user.username || user.userName || ""
    ).trim().toLowerCase();

    const role = String(
        user.role || ""
    ).trim().toLowerCase();

    return username === "admin" ||
           role === "admin" ||
           role === "manager" ||
           role === "مدير" ||
           role === "المدير";
}

function tsGetPermissions(user = tsGetCurrentUser()) {
    if (!user) return {};

    if (tsIsAdmin(user)) {
        return { ...TS_ADMIN_PERMISSIONS };
    }

    return {
        ...TS_DEFAULT_EMPLOYEE,
        ...(user.permissions || {})
    };
}

function tsHasPermission(permission) {
    const user = tsGetCurrentUser();

    if (!user) return false;

    if (
        user.active === false ||
        user.status === "inactive"
    ) {
        return false;
    }

    return tsGetPermissions(user)[permission] === true;
}

function tsPagePermission() {
    const file =
        location.pathname
            .split("/")
            .pop()
            .toLowerCase();

    return TS_PAGES[file] || null;
}

function tsProtectCurrentPage() {
    const user = tsGetCurrentUser();

    if (!user) {
        location.replace("index.html");
        return false;
    }

    const permission = tsPagePermission();

    if (!permission) {
        return true;
    }

    if (!tsHasPermission(permission)) {
        alert("ليس لديك صلاحية للدخول إلى هذه الصفحة.");
        location.replace("dashboard.html");
        return false;
    }

    return true;
}

function tsApplyMenuPermissions() {
    document.querySelectorAll("a[href]").forEach(link => {
        const href = link.getAttribute("href");

        if (!href || !href.toLowerCase().endsWith(".html")) {
            return;
        }

        const page =
            href.split("/").pop().toLowerCase();

        const permission = TS_PAGES[page];

        if (
            permission &&
            !tsHasPermission(permission)
        ) {
            link.style.display = "none";
        }
    });
}

function tsUpdateUserInfo() {
    const user = tsGetCurrentUser();

    if (!user) return;

    const name =
        user.name ||
        user.fullName ||
        user.username ||
        "المستخدم";

    const role =
        tsIsAdmin(user)
            ? "المدير"
            : "الموظف";

    const nameElements = [
        document.getElementById("usernameDisplay"),
        document.getElementById("currentUsername")
    ];

    nameElements.forEach(el => {
        if (el) el.textContent = name;
    });

    const roleElements = [
        document.getElementById("roleDisplay"),
        document.getElementById("currentRole")
    ];

    roleElements.forEach(el => {
        if (el) el.textContent = role;
    });
}

function tsLogout() {
    localStorage.removeItem(TS_USER_KEY);

    // دعم مفاتيح الدخول القديمة بدون التأثير على المستخدمين
    [
        "topStoreCurrentUser",
        "currentUser",
        "loggedInUser",
        "topstore_current_user",
        "loggedInUsername",
        "currentUsername",
        "username"
    ].forEach(key => {
        localStorage.removeItem(key);
    });

    sessionStorage.clear();

    location.replace("index.html");
}

function tsInitializePermissions() {
    const user = tsGetCurrentUser();

    if (!user) {
        location.replace("index.html");
        return;
    }

    if (
        user.active === false ||
        user.status === "inactive"
    ) {
        alert("هذا الحساب متوقف.");
        tsLogout();
        return;
    }

    if (!tsProtectCurrentPage()) {
        return;
    }

    tsApplyMenuPermissions();
    tsUpdateUserInfo();

    document
        .querySelectorAll(
            "#logoutButton, .logout-button, [data-logout]"
        )
        .forEach(button => {
            if (button.dataset.tsReady === "1") return;

            button.dataset.tsReady = "1";

            button.addEventListener(
                "click",
                event => {
                    event.preventDefault();

                    if (
                        confirm(
                            "هل تريد تسجيل الخروج؟"
                        )
                    ) {
                        tsLogout();
                    }
                }
            );
        });
}

window.TOPSTORE = {
    getCurrentUser: tsGetCurrentUser,
    setCurrentUser: tsSetCurrentUser,
    getUsers: tsGetUsers,
    saveUsers: tsSaveUsers,
    getPermissions: tsGetPermissions,
    hasPermission: tsHasPermission,
    isAdmin: () => tsIsAdmin(),
    logout: tsLogout
};

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        tsInitializePermissions
    );
} else {
    tsInitializePermissions();
}
