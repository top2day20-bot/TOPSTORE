"use strict";

/* =====================================================
   TOP STORE - PERMISSIONS SYSTEM
   ===================================================== */

const CURRENT_USER_KEY = "topStoreCurrentUser";

/* =====================================================
   الصفحات والصلاحيات
===================================================== */

const PAGE_PERMISSIONS = {

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


/* =====================================================
   صلاحيات المدير
===================================================== */

const ADMIN_PERMISSIONS = {

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


/* =====================================================
   صلاحيات الموظف
===================================================== */

const EMPLOYEE_PERMISSIONS = {

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


/* =====================================================
   الحصول على المستخدم الحالي
===================================================== */

function getTopStoreUser() {

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
            "TOP STORE USER ERROR:",
            error
        );

        return null;
    }

}


/* =====================================================
   توحيد اسم الصلاحية
===================================================== */

function normalizeRole(role) {

    if (!role) {
        return "employee";
    }

    const value =
        String(role)
            .trim()
            .toLowerCase();


    /* المدير */

    if (
        value === "admin" ||
        value === "administrator" ||
        value === "manager" ||
        value === "مدير" ||
        value === "المدير"
    ) {

        return "admin";

    }


    /* الموظف */

    if (
        value === "employee" ||
        value === "staff" ||
        value === "worker" ||
        value === "موظف" ||
        value === "الموظف"
    ) {

        return "employee";

    }


    return "employee";

}


/* =====================================================
   الحصول على دور المستخدم
===================================================== */

function getTopStoreRole() {

    const user =
        getTopStoreUser();

    if (!user) {
        return null;
    }

    return normalizeRole(
        user.role
    );

}


/* =====================================================
   التحقق من الصلاحية
===================================================== */

function hasTopStorePermission(
    permission
) {

    const user =
        getTopStoreUser();

    if (!user) {
        return false;
    }


    /* الحساب متوقف */

    if (
        user.active === false
    ) {

        return false;

    }


    const role =
        normalizeRole(
            user.role
        );


    /* المدير */

    if (
        role === "admin"
    ) {

        return (
            ADMIN_PERMISSIONS[
                permission
            ] === true
        );

    }


    /* الموظف */

    if (
        role === "employee"
    ) {

        return (
            EMPLOYEE_PERMISSIONS[
                permission
            ] === true
        );

    }


    return false;

}


/* =====================================================
   حماية الصفحة الحالية
===================================================== */

function protectCurrentPage() {

    const user =
        getTopStoreUser();


    /* مفيش مستخدم */

    if (!user) {

        window.location.replace(
            "index.html"
        );

        return false;

    }


    /* الحساب متوقف */

    if (
        user.active === false
    ) {

        localStorage.removeItem(
            CURRENT_USER_KEY
        );

        alert(
            "هذا الحساب متوقف. تواصل مع المدير."
        );

        window.location.replace(
            "index.html"
        );

        return false;

    }


    let page =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    if (!page) {

        page =
            "dashboard.html";

    }


    const permission =
        PAGE_PERMISSIONS[
            page
        ];


    /*
       الصفحة غير موجودة في نظام الصلاحيات
       نسمح بها
    */

    if (!permission) {

        return true;

    }


    /*
       المستخدم لديه الصلاحية
    */

    if (
        hasTopStorePermission(
            permission
        )
    ) {

        return true;

    }


    /*
       ممنوع
    */

    alert(
        "ليس لديك صلاحية للدخول إلى هذه الصفحة."
    );


    window.location.replace(
        "dashboard.html"
    );

    return false;

}


/* =====================================================
   إخفاء الصفحات غير المسموحة من القائمة
===================================================== */

function applyMenuPermissions() {

    const links =
        document.querySelectorAll(
            ".menu-item"
        );


    links.forEach(
        function (link) {

            const href =
                link.getAttribute(
                    "href"
                );


            if (!href) {
                return;
            }


            const page =
                href
                    .split("/")
                    .pop()
                    .toLowerCase();


            const permission =
                PAGE_PERMISSIONS[
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


/* =====================================================
   إخفاء الأزرار حسب الصلاحية
===================================================== */

function applyButtonPermissions() {

    const elements =
        document.querySelectorAll(
            "[data-permission]"
        );


    elements.forEach(
        function (element) {

            const permission =
                element.dataset.permission;


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


/* =====================================================
   عرض بيانات المستخدم
===================================================== */

function displayPermissionUser() {

    const user =
        getTopStoreUser();


    if (!user) {
        return;
    }


    const name =
        user.fullName ||
        user.name ||
        user.username ||
        "المستخدم";


    const role =
        normalizeRole(
            user.role
        );


    const usernameDisplay =
        document.getElementById(
            "usernameDisplay"
        );


    const roleDisplay =
        document.getElementById(
            "roleDisplay"
        );


    if (usernameDisplay) {

        usernameDisplay.textContent =
            name;

    }


    if (roleDisplay) {

        roleDisplay.textContent =
            role === "admin"
                ? "المدير"
                : "الموظف";

    }

}


/* =====================================================
   تسجيل الخروج
===================================================== */

function topStoreLogout() {

    localStorage.removeItem(
        CURRENT_USER_KEY
    );

    window.location.replace(
        "index.html"
    );

}


/* =====================================================
   تشغيل النظام
===================================================== */

function initTopStorePermissions() {

    const allowed =
        protectCurrentPage();


    if (!allowed) {
        return;
    }


    applyMenuPermissions();

    applyButtonPermissions();

    displayPermissionUser();

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
        initTopStorePermissions
    );

} else {

    initTopStorePermissions();

}
