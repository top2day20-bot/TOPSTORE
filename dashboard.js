"use strict";

/* =====================================================
   TOP STORE - DASHBOARD
   ===================================================== */

const CURRENT_USER_KEY = "topStoreCurrentUser";


/* =====================================================
   GET CURRENT USER
   ===================================================== */

function getCurrentUser() {

    try {

        const data =
            localStorage.getItem(
                CURRENT_USER_KEY
            );

        if (!data) {
            return null;
        }

        return JSON.parse(data);

    } catch (error) {

        console.error(
            "Current user error:",
            error
        );

        return null;
    }
}


/* =====================================================
   CHECK LOGIN
   ===================================================== */

function checkLogin() {

    const user =
        getCurrentUser();

    /*
       لو مفيش مستخدم مسجل
       نرجعه لصفحة الدخول
    */

    if (!user) {

        window.location.replace(
            "index.html"
        );

        return null;
    }

    /*
       لو الحساب متوقف
    */

    if (user.active === false) {

        localStorage.removeItem(
            CURRENT_USER_KEY
        );

        alert(
            "هذا الحساب متوقف. تواصل مع المدير."
        );

        window.location.replace(
            "index.html"
        );

        return null;
    }

    return user;
}


/* =====================================================
   DISPLAY USER
   ===================================================== */

function displayUser(user) {

    if (!user) {
        return;
    }

    const name =
        user.fullName ||
        user.name ||
        user.username ||
        "المستخدم";

    const usernameDisplay =
        document.getElementById(
            "usernameDisplay"
        );

    if (usernameDisplay) {

        usernameDisplay.textContent =
            name;
    }


    /*
       البحث عن مكان الصلاحية
    */

    const userInfo =
        document.querySelector(
            ".user-info"
        );

    if (userInfo) {

        const spans =
            userInfo.querySelectorAll(
                "span"
            );

        if (spans.length > 0) {

            spans[0].textContent =
                user.role === "admin"
                    ? "المدير"
                    : "الموظف";
        }
    }


    /*
       تغيير الحرف الموجود داخل الصورة
    */

    const avatar =
        document.querySelector(
            ".user-avatar"
        );

    if (avatar) {

        avatar.textContent =
            name
                .charAt(0)
                .toUpperCase();
    }

}


/* =====================================================
   LOGOUT
   ===================================================== */

function logout() {

    localStorage.removeItem(
        CURRENT_USER_KEY
    );

    window.location.replace(
        "index.html"
    );
}


/* =====================================================
   LOGOUT BUTTON
   ===================================================== */

function setupLogout() {

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener(
        "click",
        function () {

            const confirmed =
                confirm(
                    "هل تريد تسجيل الخروج؟"
                );

            if (!confirmed) {
                return;
            }

            logout();
        }
    );
}


/* =====================================================
   MOBILE MENU
   ===================================================== */

function setupMobileMenu() {

    const menuButton =
        document.getElementById(
            "menuButton"
        );

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    if (
        !menuButton ||
        !sidebar
    ) {
        return;
    }

    menuButton.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "open"
            );

        }
    );

}


/* =====================================================
   PERMISSIONS
   ===================================================== */

const DASHBOARD_PERMISSIONS = {

    admin: {

        dashboard: true,
        sales: true,
        products: true,
        returns: true,
        maintenance: true,
        accounts: true,
        expenses: true,
        reports: true,
        users: true

    },

    employee: {

        dashboard: true,
        sales: true,
        products: true,
        returns: true,
        maintenance: true,
        accounts: false,
        expenses: false,
        reports: false,
        users: false

    }

};


/* =====================================================
   PAGE PERMISSIONS
   ===================================================== */

const PAGE_PERMISSIONS = {

    "dashboard.html":
        "dashboard",

    "sales.html":
        "sales",

    "products.html":
        "products",

    "returns.html":
        "returns",

    "maintenance.html":
        "maintenance",

    "accounts.html":
        "accounts",

    "expenses.html":
        "expenses",

    "reports.html":
        "reports",

    "users.html":
        "users"

};


/* =====================================================
   CHECK PERMISSION
   ===================================================== */

function hasPermission(
    user,
    permission
) {

    if (!user) {
        return false;
    }

    /*
       المدير له كل الصلاحيات
    */

    if (
        user.role === "admin"
    ) {

        return true;
    }


    const permissions =
        DASHBOARD_PERMISSIONS[
            user.role
        ];

    if (!permissions) {
        return false;
    }

    return (
        permissions[
            permission
        ] === true
    );
}


/* =====================================================
   HIDE FORBIDDEN LINKS
   ===================================================== */

function applyPermissions(user) {

    const menuItems =
        document.querySelectorAll(
            ".menu-item"
        );


    menuItems.forEach(
        function (item) {

            const href =
                item.getAttribute(
                    "href"
                );

            if (!href) {
                return;
            }

            const page =
                href
                    .split("/")
                    .pop();

            const permission =
                PAGE_PERMISSIONS[
                    page
                ];

            if (!permission) {
                return;
            }

            if (
                !hasPermission(
                    user,
                    permission
                )
            ) {

                item.style.display =
                    "none";
            }

        }
    );


    /*
       Quick Actions
    */

    const quickCards =
        document.querySelectorAll(
            ".quick-card"
        );


    quickCards.forEach(
        function (card) {

            const href =
                card.getAttribute(
                    "href"
                );

            if (!href) {
                return;
            }

            const page =
                href
                    .split("/")
                    .pop();

            const permission =
                PAGE_PERMISSIONS[
                    page
                ];

            if (!permission) {
                return;
            }

            if (
                !hasPermission(
                    user,
                    permission
                )
            ) {

                card.style.display =
                    "none";
            }

        }
    );

}


/* =====================================================
   START DASHBOARD
   ===================================================== */

function startDashboard() {

    /*
       التأكد من تسجيل الدخول
    */

    const user =
        checkLogin();

    if (!user) {
        return;
    }


    /*
       عرض بيانات المستخدم
    */

    displayUser(user);


    /*
       الصلاحيات
    */

    applyPermissions(user);


    /*
       تسجيل الخروج
    */

    setupLogout();


    /*
       القائمة في الهاتف
    */

    setupMobileMenu();

}


/* =====================================================
   START
   ===================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startDashboard
    );

} else {

    startDashboard();

}
