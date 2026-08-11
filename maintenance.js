"use strict";

/*
====================================================
 TOP STORE
 MAINTENANCE SYSTEM
====================================================
*/

const MAINTENANCE_KEY =
    "topStoreMaintenance";


let repairs = [];

let currentStatus = "all";

let editingId = null;


/* ==================================================
   ELEMENTS
================================================== */

const form =
    document.getElementById(
        "maintenanceForm"
    );

const tableBody =
    document.getElementById(
        "maintenanceTableBody"
    );

const searchInput =
    document.getElementById(
        "repairSearch"
    );

const statusFilters =
    document.querySelectorAll(
        ".status-filter"
    );

const repairNumber =
    document.getElementById(
        "repairNumber"
    );

const modal =
    document.getElementById(
        "repairModal"
    );

const closeModal =
    document.getElementById(
        "closeModal"
    );

const repairDetails =
    document.getElementById(
        "repairDetails"
    );

const resetForm =
    document.getElementById(
        "resetForm"
    );


/* ==================================================
   LOAD
================================================== */

function loadRepairs() {

    try {

        repairs =
            JSON.parse(
                localStorage.getItem(
                    MAINTENANCE_KEY
                ) || "[]"
            );

    } catch {

        repairs = [];

    }


    if (!Array.isArray(repairs)) {

        repairs = [];

    }

}


/* ==================================================
   SAVE
================================================== */

function saveRepairs() {

    localStorage.setItem(
        MAINTENANCE_KEY,
        JSON.stringify(
            repairs
        )
    );

}


/* ==================================================
   GENERATE NUMBER
================================================== */

function generateRepairNumber() {

    const now =
        new Date();


    const date =
        now.getFullYear() +
        String(
            now.getMonth() + 1
        ).padStart(2, "0") +
        String(
            now.getDate()
        ).padStart(2, "0");


    const number =
        String(
            repairs.length + 1
        ).padStart(4, "0");


    return (
        "REP-" +
        date +
        "-" +
        number
    );

}


/* ==================================================
   SHOW NEW NUMBER
================================================== */

function showNewRepairNumber() {

    if (!repairNumber) {
        return;
    }


    repairNumber.textContent =
        "رقم الطلب: " +
        generateRepairNumber();

}


/* ==================================================
   GET FORM DATA
================================================== */

function getFormData() {

    const cost =
        Number(
            document.getElementById(
                "repairCost"
            ).value
        ) || 0;


    const paid =
        Number(
            document.getElementById(
                "repairPaid"
            ).value
        ) || 0;


    return {

        customerName:
            document.getElementById(
                "customerName"
            ).value.trim(),

        customerPhone:
            document.getElementById(
                "customerPhone"
            ).value.trim(),

        deviceType:
            document.getElementById(
                "deviceType"
            ).value,

        deviceModel:
            document.getElementById(
                "deviceModel"
            ).value.trim(),

        deviceSerial:
            document.getElementById(
                "deviceSerial"
            ).value.trim(),

        technician:
            document.getElementById(
                "technician"
            ).value.trim(),

        expectedDate:
            document.getElementById(
                "expectedDate"
            ).value,

        repairCost:
            cost,

        paid:
            Math.min(
                paid,
                cost
            ),

        status:
            document.getElementById(
                "repairStatus"
            ).value,

        problem:
            document.getElementById(
                "problem"
            ).value.trim(),

        notes:
            document.getElementById(
                "notes"
            ).value.trim()

    };

}


/* ==================================================
   FORM SUBMIT
================================================== */

