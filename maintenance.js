/* TOP STORE - Maintenance */
"use strict";

const MAINTENANCE_KEY = "topStoreMaintenance";

function getMaintenance() {
    try {
        const data = localStorage.getItem(MAINTENANCE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function saveMaintenance(list) {
    localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(list));
}

function renderMaintenance() {
    const tbody = document.getElementById("maintenanceTable");
    const empty = document.getElementById("empty");
    if (!tbody) return;

    const list = getMaintenance();
    tbody.innerHTML = "";

    if (!list.length) {
        if (empty) empty.style.display = "block";
        return;
    }

    if (empty) empty.style.display = "none";

    list.slice().reverse().forEach((item, reverseIndex) => {
        const index = list.length - 1 - reverseIndex;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${escapeHTML(item.date)}</td>
            <td>${escapeHTML(item.customerName)}</td>
            <td>${escapeHTML(item.device)}</td>
            <td>${escapeHTML(item.problem)}</td>
            <td>${Number(item.cost || 0).toFixed(2)} ج.م</td>
            <td><span class="badge">${escapeHTML(item.status)}</span></td>
            <td><button class="danger" type="button" onclick="deleteMaintenance(${index})">حذف</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function deleteMaintenance(index) {
    if (!TOPSTORE.hasPermission("maintenance")) return;

    if (!confirm("هل تريد حذف سجل الصيانة؟")) return;

    const list = getMaintenance();
    list.splice(index, 1);
    saveMaintenance(list);
    renderMaintenance();
}

function initMaintenance() {
    const form = document.getElementById("maintenanceForm");
    if (!form) return;

    form.addEventListener("submit", e => {
        e.preventDefault();

        if (!TOPSTORE.hasPermission("maintenance")) {
            alert("ليس لديك صلاحية.");
            return;
        }

        const user = TOPSTORE.getCurrentUser();

        const item = {
            id: Date.now(),
            date: new Date().toLocaleString("ar-EG"),
            customerName: document.getElementById("customerName").value.trim(),
            customerPhone: document.getElementById("customerPhone").value.trim(),
            device: document.getElementById("device").value.trim(),
            serial: document.getElementById("serial").value.trim(),
            problem: document.getElementById("problem").value.trim(),
            cost: Number(document.getElementById("cost").value || 0),
            status: document.getElementById("status").value,
            notes: document.getElementById("notes").value.trim(),
            createdBy: user?.username || user?.name || "المستخدم"
        };

        if (!item.customerName || !item.device || !item.problem) {
            alert("من فضلك أكمل اسم العميل والجهاز والعطل.");
            return;
        }

        const list = getMaintenance();
        list.push(item);
        saveMaintenance(list);

        form.reset();
        document.getElementById("cost").value = "0";

        renderMaintenance();
        alert("تم حفظ الصيانة بنجاح ✅");
    });

    renderMaintenance();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMaintenance);
} else {
    initMaintenance();
}
