\n// ===== TOP STORE permission guard =====\nif (window.TOPSTORE_PERMISSIONS && !window.TOPSTORE_PERMISSIONS.has("accounts")) {\n    location.replace("dashboard.html");\n    throw new Error("TOP STORE: permission denied");\n}\n
"use strict";

/*
====================================================
 TOP STORE
 ACCOUNTS SYSTEM
====================================================
*/

const ACCOUNTS_KEY =
    "topStoreAccounts";

const SALES_KEY =
    "topStoreSales";

const EXPENSES_KEY =
    "topStoreExpenses";

const MAINTENANCE_KEY =
    "topStoreMaintenance";

const SETTLEMENT_PASSWORD =
    "1234";


let transactions = [];

let selectedDate = getToday();


/* ==================================================
   ELEMENTS
================================================== */

const accountDate =
    document.getElementById(
        "accountDate"
    );

const transactionsBody =
    document.getElementById(
        "transactionsBody"
    );

const transactionSearch =
    document.getElementById(
        "transactionSearch"
    );

const transactionModal =
    document.getElementById(
        "transactionModal"
    );

const settlementModal =
    document.getElementById(
        "settlementModal"
    );


/* ==================================================
   DATE
================================================== */

function getToday() {

    const date =
        new Date();

    return (
        date.getFullYear() +
        "-" +
        String(
            date.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            date.getDate()
        ).padStart(2, "0")
    );

}


/* ==================================================
   LOAD TRANSACTIONS
================================================== */

function loadTransactions() {

    try {

        transactions =
            JSON.parse(
                localStorage.getItem(
                    ACCOUNTS_KEY
                ) || "[]"
            );

    } catch {

        transactions = [];

    }


    if (!Array.isArray(
        transactions
    )) {

        transactions = [];

    }

}


/* ==================================================
   SAVE
================================================== */

function saveTransactions() {

    localStorage.setItem(
        ACCOUNTS_KEY,
        JSON.stringify(
            transactions
        )
    );

}


/* ==================================================
   GENERIC LOAD
================================================== */

function loadArray(key) {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(
                    key
                ) || "[]"
            );


        return Array.isArray(data)
            ? data
            : [];

    } catch {

        return [];

    }

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
   GET CURRENT USER
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
   SALES DATA
================================================== */

function getSalesForDate() {

    const sales =
        loadArray(
            SALES_KEY
        );


    return sales.filter(
        sale => {

            const date =
                sale.date ||
                sale.createdAt;


            if (!date) {
                return false;
            }


            return String(
                date
            ).substring(
                0,
                10
            ) === selectedDate;

        }
    );

}


/* ==================================================
   EXPENSES DATA
================================================== */

function getExpensesForDate() {

    const expenses =
        loadArray(
            EXPENSES_KEY
        );


    return expenses.filter(
        expense => {

            const date =
                expense.date ||
                expense.createdAt;


            if (!date) {
                return false;
            }


            return String(
                date
            ).substring(
                0,
                10
            ) === selectedDate;

        }
    );

}


/* ==================================================
   MAINTENANCE DATA
================================================== */

function getMaintenanceForDate() {

    const repairs =
        loadArray(
            MAINTENANCE_KEY
        );


    return repairs.filter(
        repair => {

            const date =
                repair.createdAt;


            if (!date) {
                return false;
            }


            return String(
                date
            ).substring(
                0,
                10
            ) === selectedDate;

        }
    );

}


/* ==================================================
   CALCULATE
================================================== */

function calculateAccounts() {

    const sales =
        getSalesForDate();


    const expenses =
        getExpensesForDate();


    const maintenance =
        getMaintenanceForDate();


    let salesTotal = 0;

    let paidTotal = 0;

    let remainingTotal = 0;


    sales.forEach(
        sale => {

            const total =
                Number(
                    sale.total ??
                    sale.netTotal ??
                    sale.amount ??
                    0
                );


            const paid =
                Number(
                    sale.paid ??
                    sale.payment ??
                    total
                );


            salesTotal +=
                total;


            paidTotal +=
                paid;


            remainingTotal +=
                Math.max(
                    total - paid,
                    0
                );

        }
    );


    let expensesTotal = 0;


    expenses.forEach(
        expense => {

            expensesTotal +=
                Number(
                    expense.amount ??
                    expense.value ??
                    expense.total ??
                    0
                );

        }
    );


    let maintenanceTotal = 0;


    maintenance.forEach(
        repair => {

            if (
                repair.status ===
                "cancelled"
            ) {

                return;

            }


            maintenanceTotal +=
                Number(
                    repair.paid ??
                    repair.repairCost ??
                    0
                );

        }
    );


    const manualIncome =
        transactions
            .filter(
                item =>
                    item.date ===
                        selectedDate &&
                    item.type ===
                        "income"
            )
            .reduce(
                (
                    sum,
                    item
                ) =>
                    sum +
                    Number(
                        item.amount || 0
                    ),
                0
            );


    const manualExpense =
        transactions
            .filter(
                item =>
                    item.date ===
                        selectedDate &&
                    item.type ===
                        "expense"
            )
            .reduce(
                (
                    sum,
                    item
                ) =>
                    sum +
                    Number(
                        item.amount || 0
                    ),
                0
            );


    const totalIncome =
        paidTotal +
        maintenanceTotal +
        manualIncome;


    const totalExpenses =
        expensesTotal +
        manualExpense;


    const net =
        totalIncome -
        totalExpenses;


    return {

        salesTotal,

        paidTotal,

        remainingTotal,

        expensesTotal:
            totalExpenses,

        maintenanceTotal,

        net

    };

}


