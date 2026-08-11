"use strict";

/*
========================================================
 TOP STORE
 CENTRAL PERMISSIONS SYSTEM
========================================================

 الصلاحيات:

 admin
    = مدير
    = كل الصلاحيات

 employee
    = موظف
    = المبيعات
    = المخزن
    = المرتجعات
    = الصيانة

========================================================
*/


/* ======================================================
   CONFIGURATION
====================================================== */

const TOP_STORE_PERMISSIONS = {

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


/* ======================================================
   PAGE NAMES
====================================================== */

const TOP_STORE_PAGES = {

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


/* ======================================================
   GET CURRENT USER
====================================================== */

function getTopStoreCurrentUser() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "topStoreCurrentUser"
            )
        );

    } catch {

        return null;

    }

}


/* ======================================================
   GET ROLE
====================================================== */

function getTopStoreRole() {

    const user =
        getTopStoreCurrentUser();


    if (!user) {

        return null;

    }


    return user.role ||
        "employee";

}


/* ======================================================
   IS LOGGED IN
====================================================== */

function isTopStoreLoggedIn() {

    return !!getTopStoreCurrentUser();

}


/* ======================================================
   CHECK PERMISSION
====================================================== */

function hasTopStorePermission(
    permission
) {

    const role =
        getTopStoreRole();


    if (!role) {

        return false;

    }


    /*
    المدير له كل الصلاحيات
    */

    if (
        role === "admin"
    ) {

        return true;

    }


    const rolePermissions =
        TOP_STORE_PERMISSIONS[
            role
        ];


    if (!rolePermissions) {

        return false;

    }


    return (
        rolePermissions[
            permission
        ] === true
    );

}


/* ======================================================
   CURRENT PAGE
====================================================== */

function getCurrentPagePermission() {

    let page =
        window.location.pathname
            .split("/")
            .pop();


    /*
    لو GitHub Pages أو الصفحة فاضية
    */

    if (!page) {

        page =
            "index.html";

    }


    return TOP_STORE_PAGES[
        page
    ] || null;

}


/* ======================================================
   PROTECT CURRENT PAGE
====================================================== */

function protectCurrentPage() {

    const pagePermission =
        getCurrentPagePermission();


    /*
    index/login لا تحتاج حماية
    */

    if (!pagePermission) {

        return;

    }


    const user =
        getTopStoreCurrentUser();


    /*
    غير مسجل دخول
    */

    if (!user) {

        window.location.href =
            "index.html";

        return;

    }


    /*
    المستخدم غير نشط
    */

    if (
        user.active === false
    ) {

        localStorage.removeItem(
            "topStoreCurrentUser"
        );


        alert(
            "هذا الحساب متوقف. تواصل مع المدير."
        );


        window.location.href =
            "index.html";

        return;

    }


    /*
    لا يملك الصلاحية
    */

    if (
        !hasTopStorePermission(
            pagePermission
        )
    ) {

        alert(
            "ليس لديك صلاحية لفتح هذه الصفحة."
        );


        window.location.href =
            "dashboard.html";

        return;

    }

}


/* ======================================================
   HIDE FORBIDDEN MENU ITEMS
====================================================== */

function applyMenuPermissions() {

    const links =
        document.querySelectorAll(
            ".menu-item"
        );


    links.forEach(
        link => {

            const href =
                link
                    .getAttribute(
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
                TOP_STORE_PAGES[
                    page
                ];


            if (!permission) {

                return;

            }


            if (
                !hasTopStorePermission(
                    permission
                )
            ) {

                link.style.display =
                    "none";

            }

        }
    );

}


/* ======================================================
   DISPLAY USER
====================================================== */

function displayTopStoreUser() {

    const user =
        getTopStoreCurrentUser();


    if (!user) {

        return;

    }


    const name =
        user.fullName ||
        user.name ||
        user.username ||
        "المستخدم";


    const roleText =
        user.role === "admin"
            ? "مدير"
            : "موظف";


    const usernameElement =
        document.getElementById(
            "usernameDisplay"
        );


    const roleElement =
        document.getElementById(
            "roleDisplay"
        );


    if (
        usernameElement
    ) {

        usernameElement.textContent =
            name;

    }


    if (
        roleElement
    ) {

        roleElement.textContent =
            roleText;

    }

}


/* ======================================================
   LOGOUT
====================================================== */

function topStoreLogout() {

    localStorage.removeItem(
        "topStoreCurrentUser"
    );


    window.location.href =
        "index.html";

}


/* ======================================================
   APPLY BUTTON PERMISSION
======================================================

 مثال:

 <button
     data-permission="reports">
     التقارير
 </button>

*/

function applyButtonPermissions() {

    const elements =
        document.querySelectorAll(
            "[data-permission]"
        );


    elements.forEach(
        element => {

            const permission =
                element.dataset
                    .permission;


            if (
                !hasTopStorePermission(
                    permission
                )
            ) {

                element.style.display =
                    "none";

            }

        }
    );

}


/* ======================================================
   DISABLE BUTTON INSTEAD OF HIDE
======================================================

 لو عايز الزر يفضل ظاهر لكن
 غير قابل للاستخدام:

 data-require-permission="accounts"

*/

function applyDisabledPermissions() {

    const elements =
        document.querySelectorAll(
            "[data-require-permission]"
        );


    elements.forEach(
        element => {

            const permission =
                element.dataset
                    .requirePermission;


            if (
                !hasTopStorePermission(
                    permission
                )
            ) {

                element.disabled =
                    true;

                element.classList.add(
                    "permission-disabled"
                );

                element.title =
                    "ليس لديك صلاحية لهذا الإجراء";

            }

        }
    );

}


/* ======================================================
   REQUIRE ADMIN
====================================================== */

function requireAdmin() {

    const user =
        getTopStoreCurrentUser();


    if (!user) {

        window.location.href =
            "index.html";

        return false;

    }


    if (
        user.role !== "admin"
    ) {

        alert(
            "هذا الإجراء متاح للمدير فقط."
        );

        return false;

    }


    return true;

}


/* ======================================================
   REQUIRE PERMISSION
====================================================== */

function requirePermission(
    permission
) {

    if (
        hasTopStorePermission(
            permission
        )
    ) {

        return true;

    }


    alert(
        "ليس لديك صلاحية لتنفيذ هذا الإجراء."
    );


    return false;

}


/* ======================================================
   INITIALIZE
====================================================== */

function initTopStorePermissions() {

    protectCurrentPage();

    applyMenuPermissions();

    applyButtonPermissions();

    applyDisabledPermissions();

    displayTopStoreUser();

}


/* ======================================================
   RUN
====================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initTopStorePermissions
    );

} else {

    initTopStorePermissions();

}
