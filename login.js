/* =========================================
   TOP STORE WEB
   Login System
   ========================================= */

"use strict";


/* =========================================
   Login Settings
   ========================================= */

const LOGIN_USERNAME = "admin";
const LOGIN_PASSWORD = "1234";

const DASHBOARD_PAGE = "dashboard.html";


/* =========================================
   Elements
   ========================================= */

const loginForm =
    document.getElementById("loginForm");

const usernameInput =
    document.getElementById("username");

const passwordInput =
    document.getElementById("password");

const togglePassword =
    document.getElementById("togglePassword");

const loginButton =
    document.getElementById("loginButton");

const loginMessage =
    document.getElementById("loginMessage");


/* =========================================
   Show Message
   ========================================= */

function showMessage(message, type) {

    loginMessage.textContent = message;

    loginMessage.className =
        "login-message " + type;
}


/* =========================================
   Clear Message
   ========================================= */

function clearMessage() {

    loginMessage.textContent = "";

    loginMessage.className =
        "login-message";
}


/* =========================================
   Loading
   ========================================= */

function setLoading(isLoading) {

    if (isLoading) {

        loginButton.classList.add("loading");

        loginButton.disabled = true;

    } else {

        loginButton.classList.remove("loading");

        loginButton.disabled = false;
    }
}


/* =========================================
   Toggle Password
   ========================================= */

togglePassword.addEventListener(
    "click",
    function () {

        const isPassword =
            passwordInput.type === "password";

        if (isPassword) {

            passwordInput.type = "text";

            togglePassword.textContent = "🙈";

            togglePassword.setAttribute(
                "aria-label",
                "إخفاء كلمة المرور"
            );

        } else {

            passwordInput.type = "password";

            togglePassword.textContent = "👁";

            togglePassword.setAttribute(
                "aria-label",
                "إظهار كلمة المرور"
            );
        }
    }
);


/* =========================================
   Login
   ========================================= */

loginForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        clearMessage();

        const username =
            usernameInput.value.trim();

        const password =
            passwordInput.value;


        /* Empty username */

        if (username === "") {

            showMessage(
                "من فضلك أدخل اسم المستخدم.",
                "error"
            );

            usernameInput.focus();

            return;
        }


        /* Empty password */

        if (password === "") {

            showMessage(
                "من فضلك أدخل كلمة المرور.",
                "error"
            );

            passwordInput.focus();

            return;
        }


        /* Loading */

        setLoading(true);


        /*
         * تأخير بسيط لمحاكاة عملية تسجيل الدخول.
         * لاحقًا هنربطها بقاعدة بيانات حقيقية.
         */

        setTimeout(function () {

            if (
                username === LOGIN_USERNAME &&
                password === LOGIN_PASSWORD
            ) {

                showMessage(
                    "تم تسجيل الدخول بنجاح...",
                    "success"
                );


                /*
                 * حفظ بيانات الجلسة مؤقتًا.
                 * هنطورها لاحقًا لنظام مستخدمين وصلاحيات.
                 */

                sessionStorage.setItem(
                    "topStoreLoggedIn",
                    "true"
                );

                sessionStorage.setItem(
                    "topStoreUsername",
                    username
                );


                /*
                 * الانتقال إلى الصفحة الرئيسية.
                 */

                window.location.href =
                    DASHBOARD_PAGE;

            } else {

                setLoading(false);

                showMessage(
                    "اسم المستخدم أو كلمة المرور غير صحيحة.",
                    "error"
                );

                passwordInput.value = "";

                passwordInput.focus();
            }

        }, 700);

    }
);


/* =========================================
   Enter Key
   ========================================= */

usernameInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            passwordInput.focus();

        }

    }
);


/* =========================================
   Prevent Empty Spaces at Start
   ========================================= */

usernameInput.addEventListener(
    "input",
    function () {

        this.value =
            this.value.replace(/^\s+/, "");

    }
);


/* =========================================
   Initial Focus
   ========================================= */

window.addEventListener(
    "load",
    function () {

        usernameInput.focus();

    }
);