/* ==================================================
   UPDATE STATS
================================================== */

function updateStats() {

    const data =
        calculateAccounts();


    document.getElementById(
        "salesTotal"
    ).textContent =
        money(
            data.salesTotal
        ) +
        " ج.م";


    document.getElementById(
        "paidTotal"
    ).textContent =
        money(
            data.paidTotal
        ) +
        " ج.م";


    document.getElementById(
        "remainingTotal"
    ).textContent =
        money(
            data.remainingTotal
        ) +
        " ج.م";


    document.getElementById(
        "expensesTotal"
    ).textContent =
        money(
            data.expensesTotal
        ) +
        " ج.م";


    document.getElementById(
        "maintenanceTotal"
    ).textContent =
        money(
            data.maintenanceTotal
        ) +
        " ج.م";


    document.getElementById(
        "netTotal"
    ).textContent =
        money(
            data.net
        ) +
        " ج.م";

}


/* ==================================================
   RENDER TRANSACTIONS
================================================== */

function renderTransactions() {

    if (!transactionsBody) {
        return;
    }


    const search =
        transactionSearch
            ? transactionSearch.value
                .trim()
                .toLowerCase()
            : "";


    const list =
        transactions.filter(
            item => {

                const matchesDate =
                    item.date ===
                    selectedDate;


                const text =
                    (
                        item.description +
                        " " +
                        item.type
                    ).toLowerCase();


                return (
                    matchesDate &&
                    (
                        !search ||
                        text.includes(
                            search
                        )
                    )
                );

            }
        );


    if (list.length === 0) {

        transactionsBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="
                        padding:40px;
                        color:#94a3b8;
                    ">

                    لا توجد حركات مالية لهذا اليوم

                </td>

            </tr>

        `;

        return;

    }


    transactionsBody.innerHTML =
        list.map(
            item => {

                const currentUser =
                    getCurrentUser();


                return `

                    <tr>

                        <td>
                            ${item.time || "-"}
                        </td>

                        <td>

                            <span class="${
                                item.type ===
                                "income"
                                    ? "income"
                                    : "expense"
                            }">

                                ${
                                    item.type ===
                                    "income"
                                        ? "إيراد"
                                        : "مصروف"
                                }

                            </span>

                        </td>

                        <td>

                            ${
                                escapeHtml(
                                    item.description ||
                                    "-"
                                )
                            }

                        </td>

                        <td class="${
                            item.type ===
                            "income"
                                ? "income"
                                : "expense"
                        }">

                            ${
                                money(
                                    item.amount
                                )
                            }

                            ج.م

                        </td>

                        <td>

                            ${
                                escapeHtml(
                                    item.employee ||
                                    currentUser?.name ||
                                    "-"
                                )
                            }

                        </td>

                        <td>

                            <button
                                class="delete-transaction"
                                onclick="deleteTransaction(${item.id})">

                                🗑️

                            </button>

                        </td>

                    </tr>

                `;

            }
        )
        .join("");

}


/* ==================================================
   ADD TRANSACTION
================================================== */

const addTransaction =
    document.getElementById(
        "addTransaction"
    );


if (addTransaction) {

    addTransaction.addEventListener(
        "click",
        () => {

            transactionModal.classList.add(
                "show"
            );

        }
    );

}


/* ==================================================
   CLOSE TRANSACTION
================================================== */

function closeTransaction() {

    transactionModal.classList.remove(
        "show"
    );

}


document.getElementById(
    "closeTransactionModal"
).onclick =
    closeTransaction;


document.getElementById(
    "cancelTransaction"
).onclick =
    closeTransaction;


/* ==================================================
   SAVE TRANSACTION
================================================== */

document.getElementById(
    "transactionForm"
).addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const type =
            document.getElementById(
                "transactionType"
            ).value;


        const description =
            document.getElementById(
                "transactionDescription"
            ).value.trim();


        const amount =
            Number(
                document.getElementById(
                    "transactionAmount"
                ).value
            );


        if (
            !description ||
            amount <= 0
        ) {

            showToast(
                "اكتب البيان والمبلغ",
                "error"
            );

            return;

        }


        const user =
            getCurrentUser();


        const now =
            new Date();


        transactions.unshift({

            id:
                Date.now(),

            date:
                selectedDate,

            time:
                now.toLocaleTimeString(
                    "ar-EG",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                ),

            type,

            description,

            amount,

            employee:
                user?.name ||
                "المستخدم"

        });


        saveTransactions();


        document.getElementById(
            "transactionForm"
        ).reset();


        closeTransaction();


        renderAll();


        showToast(
            "تم حفظ الحركة المالية ✓",
            "success"
        );

    }
);


/* ==================================================
   DELETE
================================================== */

function deleteTransaction(id) {

    const confirmed =
        confirm(
            "هل تريد حذف هذه الحركة المالية؟"
        );


    if (!confirmed) {
        return;
    }


    transactions =
        transactions.filter(
            item =>
                item.id !== id
        );


    saveTransactions();


    renderAll();


    showToast(
        "تم حذف الحركة",
        "success"
    );

}


/* ==================================================
   SETTLEMENT
================================================== */

document.getElementById(
    "settleDay"
).addEventListener(
    "click",
    function () {

        const data =
            calculateAccounts();


        document.getElementById(
            "settleSales"
        ).textContent =
            money(
                data.salesTotal
            ) +
            " ج.م";


        document.getElementById(
            "settlePaid"
        ).textContent =
            money(
                data.paidTotal
            ) +
            " ج.م";


        document.getElementById(
            "settleExpenses"
        ).textContent =
            money(
                data.expensesTotal
            ) +
            " ج.م";


        document.getElementById(
            "settleNet"
        ).textContent =
            money(
                data.net
            ) +
            " ج.م";


        document.getElementById(
            "settlementPassword"
        ).value = "";


        settlementModal.classList.add(
            "show"
        );

    }
);


/* ==================================================
   CLOSE SETTLEMENT
================================================== */

document.getElementById(
    "closeSettlementModal"
).onclick =
    function () {

        settlementModal.classList.remove(
            "show"
        );

    };


/* ==================================================
   CONFIRM SETTLEMENT
================================================== */

document.getElementById(
    "confirmSettlement"
).addEventListener(
    "click",
    function () {

        const password =
            document.getElementById(
                "settlementPassword"
            ).value;


        if (
            password !==
            SETTLEMENT_PASSWORD
        ) {

            showToast(
                "كلمة مرور التسوية غير صحيحة",
                "error"
            );

            return;

        }


        const data =
            calculateAccounts();


        const settlements =
            loadArray(
                "topStoreSettlements"
            );


        settlements.unshift({

            id:
                Date.now(),

            date:
                selectedDate,

            sales:
                data.salesTotal,

            paid:
                data.paidTotal,

            expenses:
                data.expensesTotal,

            net:
                data.net,

            createdAt:
                new Date()
                    .toISOString()

        });


        localStorage.setItem(
            "topStoreSettlements",
            JSON.stringify(
                settlements
            )
        );


        settlementModal.classList.remove(
            "show"
        );


        showToast(
            "تمت تسوية حساب اليوم ✓",
            "success"
        );

    }
);


/* ==================================================
   DATE CHANGE
================================================== */

accountDate.value =
    selectedDate;


accountDate.addEventListener(
    "change",
    function () {

        selectedDate =
            this.value ||
            getToday();


        renderAll();

    }
);


/* ==================================================
   TODAY
================================================== */

document.getElementById(
    "todayButton"
).addEventListener(
    "click",
    function () {

        selectedDate =
            getToday();


        accountDate.value =
            selectedDate;


        renderAll();

    }
);


/* ==================================================
   SEARCH
================================================== */

if (transactionSearch) {

    transactionSearch.addEventListener(
        "input",
        renderTransactions
    );

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
            "accountToast"
        );


    toast.textContent =
        message;


    toast.className =
        "toast show " +
        type;


    setTimeout(
        () => {

            toast.className =
                "toast";

        },
        2500
    );

}


/* ==================================================
   RENDER ALL
================================================== */

function renderAll() {

    updateStats();

    renderTransactions();

}


/* ==================================================
   START
================================================== */

loadTransactions();

renderAll();