"use strict";

/* ==========================================
   TOP STORE - LOGIN SYSTEM
   ========================================== */

const USERS_KEY = "topStoreUsers";
const CURRENT_USER_KEY = "topStoreCurrentUser";

/* ------------------------------------------
   الحصول على العناصر
------------------------------------------ */

const loginForm =
    document.querySelector("#loginForm") ||
    document.querySelector("form");

const usernameInput =
    document.querySelector("#username") ||
    document.querySelector("#usernameInput") ||
    document.querySelector('input[name="username"]') ||
    document.querySelector('input[type="text"]');

const passwordInput =
    document.querySelector("#password") ||
    document.querySelector("#passwordInput") ||
    document.querySelector('input[name="password"]') ||
    document.querySelector('input[type="password"]');

const loginButton =
    document.querySelector("#loginButton") ||
    document.querySelector("#loginBtn") ||
    document.querySelector('button[type="submit"]');


/* ------------------------------------------
   المستخدم الافتراضي
------------------------------------------ */

const defaultAdmin = {
    id: "admin-default",
    fullName: "مدير النظام",
    username: "admin",
    password: "1234",
    role: "admin",
    active: true,
    createdAt: new Date().toISOString()
};


/* ------------------------------------------
   إنشاء مستخدمي النظام
------------------------------------------ */

function loadUsers() {

    let users = [];

    try {

        users = JSON.parse(
            localStorage.getItem(USERS_KEY) || "[]"
        );

    } catch (error) {

        users = [];

    }

    if (!Array.isArray(users)) {
        users = [];
    }

    /*
       لو مفيش مستخدمين
       نضيف المدير الأساسي
    */

    if (users.length === 0) {

        users.push(defaultAdmin);

        localStorage.setItem(
            USERS_KEY,
            JSON.stringify(users)
        );

    }

    /*
       التأكد إن المدير الأساسي موجود
    */

    const adminExists = users.some(
        user =>
            String(user.username).toLowerCase() ===
            "admin"
    );

    if (!adminExists) {

        users.unshift(defaultAdmin);

        localStorage.setItem(
            USERS_KEY,
            JSON.stringify(users)
        );

    }

    return users;
}


/* ------------------------------------------
   رسالة للمستخدم
------------------------------------------ */

function showLoginMessage(message, type = "error") {

    let messageBox =
        document.getElementById("loginMessage");

    /*
       لو الرسالة مش موجودة في HTML
       ننشئها تلقائيًا
    */

    if (!messageBox) {

        messageBox =
            document.createElement("div");

        messageBox.id =
            "loginMessage";

        messageBox.style.marginTop =
            "12px";

        messageBox.style.textAlign =
            "center";

        messageBox.style.fontSize =
            "13px";

        messageBox.style.fontWeight =
            "bold";

        if (loginForm) {

            loginForm.appendChild(
                messageBox
            );

        } else if (loginButton) {

            loginButton.parentElement.appendChild(
                messageBox
            );

        } else {

            document.body.appendChild(
                messageBox
            );

        }

    }

    messageBox.textContent =
        message;

    if (type === "success") {

        messageBox.style.color =
            "#16a34a";

    } else {

        messageBox.style.color =
            "#dc2626";

    }

}


/* ------------------------------------------
   تسجيل الدخول
------------------------------------------ */

function login() {

    if (!usernameInput || !passwordInput) {

        alert(
            "خطأ: لم يتم العثور على خانات تسجيل الدخول."
        );

        return;

    }

    const username =
        usernameInput.value.trim();

    const password =
        passwordInput.value;

    if (!username) {

        showLoginMessage(
            "اكتب اسم المستخدم"
        );

        usernameInput.focus();

        return;

    }

    if (!password) {

        showLoginMessage(
            "اكتب كلمة المرور"
        );

        passwordInput.focus();

        return;

    }


    const users =
        loadUsers();


    /*
       البحث عن المستخدم
    */

    const user =
        users.find(
            item => {

                const savedUsername =
                    String(
                        item.username || ""
                    )
                    .trim()
                    .toLowerCase();

                const enteredUsername =
                    username
                        .toLowerCase();

                return (
                    savedUsername ===
                    enteredUsername
                );

            }
        );


    /*
       المستخدم غير موجود
    */

    if (!user) {

        showLoginMessage(
            "اسم المستخدم أو كلمة المرور غير صحيحة"
        );

        passwordInput.value = "";

        return;

    }


    /*
       الحساب متوقف
    */

    if (
        user.active === false
    ) {

        showLoginMessage(
            "هذا الحساب متوقف. تواصل مع المدير."
        );

        passwordInput.value = "";

        return;

    }


    /*
       التحقق من كلمة المرور
    */

    if (
        String(user.password) !==
        String(password)
    ) {

        showLoginMessage(
            "اسم المستخدم أو كلمة المرور غير صحيحة"
        );

        passwordInput.value = "";

        return;

    }


    /*
       نجاح تسجيل الدخول
    */

    const currentUser = {

        id:
            user.id,

        username:
            user.username,

        fullName:
            user.fullName ||
            user.name ||
            user.username,

        name:
            user.fullName ||
            user.name ||
            user.username,

        role:
            user.role === "admin"
                ? "admin"
                : "employee",

        active:
            user.active !== false

    };


    /*
       حفظ المستخدم الحالي
    */

    localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(
            currentUser
        )
    );


    showLoginMessage(
        "تم تسجيل الدخول بنجاح ✓",
        "success"
    );


    /*
       الانتقال للوحة التحكم
    */

    setTimeout(
        function () {

            window.location.href =
                "dashboard.html";

        },
        300
    );

}


/* ------------------------------------------
   تشغيل تسجيل الدخول
------------------------------------------ */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            login();

        }
    );

}


if (loginButton) {

    loginButton.addEventListener(
        "click",
        function (event) {

            /*
               لو الزر داخل form
               الـ submit هيشتغل لوحده
            */

            if (
                !loginForm
            ) {

                event.preventDefault();

                login();

            }

        }
    );

}


/* ------------------------------------------
   Enter من الكيبورد
------------------------------------------ */

if (passwordInput) {

    passwordInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                login();

            }

        }
    );

}


/* ------------------------------------------
   تشغيل المستخدمين
------------------------------------------ */

loadUsers();
