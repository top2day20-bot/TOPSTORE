"use strict";

/*
====================================================
 TOP STORE - LOGIN SYSTEM
 نظام تسجيل الدخول والصلاحيات
====================================================
*/

const USERS_KEY = "topStoreUsers";
const CURRENT_USER_KEY = "topStoreCurrentUser";


/* ==================================================
   المستخدمين الافتراضيين
================================================== */

const defaultUsers = [

    {
        id: 1,
        username: "admin",
        password: "1234",
        name: "المدير",
        role: "manager",

        permissions: {
            sales: true,
            products: true,
            returns: true,
            maintenance: true,
            accounts: true,
            expenses: true,
            reports: true,
            users: true,
            settings: true,
            deleteReports: true
        }
    },

    {
        id: 2,
        username: "employee",
        password: "1234",
        name: "الموظف",
        role: "employee",

        permissions: {
            sales: true,
            products: true,
            returns: true,
            maintenance: true,
            accounts: false,
            expenses: false,
            reports: false,
            users: false,
            settings: false,
            deleteReports: false
        }
    }

];


/* ==================================================
   إنشاء المستخدمين أول مرة
================================================== */

function initializeUsers() {

    const savedUsers =
        localStorage.getItem(
            USERS_KEY
        );


    if (!savedUsers) {

        localStorage.setItem(
            USERS_KEY,
            JSON.stringify(
                defaultUsers
            )
        );

    }

}


/* ==================================================
   قراءة المستخدمين
================================================== */

function getUsers() {

    try {

        const users =
            JSON.parse(
                localStorage.getItem(
                    USERS_KEY
                ) || "[]"
            );


        return Array.isArray(users)
            ? users
            : [];

    } catch {

        return [];

    }

}


/* ==================================================
   LOGIN
================================================== */

function login(username, password) {

    const users =
        getUsers();


    const user =
        users.find(
            item =>
                item.username ===
                    username &&
                item.password ===
                    password
        );


    if (!user) {

        return {
            success: false,
            message:
                "اسم المستخدم أو كلمة المرور غير صحيحة"
        };

    }


    /*
     * حفظ المستخدم الحالي
     */

    localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify({
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            permissions:
                user.permissions
        })
    );


    return {
        success: true,
        user: user
    };

}


/* ==================================================
   تشغيل النظام
================================================== */

initializeUsers();


/* ==================================================
   عناصر صفحة تسجيل الدخول
================================================== */

const loginForm =
    document.getElementById(
        "loginForm"
    );

const usernameInput =
    document.getElementById(
        "username"
    );

const passwordInput =
    document.getElementById(
        "password"
    );

const loginMessage =
    document.getElementById(
        "loginMessage"
    );


/* ==================================================
   تسجيل الدخول
================================================== */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const username =
                usernameInput
                    ? usernameInput.value.trim()
                    : "";

            const password =
                passwordInput
                    ? passwordInput.value
                    : "";


            if (!username || !password) {

                showLoginMessage(
                    "اكتب اسم المستخدم وكلمة المرور",
                    "error"
                );

                return;

            }


            const result =
                login(
                    username,
                    password
                );


            if (!result.success) {

                showLoginMessage(
                    result.message,
                    "error"
                );

                return;

            }


            showLoginMessage(
                "تم تسجيل الدخول بنجاح ✓",
                "success"
            );


            /*
             * الانتقال للوحة التحكم
             */

            setTimeout(
                function () {

                    window.location.href =
                        "dashboard.html";

                },
                500
            );

        }
    );

}


/* ==================================================
   رسالة تسجيل الدخول
================================================== */

function showLoginMessage(
    message,
    type
) {

    if (!loginMessage) {

        alert(message);

        return;

    }


    loginMessage.textContent =
        message;


    loginMessage.className =
        "login-message " +
        type;

}


/* ==================================================
   تصدير الدوال
================================================== */

window.TOPSTORE_AUTH = {

    getUsers,

    login,

    initializeUsers

};
