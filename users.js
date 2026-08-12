/* TOP STORE - Users & Permissions */
"use strict";

const USERS_KEY = "topStoreUsers";

const DEFAULT_ADMIN = {
    username: "admin",
    name: "المدير",
    password: "1234",
    role: "admin",
    active: true,
    permissions: {
        dashboard:true,sales:true,products:true,returns:true,
        maintenance:true,accounts:true,expenses:true,reports:true,users:true
    }
};

const PERMISSION_NAMES = {
    sales:"المبيعات",
    products:"المنتجات والمخزن",
    returns:"المرتجعات",
    maintenance:"الصيانة",
    accounts:"الحسابات",
    expenses:"المصروفات",
    reports:"التقارير",
    users:"المستخدمين"
};

function getUsers() {
    try {
        const data = localStorage.getItem(USERS_KEY);
        const users = data ? JSON.parse(data) : [];

        if (!Array.isArray(users)) return [DEFAULT_ADMIN];

        if (!users.some(u => String(u.username).toLowerCase() === "admin")) {
            users.unshift(DEFAULT_ADMIN);
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }

        return users;
    } catch (e) {
        localStorage.setItem(USERS_KEY, JSON.stringify([DEFAULT_ADMIN]));
        return [DEFAULT_ADMIN];
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function renderUsers() {
    const tbody = document.getElementById("usersTable");
    if (!tbody) return;

    const users = getUsers();
    tbody.innerHTML = "";

    users.forEach((user, index) => {
        const isAdmin = String(user.role).toLowerCase() === "admin";
        const permissions = isAdmin
            ? "كل الصلاحيات"
            : Object.keys(user.permissions || {})
                .filter(k => user.permissions[k] && PERMISSION_NAMES[k])
                .map(k => PERMISSION_NAMES[k])
                .join("، ") || "لا توجد";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${escapeHTML(user.username)}</td>
            <td>${escapeHTML(user.name || user.fullName || "")}</td>
            <td class="role">${isAdmin ? "المدير" : "الموظف"}</td>
            <td>${escapeHTML(permissions)}</td>
            <td>${user.active === false ? "متوقف" : "نشط"}</td>
            <td>
                ${isAdmin
                    ? "—"
                    : `<button class="primary" onclick="editUser(${index})">تعديل</button>
                       <button class="danger" onclick="deleteUser(${index})">حذف</button>`
                }
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&","&amp;").replaceAll("<","&lt;")
        .replaceAll(">","&gt;").replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
}

function editUser(index) {
    const users = getUsers();
    const user = users[index];
    if (!user || user.role === "admin") return;

    const checks = document.querySelectorAll('input[name="perm"]');
    checks.forEach(c => {
        c.checked = user.permissions?.[c.value] === true;
    });

    document.getElementById("newUsername").value = user.username || "";
    document.getElementById("newName").value = user.name || "";
    document.getElementById("newPassword").value = user.password || "";

    document.getElementById("userForm").dataset.editIndex = String(index);
    window.scrollTo({top:0, behavior:"smooth"});
}

function deleteUser(index) {
    const users = getUsers();
    if (!users[index] || users[index].role === "admin") return;

    if (!confirm("هل تريد حذف هذا المستخدم؟")) return;

    users.splice(index, 1);
    saveUsers(users);
    renderUsers();
}

function initUsers() {
    if (!TOPSTORE.hasPermission("users")) return;

    const form = document.getElementById("userForm");

    form.addEventListener("submit", e => {
        e.preventDefault();

        const users = getUsers();
        const username = document.getElementById("newUsername").value.trim();
        const name = document.getElementById("newName").value.trim();
        const password = document.getElementById("newPassword").value;

        const editIndex = form.dataset.editIndex;
        const existingIndex = users.findIndex(
            u => String(u.username).toLowerCase() === username.toLowerCase()
        );

        if (existingIndex !== -1 &&
            String(existingIndex) !== String(editIndex)) {
            alert("اسم المستخدم موجود بالفعل.");
            return;
        }

        const permissions = {
            dashboard: true
        };

        document.querySelectorAll('input[name="perm"]').forEach(check => {
            permissions[check.value] = check.checked;
        });

        if (editIndex !== undefined && editIndex !== "") {
            const index = Number(editIndex);
            users[index] = {
                ...users[index],
                username,
                name,
                password,
                role: "employee",
                active: true,
                permissions
            };
            delete form.dataset.editIndex;
            alert("تم تعديل صلاحيات المستخدم بنجاح ✅");
        } else {
            users.push({
                username,
                name,
                password,
                role: "employee",
                active: true,
                permissions
            });
            alert("تم إضافة المستخدم بنجاح ✅");
        }

        saveUsers(users);
        form.reset();
        renderUsers();
    });

    renderUsers();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUsers);
} else {
    initUsers();
}