if (form) {

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const data =
                getFormData();


            if (
                !data.customerName ||
                !data.customerPhone ||
                !data.deviceType ||
                !data.deviceModel ||
                !data.problem
            ) {

                showToast(
                    "من فضلك أكمل البيانات المطلوبة",
                    "error"
                );

                return;

            }


            if (
                data.paid >
                data.repairCost
            ) {

                showToast(
                    "المدفوع لا يمكن أن يكون أكبر من تكلفة الصيانة",
                    "error"
                );

                return;

            }


            /*
             * تعديل
             */

            if (editingId !== null) {

                const index =
                    repairs.findIndex(
                        item =>
                            item.id ===
                            editingId
                    );


                if (index !== -1) {

                    repairs[index] = {

                        ...repairs[index],

                        ...data,

                        updatedAt:
                            new Date()
                                .toISOString()

                    };

                }


                showToast(
                    "تم تعديل أمر الصيانة ✓",
                    "success"
                );

            }

            /*
             * إضافة جديد
             */

            else {

                const repair = {

                    id:
                        Date.now(),

                    repairNumber:
                        generateRepairNumber(),

                    ...data,

                    createdAt:
                        new Date()
                            .toISOString()

                };


                repairs.unshift(
                    repair
                );


                showToast(
                    "تم حفظ أمر الصيانة ✓",
                    "success"
                );

            }


            saveRepairs();

            resetMaintenanceForm();

            renderAll();

        }
    );

}


/* ==================================================
   RESET
================================================== */

function resetMaintenanceForm() {

    if (!form) {
        return;
    }


    form.reset();


    document.getElementById(
        "repairCost"
    ).value = 0;


    document.getElementById(
        "repairPaid"
    ).value = 0;


    editingId = null;


    showNewRepairNumber();

}


/* ==================================================
   RESET BUTTON
================================================== */

if (resetForm) {

    resetForm.addEventListener(
        "click",
        function () {

            setTimeout(
                () => {

                    editingId = null;

                    showNewRepairNumber();

                },
                0
            );

        }
    );

}


/* ==================================================
   SEARCH
================================================== */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        renderTable
    );

}


/* ==================================================
   STATUS FILTER
================================================== */

statusFilters.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                statusFilters.forEach(
                    btn =>
                        btn.classList.remove(
                            "active"
                        )
                );


                this.classList.add(
                    "active"
                );


                currentStatus =
                    this.dataset.status ||
                    "all";


                renderTable();

            }
        );

    }
);


/* ==================================================
   FILTER REPAIRS
================================================== */

function getFilteredRepairs() {

    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    return repairs.filter(
        repair => {

            const matchesStatus =
                currentStatus === "all" ||
                repair.status ===
                    currentStatus;


            const text = (

                repair.repairNumber +
                " " +
                repair.customerName +
                " " +
                repair.customerPhone +
                " " +
                repair.deviceModel +
                " " +
                repair.deviceSerial +
                " " +
                repair.problem

            ).toLowerCase();


            const matchesSearch =
                !search ||
                text.includes(
                    search
                );


            return (
                matchesStatus &&
                matchesSearch
            );

        }
    );

}


/* ==================================================
   STATUS TEXT
================================================== */

function getStatusText(
    status
) {

    const names = {

        received:
            "مستلمة",

        inspection:
            "جاري الفحص",

        repairing:
            "تحت الصيانة",

        ready:
            "جاهزة",

        delivered:
            "تم التسليم",

        cancelled:
            "ملغاة"

    };


    return (
        names[status] ||
        status ||
        "-"
    );

}


/* ==================================================
   STATUS CLASS
================================================== */

function getStatusClass(
    status
) {

    return (
        "status-" +
        (
            status ||
            "received"
        )
    );

}


/* ==================================================
   MONEY
================================================== */

