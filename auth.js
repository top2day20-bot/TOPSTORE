"use strict";

/*
====================================================
 TOP STORE - AUTHORIZATION SYSTEM
 نظام حماية الصفحات والصلاحيات
====================================================
*/

const TOPSTORE_CURRENT_USER =
    "topStoreCurrentUser";


/* ==================================================
   الصفحات المسموح بها
================================================== */

const PAGE_PERMISSIONS = {

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
        "users",

    "settings.html":
        "settings"

};


/* ==================================================
   الحصول على المستخدم الحالي
================================================== */

function getCurrentUser() {

    try {

        return JSON.parse(
            localStorage.getItem(
                TOPSTORE_CURRENT_USER
            )
        );

    } catch {

        return null;

    }

}


/* ==================================================
   هل المستخدم مسجل دخول؟
================================================== */

function isLoggedIn() {

    return !!getCurrentUser();

}


/* ==================================================
   هل المستخدم مدير؟
================================================== */

function isManager() {

    const user =
        getCurrentUser();


    return (
        user &&
        user.role === "manager"
    );

}


/* ==================================================
   هل لديه صلاحية؟
================================================== */

function hasPermission(
    permission
) {

    const user =
        getCurrentUser();


    if (!user) {

        return false;

    }


    /*
     * المدير له كل الصلاحيات
     */

    if (
        user.role ===
        "manager"
    ) {

        return true;

    }


    return !!(
        user.permissions &&
        user.permissions[
            permission
        ]
    );

}


/* ==================================================
   منع الدخول للصفحات
================================================== */

function protectPage() {

    const user =
        getCurrentUser();


    /*
     * غير مسجل دخول
     */

    if (!user) {

        window.location.href =
            "index.html";

        return;

    }


    const fileName =
        window.location.pathname
            .split("/")
            .pop();


    const requiredPermission =
        PAGE_PERMISSIONS[
            fileName
        ];


    /*
     * الصفحة لا تحتاج صلاحية
     */

    if (!requiredPermission) {

        return;

    }


    /*
     * ليس لديه الصلاحية
     */

    if (
        !hasPermission(
            requiredPermission
        )
    ) {

        alert(
            "⛔ ليس لديك صلاحية للدخول إلى هذه الصفحة"
        );


        window.location.href =
            "dashboard.html";

    }

}


/* ==================================================
   إخفاء أزرار الصفحات غير المسموحة
================================================== */

function hideUnauthorizedMenu() {

    const links =
        document.querySelectorAll(
            "a[href]"
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


            const fileName =
                href
                    .split("/")
                    .pop()
                    .split("?")[0];


            const permission =
                PAGE_PERMISSIONS[
                    fileName
                ];


            if (
                permission &&
                !hasPermission(
                    permission
                )
            ) {

                link.style.display =
                    "none";

            }

        }
    );

}


/* ==================================================
   إخفاء زر حذف التقارير
================================================== */

function protectDeleteReports() {

    const button =
        document.getElementById(
            "deleteSelectedReports"
        );


    if (
        button &&
        !hasPermission(
            "deleteReports"
        )
    ) {

        button.style.display =
            "none";

    }

}


/* ==================================================
   تسجيل الخروج
================================================== */

function logout() {

    localStorage.removeItem(
        TOPSTORE_CURRENT_USER
    );


    window.location.href =
        "index.html";

}


/* ==================================================
   عرض بيانات المستخدم
================================================== */

function displayCurrentUser() {

    const user =
        getCurrentUser();


    if (!user) {

        return;

    }


    const usernameDisplay =
        document.getElementById(
            "usernameDisplay"
        );


    if (usernameDisplay) {

        usernameDisplay.textContent =
            user.name ||
            user.username;

    }


    const roleDisplay =
        document.getElementById(
            "roleDisplay"
        );


    if (roleDisplay) {

        roleDisplay.textContent =
            user.role === "manager"
                ? "المدير"
                : "الموظف";

    }

}


/* ==================================================
   زر تسجيل الخروج
================================================== */

function setupLogout() {

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


                if (
                    confirmLogout
                ) {

                    logout();

                }

            }
        );

    }

}


/* ==================================================
   تشغيل الحماية
================================================== */

protectPage();

document.addEventListener(
    "DOMContentLoaded",
    function () {

        hideUnauthorizedMenu();

        protectDeleteReports();

        displayCurrentUser();

        setupLogout();

    }
);


/* ==================================================
   API
================================================== */

window.TOPSTORE_SECURITY = {

    getCurrentUser,

    isLoggedIn,

    isManager,

    hasPermission,

    logout

};