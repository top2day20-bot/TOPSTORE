\n// ===== TOP STORE permission guard =====\nif (window.TOPSTORE_PERMISSIONS && !window.TOPSTORE_PERMISSIONS.has("users")) {\n    location.replace("dashboard.html");\n    throw new Error("TOP STORE: permission denied");\n}\n
"use strict";

/*
====================================================
 TOP STORE
 USERS SYSTEM
====================================================
*/

const USERS_KEY =
    "topStoreUsers";


let users = [];

let editingUserId = null;


/* ==================================================
   ELEMENTS
================================================== */

const userModal =
    document.getElementById(
        "userModal"
    );

const userForm =
    document.getElementById(
        "userForm"
    );

const usersBody =
    document.getElementById(
        "usersBody"
    );

const userSearch =
    document.getElementById(
        "userSearch"
    );


/* ==================================================
   DEFAULT ADMIN
================================================== */

const defaultAdmin = {

    id: "admin-default",

    fullName: "مدير النظام",

    username: "admin",

    password: "1234",

    role: "admin",

    active: true,

    createdAt:
        new Date().toISOString()

};


/* ==================================================
   LOAD USERS
================================================== */

function loadUsers() {

    try {

        users =
            JSON.parse(
                localStorage.getItem(
                    USERS_KEY
                ) || "[]"
            );

    } catch {

        users = [];

    }


    if (!Array.isArray(users)) {

        users = [];

    }


    /*
    لو مفيش أي مستخدمين
    نضيف المدير الافتراضي
    */

    if (users.length === 0) {

        users = [
            defaultAdmin
        ];

        saveUsers();

    }


    /*
    التأكد إن admin موجود
    */

    const adminExists =
        users.some(
            user =>
                user.username ===
                "admin"
        );


    if (!adminExists) {

        users.unshift(
            defaultAdmin
        );

        saveUsers();

    }

}


/* ==================================================
   SAVE
================================================== */

function saveUsers() {

    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(
            users
        )
    );

}


/* ==================================================
   CURRENT USER
================================================== */

function getCurrentUser() {

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


/* ==================================================
   MONEY
================================================== */

function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* ==================================================
   DATE
================================================== */

function formatDate(date) {

    if (!date) {
        return "-";
    }


    const d =
        new Date(date);


    if (
        Number.isNaN(
            d.getTime()
        )
    ) {

        return "-";

    }


    return d.toLocaleDateString(
        "ar-EG"
    );

}


/* ==================================================
   SUMMARY
================================================== */

function updateSummary() {

    const total =
        users.length;


    const admins =
        users.filter(
            user =>
                user.role ===
                "admin"
        ).length;


    const employees =
        users.filter(
            user =>
                user.role ===
                "employee"
        ).length;


    const active =
        users.filter(
            user =>
                user.active !== false
        ).length;


    document.getElementById(
        "totalUsers"
    ).textContent =
        total;


    document.getElementById(
        "totalAdmins"
    ).textContent =
        admins;


    document.getElementById(
        "totalEmployees"
    ).textContent =
        employees;


    document.getElementById(
        "activeUsers"
    ).textContent =
        active;

}


/* ==================================================
   RENDER
================================================== */

function renderUsers() {

    const search =
        userSearch
            ? userSearch.value
                .trim()
                .toLowerCase()
            : "";


    const list =
        users.filter(
            user => {

                const text =
                    (
                        user.fullName +
                        " " +
                        user.username +
                        " " +
                        user.role
                    ).toLowerCase();


                return (
                    !search ||
                    text.includes(
                        search
                    )
                );

            }
        );


    if (list.length === 0) {

        usersBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="
                        padding:45px;
                        color:#94a3b8;
                    ">

                    لا يوجد مستخدمون

                </td>

            </tr>

        `;

        return;

    }


    usersBody.innerHTML =
        list.map(
            user => {

                const role =
                    user.role ===
                    "admin"
                        ? "مدير"
                        : "موظف";


                const roleClass =
                    user.role ===
                    "admin"
                        ? "role-admin"
                        : "role-employee";


                const active =
                    user.active !==
                    false;


                return `

                    <tr>

                        <td>

                            <strong>
                                ${
                                    escapeHtml(
                                        user.fullName
                                    )
                                }
                            </strong>

                        </td>


                        <td>

                            ${
                                escapeHtml(
                                    user.username
                                )
                            }

                        </td>


                        <td>

                            <span
                                class="role-badge ${roleClass}">

                                ${role}

                            </span>

                        </td>


                        <td>

                            <span
                                class="
                                    status-badge
                                    ${
                                        active
                                            ? "status-active"
                                            : "status-inactive"
                                    }
                                ">

                                ${
                                    active
                                        ? "نشط"
                                        : "متوقف"
                                }

                            </span>

                        </td>


                        <td>

                            ${
                                formatDate(
                                    user.createdAt
                                )
                            }

                        </td>


                        <td>

                            <div
                                class="action-buttons">

                                <button
                                    class="
                                        action-button
                                        edit-button
                                    "
                                    onclick="editUser('${user.id}')">

                                    ✏️

                                </button>


                                <button
                                    class="
                                        action-button
                                        toggle-button
                                    "
                                    onclick="toggleUser('${user.id}')">

                                    ${
                                        active
                                            ? "⏸️"
                                            : "▶️"
                                    }

                                </button>


                                <button
                                    class="
                                        action-button
                                        delete-button
                                    "
                                    onclick="deleteUser('${user.id}')">

                                    🗑️

                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            }
        )
        .join("");

}


