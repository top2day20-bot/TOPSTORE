/* =====================================================
   TOP STORE - users.js
===================================================== */

"use strict";

const ADMIN = {
    username: "admin",
    name: "المدير",
    password: "1234",
    role: "admin",
    active: true,
    permissions: {
        dashboard:true,
        sales:true,
        products:true,
        returns:true,
        maintenance:true,
        accounts:true,
        expenses:true,
        reports:true,
        users:true
    }
};

const permissionNames = {
    sales:"المبيعات",
    products:"المنتجات والمخزن",
    returns:"المرتجعات",
    maintenance:"الصيانة",
    accounts:"الحسابات",
    expenses:"المصروفات",
    reports:"التقارير",
    users:"المستخدمين"
};

let editIndex = -1;

function loadUsers() {
    let users = TOPSTORE.getUsers();

    if (!users.some(
        user =>
            String(user.username).toLowerCase() === "admin"
    )) {
        users.unshift(ADMIN);
        TOPSTORE.saveUsers(users);
    }

    return users;
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
}

function permissionsText(user) {

    if (TOPSTORE.isAdminForUser) {
        return "كل الصلاحيات";
    }

    if (
        String(user.role).toLowerCase() === "admin" ||
        String(user.username).toLowerCase() === "admin"
    ) {
        return "كل الصلاحيات";
    }

    const permissions = user.permissions || {};

    const names = Object.keys(permissionNames)
        .filter(key => permissions[key] === true)
        .map(key => permissionNames[key]);

    return names.length
        ? names.join("، ")
        : "لا توجد";
}

function renderUsers() {

    const tbody =
        document.getElementById("usersTable");

    if (!tbody) return;

    const users = loadUsers();

    tbody.innerHTML = "";

    users.forEach((user,index) => {

        const admin =
            String(user.username).toLowerCase() === "admin" ||
            String(user.role).toLowerCase() === "admin";

        const tr =
            document.createElement("tr");

        tr.innerHTML = `
            <td>${escapeHTML(user.username)}</td>
            <td>${escapeHTML(user.name)}</td>
            <td>
                ${admin ? "👑 المدير" : "👤 الموظف"}
            </td>
            <td>${escapeHTML(permissionsText(user))}</td>
            <td>
                <span class="badge">
                    ${user.active === false ? "متوقف" : "نشط"}
                </span>
            </td>
            <td>
                ${
                    admin
                    ? "—"
                    : `
                        <button
                            class="primary"
                            data-edit="${index}">
                            تعديل
                        </button>

                        <button
                            class="danger"
                            data-delete="${index}">
                            حذف
                        </button>
                    `
                }
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function getSelectedPermissions() {

    const result = {
        dashboard: true
    };

    document
        .querySelectorAll(
            'input[name="permission"]'
        )
        .forEach(check => {
            result[check.value] =
                check.checked;
        });

    return result;
}

function clearForm() {

    document
        .getElementById("userForm")
        .reset();

    editIndex = -1;

    document
        .getElementById("formTitle")
        .textContent =
        "إضافة موظف جديد";

    document
        .getElementById("cancelEdit")
        .style.display =
        "none";

    document
        .getElementById("password")
        .required = true;

    document
        .getElementById("passwordConfirm")
        .required = true;

    document
        .querySelectorAll(
            'input[name="permission"]'
        )
        .forEach((check,index) => {
            check.checked =
                index < 4;
        });
}

function startEdit(index) {

    const users = loadUsers();
    const user = users[index];

    if (!user) return;

    if (
        String(user.username).toLowerCase() === "admin"
    ) {
        alert("لا يمكن تعديل حساب المدير من هنا.");
        return;
    }

    editIndex = index;

    document.getElementById("username").value =
        user.username || "";

    document.getElementById("name").value =
        user.name || "";

    document.getElementById("password").value =
        user.password || "";

    document.getElementById("passwordConfirm").value =
        user.password || "";

    const permissions =
        user.permissions || {};

    document
        .querySelectorAll(
            'input[name="permission"]'
        )
        .forEach(check => {
            check.checked =
                permissions[check.value] === true;
        });

    document
        .getElementById("formTitle")
        .textContent =
        "تعديل الموظف";

    document
        .getElementById("cancelEdit")
        .style.display =
        "inline-block";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function deleteUser(index) {

    const users = loadUsers();
    const user = users[index];

    if (!user) return;

    if (
        String(user.username).toLowerCase() === "admin"
    ) {
        alert("لا يمكن حذف المدير.");
        return;
    }

    if (
        !confirm(
            "هل تريد حذف هذا الموظف؟"
        )
    ) {
        return;
    }

    users.splice(index,1);

    TOPSTORE.saveUsers(users);

    renderUsers();

    alert("تم حذف الموظف.");
}

document
    .getElementById("userForm")
    ?.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            const username =
                document
                    .getElementById("username")
                    .value
                    .trim();

            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;

            const passwordConfirm =
                document
                    .getElementById("passwordConfirm")
                    .value;

            if (!username || !name || !password) {
                alert("أكمل البيانات المطلوبة.");
                return;
            }

            if (password !== passwordConfirm) {
                alert("كلمتا المرور غير متطابقتين.");
                return;
            }

            if (
                username.toLowerCase() === "admin" &&
                editIndex !== 0
            ) {
                alert("اسم admin محجوز للمدير.");
                return;
            }

            const users = loadUsers();

            const duplicate =
                users.findIndex(
                    (user,index) =>
                        index !== editIndex &&
                        String(user.username).toLowerCase() ===
                        username.toLowerCase()
                );

            if (duplicate !== -1) {
                alert("اسم المستخدم موجود بالفعل.");
                return;
            }

            const data = {
                username,
                name,
                password,
                role: "employee",
                active: true,
                permissions: getSelectedPermissions()
            };

            if (editIndex === -1) {
                users.push(data);
                alert("تم إضافة الموظف بنجاح ✅");
            } else {
                users[editIndex] = {
                    ...users[editIndex],
                    ...data
                };
                alert("تم تعديل الصلاحيات بنجاح ✅");
            }

            TOPSTORE.saveUsers(users);

            clearForm();
            renderUsers();
        }
    );

document
    .getElementById("cancelEdit")
    ?.addEventListener(
        "click",
        clearForm
    );

document
    .getElementById("usersTable")
    ?.addEventListener(
        "click",
        event => {

            const edit =
                event.target.closest(
                    "[data-edit]"
                );

            const del =
                event.target.closest(
                    "[data-delete]"
                );

            if (edit) {
                startEdit(
                    Number(edit.dataset.edit)
                );
            }

            if (del) {
                deleteUser(
                    Number(del.dataset.delete)
                );
            }
        }
    );

renderUsers();