function money(value) {

    return Number(
        value || 0
    ).toLocaleString(
        "ar-EG",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


/* ==================================================
   DATE
================================================== */

function formatDate(value) {

    if (!value) {
        return "-";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleDateString(
        "ar-EG",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


/* ==================================================
   RENDER TABLE
================================================== */

function renderTable() {

    if (!tableBody) {
        return;
    }


    const list =
        getFilteredRepairs();


    if (list.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="empty-row">

                    لا توجد أوامر صيانة

                </td>

            </tr>

        `;

        return;

    }


    tableBody.innerHTML =
        list.map(
            repair => {

                const total =
                    Number(
                        repair.repairCost
                    ) || 0;


                const paid =
                    Number(
                        repair.paid
                    ) || 0;


                const remaining =
                    Math.max(
                        total - paid,
                        0
                    );


                return `

                    <tr>

                        <td>

                            <strong>
                                ${escapeHtml(
                                    repair.repairNumber
                                )}
                            </strong>

                        </td>


                        <td>

                            ${escapeHtml(
                                repair.customerName
                            )}

                            <br>

                            <small>
                                ${escapeHtml(
                                    repair.customerPhone
                                )}
                            </small>

                        </td>


                        <td>

                            ${escapeHtml(
                                repair.deviceType
                            )}

                            <br>

                            ${escapeHtml(
                                repair.deviceModel
                            )}

                        </td>


                        <td>

                            ${escapeHtml(
                                repair.problem
                            )}

                        </td>


                        <td>

                            ${money(
                                total
                            )}
                            ج.م

                        </td>


                        <td>

                            ${money(
                                paid
                            )}
                            ج.م

                        </td>


                        <td>

                            ${money(
                                remaining
                            )}
                            ج.م

                        </td>


                        <td>

                            <span
                                class="repair-status
                                ${getStatusClass(
                                    repair.status
                                )}">

                                ${getStatusText(
                                    repair.status
                                )}

                            </span>

                        </td>


                        <td>

                            ${formatDate(
                                repair.createdAt
                            )}

                        </td>


                        <td>

                            <div
                                class="action-buttons">

                                <button
                                    class="action-button view-button"
                                    onclick="viewRepair(${repair.id})"
                                    title="عرض">

                                    👁️

                                </button>


                                <button
                                    class="action-button edit-button"
                                    onclick="editRepair(${repair.id})"
                                    title="تعديل">

                                    ✏️

                                </button>


                                <button
                                    class="action-button delete-button"
                                    onclick="deleteRepair(${repair.id})"
                                    title="حذف">

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
   VIEW
================================================== */

function viewRepair(id) {

    const repair =
        repairs.find(
            item =>
                item.id === id
        );


    if (!repair) {
        return;
    }


    const total =
        Number(
            repair.repairCost
        ) || 0;


    const paid =
        Number(
            repair.paid
        ) || 0;


    const remaining =
        Math.max(
            total - paid,
            0
        );


    repairDetails.innerHTML = `

        <div class="detail-grid">


            <div class="detail-item">

                <span>
                    رقم الطلب
                </span>

                <strong>
                    ${escapeHtml(
                        repair.repairNumber
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    الحالة
                </span>

                <strong>
                    ${getStatusText(
                        repair.status
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    العميل
                </span>

                <strong>
                    ${escapeHtml(
                        repair.customerName
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    الهاتف
                </span>

                <strong>
                    ${escapeHtml(
                        repair.customerPhone
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    الجهاز
                </span>

                <strong>
                    ${escapeHtml(
                        repair.deviceType
                    )}
                    -
                    ${escapeHtml(
                        repair.deviceModel
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    IMEI / Serial
                </span>

                <strong>
                    ${escapeHtml(
                        repair.deviceSerial ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    الفني
                </span>

                <strong>
                    ${escapeHtml(
                        repair.technician ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    التسليم المتوقع
                </span>

                <strong>
                    ${formatDate(
                        repair.expectedDate
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    تكلفة الصيانة
                </span>

                <strong>
                    ${money(total)}
                    ج.م
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    المدفوع
                </span>

                <strong>
                    ${money(paid)}
                    ج.م
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    المتبقي
                </span>

                <strong>
                    ${money(remaining)}
                    ج.م
                </strong>

            </div>


            <div class="detail-item full">

                <span>
                    العطل
                </span>

                <strong>
                    ${escapeHtml(
                        repair.problem
                    )}
                </strong>

            </div>


            <div class="detail-item full">

                <span>
                    الملاحظات
                </span>

                <strong>
                    ${escapeHtml(
                        repair.notes ||
                        "لا توجد ملاحظات"
                    )}
                </strong>

            </div>

        </div>

    `;


    modal.classList.add(
        "show"
    );

}


/* ==================================================
   EDIT
================================================== */

function editRepair(id) {

    const repair =
        repairs.find(
            item =>
                item.id === id
        );


    if (!repair) {
        return;
    }


    editingId = id;


    document.getElementById(
        "customerName"
    ).value =
        repair.customerName || "";


    document.getElementById(
        "customerPhone"
    ).value =
        repair.customerPhone || "";


    document.getElementById(
        "deviceType"
    ).value =
        repair.deviceType || "";


    document.getElementById(
        "deviceModel"
    ).value =
        repair.deviceModel || "";


    document.getElementById(
        "deviceSerial"
    ).value =
        repair.deviceSerial || "";


    document.getElementById(
        "technician"
    ).value =
        repair.technician || "";


    document.getElementById(
        "expectedDate"
    ).value =
        repair.expectedDate || "";


    document.getElementById(
        "repairCost"
    ).value =
        repair.repairCost || 0;


    document.getElementById(
        "repairPaid"
    ).value =
        repair.paid || 0;


    document.getElementById(
        "repairStatus"
    ).value =
        repair.status || "received";


    document.getElementById(
        "problem"
    ).value =
        repair.problem || "";


    document.getElementById(
        "notes"
    ).value =
        repair.notes || "";


    if (repairNumber) {

        repairNumber.textContent =
            "تعديل الطلب: " +
            repair.repairNumber;

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ==================================================
   DELETE
================================================== */

function deleteRepair(id) {

    const repair =
        repairs.find(
            item =>
                item.id === id
        );


    if (!repair) {
        return;
    }


    const confirmed =
        confirm(
            "هل أنت متأكد من حذف أمر الصيانة:\n\n" +
            repair.repairNumber +
            "\n\nلا يمكن التراجع عن الحذف."
        );


    if (!confirmed) {
        return;
    }


    repairs =
        repairs.filter(
            item =>
                item.id !== id
        );


    saveRepairs();

    renderAll();


    showToast(
        "تم حذف أمر الصيانة",
        "success"
    );

}


/* ==================================================
   MODAL CLOSE
================================================== */

if (closeModal) {

    closeModal.addEventListener(
        "click",
        function () {

            modal.classList.remove(
                "show"
            );

        }
    );

}


if (modal) {

    modal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                modal
            ) {

                modal.classList.remove(
                    "show"
                );

            }

        }
    );

}


/* ==================================================
   STATISTICS
================================================== */

function updateStatistics() {

    const total =
        repairs.length;


    const pending =
        repairs.filter(
            item =>
                [
                    "received",
                    "inspection",
                    "repairing"
                ].includes(
                    item.status
                )
        ).length;


    const ready =
        repairs.filter(
            item =>
                item.status ===
                "ready"
        ).length;


    const revenue =
        repairs
            .filter(
                item =>
                    item.status !==
                    "cancelled"
            )
            .reduce(
                (
                    sum,
                    item
                ) =>
                    sum +
                    (
                        Number(
                            item.repairCost
                        ) || 0
                    ),
                0
            );


    document.getElementById(
        "totalRepairs"
    ).textContent =
        total;


    document.getElementById(
        "pendingRepairs"
    ).textContent =
        pending;


    document.getElementById(
        "readyRepairs"
    ).textContent =
        ready;


    document.getElementById(
        "repairRevenue"
    ).textContent =
        money(revenue) +
        " ج.م";

}


/* ==================================================
   ESCAPE HTML
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
   TOAST
================================================== */

function showToast(
    message,
    type = ""
) {

    const toast =
        document.getElementById(
            "maintenanceToast"
        );


    if (!toast) {
        return;
    }


    toast.textContent =
        message;


    toast.className =
        "maintenance-toast show " +
        type;


    setTimeout(
        function () {

            toast.className =
                "maintenance-toast";

        },
        2500
    );

}


/* ==================================================
   RENDER ALL
================================================== */

function renderAll() {

    renderTable();

    updateStatistics();

}


/* ==================================================
   START
================================================== */

loadRepairs();

showNewRepairNumber();

renderAll();