/* ==================================================
   OPEN ADD
================================================== */

document.getElementById(
    "addUserButton"
).addEventListener(
    "click",
    function () {

        editingUserId =
            null;


        document.getElementById(
            "modalTitle"
        ).textContent =
            "إضافة مستخدم";


        userForm.reset();


        document.getElementById(
            "isActive"
        ).checked =
            true;


        document.getElementById(
            "password"
        ).required =
            true;


        userModal.classList.add(
            "show"
        );

    }
);


/* ==================================================
   CLOSE
================================================== */

function closeModal() {

    userModal.classList.remove(
        "show"
    );


    editingUserId =
        null;


    userForm.reset();

}


document.getElementById(
    "closeModal"
).addEventListener(
    "click",
    closeModal
);


document.getElementById(
    "cancelButton"
).addEventListener(
    "click",
    closeModal
);


/* ==================================================
   EDIT
================================================== */

function editUser(id) {

    const user =
        users.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!user) {
        return;
    }


    editingUserId =
        id;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "تعديل المستخدم";


    document.getElementById(
        "userId"
    ).value =
        user.id;


    document.getElementById(
        "fullName"
    ).value =
        user.fullName;


    document.getElementById(
        "username"
    ).value =
        user.username;


    document.getElementById(
        "password"
    ).value =
        "";


    document.getElementById(
        "password"
    ).required =
        false;


    document.getElementById(
        "role"
    ).value =
        user.role;


    document.getElementById(
        "isActive"
    ).checked =
        user.active !== false;


    userModal.classList.add(
        "show"
    );

}


/* ==================================================
   SAVE USER
================================================== */

userForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const fullName =
            document.getElementById(
                "fullName"
            ).value.trim();


        const username =
            document.getElementById(
                "username"
            ).value.trim();


        const password =
            document.getElementById(
                "password"
            ).value;


        const role =
            document.getElementById(
                "role"
            ).value;


        const active =
            document.getElementById(
                "isActive"
            ).checked;


        if (
            !fullName ||
            !username
        ) {

            showToast(
                "أكمل بيانات المستخدم"
            );

            return;

        }


        /*
        منع تكرار اسم المستخدم
        */

        const duplicate =
            users.some(
                user =>
                    user.username
                        .toLowerCase() ===
                    username.toLowerCase() &&
                    String(user.id) !==
                    String(editingUserId)
            );


        if (duplicate) {

            showToast(
                "اسم المستخدم موجود بالفعل"
            );

            return;

        }


        /* ================= EDIT ================= */

        if (editingUserId) {

            const user =
                users.find(
                    item =>
                        String(item.id) ===
                        String(editingUserId)
                );


            if (!user) {
                return;
            }


            user.fullName =
                fullName;


            user.username =
                username;


            user.role =
                role;


            user.active =
                active;


            /*
            لو كتب باسورد جديد
            */

            if (password) {

                user.password =
                    password;

            }


            showToast(
                "تم تعديل المستخدم ✓"
            );

        }


        /* ================= ADD ================= */

        else {

            if (!password) {

                showToast(
                    "اكتب كلمة المرور"
                );

                return;

            }


            users.push({

                id:
                    Date.now()
                    .toString(),

                fullName,

                username,

                password,

                role,

                active,

                createdAt:
                    new Date()
                        .toISOString()

            });


            showToast(
                "تم إضافة المستخدم ✓"
            );

        }


        saveUsers();


        closeModal();


        renderAll();

    }
);


/* ==================================================
   DELETE
================================================== */

function deleteUser(id) {

    const user =
        users.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!user) {
        return;
    }


    /*
    منع حذف المدير الافتراضي
    */

    if (
        user.id ===
        "admin-default"
    ) {

        showToast(
            "لا يمكن حذف مدير النظام الأساسي"
        );

        return;

    }


    /*
    منع حذف آخر مدير
    */

    if (
        user.role ===
        "admin"
    ) {

        const adminCount =
            users.filter(
                item =>
                    item.role ===
                    "admin"
            ).length;


        if (
            adminCount <= 1
        ) {

            showToast(
                "لا يمكن حذف آخر مدير في النظام"
            );

            return;

        }

    }


    const confirmed =
        confirm(
            `هل تريد حذف المستخدم "${user.fullName}"؟`
        );


    if (!confirmed) {
        return;
    }


    users =
        users.filter(
            item =>
                String(item.id) !==
                String(id)
        );


    saveUsers();


    renderAll();


    showToast(
        "تم حذف المستخدم ✓"
    );

}


/* ==================================================
   TOGGLE USER
================================================== */

function toggleUser(id) {

    const user =
        users.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!user) {
        return;
    }


    if (
        user.id ===
        "admin-default"
    ) {

        showToast(
            "لا يمكن إيقاف مدير النظام الأساسي"
        );

        return;

    }


    user.active =
        user.active === false;


    saveUsers();


    renderAll();


    showToast(
        user.active
            ? "تم تفعيل المستخدم ✓"
            : "تم إيقاف المستخدم"
    );

}


/* ==================================================
   SEARCH
================================================== */

if (userSearch) {

    userSearch.addEventListener(
        "input",
        renderUsers
    );

}


/* ==================================================
   LOGOUT
================================================== */

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "topStoreCurrentUser"
            );

            window.location.href =
                "index.html";

        }
    );

}


/* ==================================================
   DISPLAY CURRENT USER
================================================== */

function displayCurrentUser() {

    const user =
        getCurrentUser();


    if (!user) {
        return;
    }


    document.getElementById(
        "usernameDisplay"
    ).textContent =
        user.name ||
        user.fullName ||
        user.username ||
        "المستخدم";


    document.getElementById(
        "roleDisplay"
    ).textContent =
        user.role ===
        "admin"
            ? "مدير"
            : "موظف";

}


/* ==================================================
   TOAST
================================================== */

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        function () {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}


/* ==================================================
   RENDER ALL
================================================== */

function renderAll() {

    updateSummary();

    renderUsers();

    displayCurrentUser();

}


/* ==================================================
   START
================================================== */

loadUsers();

renderAll();