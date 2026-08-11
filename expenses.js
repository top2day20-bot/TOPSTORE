"use strict";

/*
====================================================
 TOP STORE
 EXPENSES SYSTEM
====================================================
*/

const EXPENSES_KEY =
    "topStoreExpenses";

let expenses = [];

let selectedDate =
    getToday();


/* ==================================================
   ELEMENTS
================================================== */

const expenseDate =
    document.getElementById(
        "expenseDate"
    );

const expenseModal =
    document.getElementById(
        "expenseModal"
    );

const expensesBody =
    document.getElementById(
        "expensesBody"
    );

const expenseSearch =
    document.getElementById(
        "expenseSearch"
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
   LOAD
================================================== */

function loadExpenses() {

    try {

        expenses =
            JSON.parse(
                localStorage.getItem(
                    EXPENSES_KEY
                ) || "[]"
            );

    } catch {

        expenses = [];

    }


    if (!Array.isArray(expenses)) {

        expenses = [];

    }

}


/* ==================================================
   SAVE
================================================== */

function saveExpenses() {

    localStorage.setItem(
        EXPENSES_KEY,
        JSON.stringify(
            expenses
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
   GET TODAY EXPENSES
================================================== */

function getSelectedExpenses() {

    return expenses.filter(
        expense =>
            expense.date ===
            selectedDate
    );

}


/* ==================================================
   UPDATE SUMMARY
================================================== */

function updateSummary() {

    const list =
        getSelectedExpenses();


    const total =
        list.reduce(
            (
                sum,
                expense
            ) =>
                sum +
                Number(
                    expense.amount || 0
                ),
            0
        );


    const count =
        list.length;


    const average =
        count > 0
            ? total / count
            : 0;


    document.getElementById(
        "todayTotal"
    ).textContent =
        money(total) +
        " ج.م";


    document.getElementById(
        "todayCount"
    ).textContent =
        count;


    document.getElementById(
        "averageExpense"
    ).textContent =
        money(average) +
        " ج.م";

}


/* ==================================================
   RENDER
================================================== */

function renderExpenses() {

    const search =
        expenseSearch
            ? expenseSearch.value
                .trim()
                .toLowerCase()
            : "";


    const list =
        getSelectedExpenses()
            .filter(
                expense => {

                    const text =
                        (
                            expense.type +
                            " " +
                            expense.description
                        ).toLowerCase();


                    return (
                        !search ||
                        text.includes(
                            search
                        )
                    );

                }
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    Number(
                        b.id
                    ) -
                    Number(
                        a.id
                    )
            );


    if (list.length === 0) {

        expensesBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="
                        padding:45px;
                        color:#94a3b8;
                    ">

                    لا توجد مصروفات لهذا اليوم

                </td>

            </tr>

        `;

        return;

    }


    expensesBody.innerHTML =
        list.map(
            expense => {

                return `

                    <tr>

                        <td>
                            ${
                                escapeHtml(
                                    expense.time ||
                                    "-"
                                )
                            }
                        </td>

                        <td>

                            <span class="type-badge">

                                ${
                                    escapeHtml(
                                        expense.type ||
                                        "أخرى"
                                    )
                                }

                            </span>

                        </td>

                        <td>

                            ${
                                escapeHtml(
                                    expense.description ||
                                    "-"
                                )
                            }

                        </td>

                        <td class="amount">

                            ${
                                money(
                                    expense.amount
                                )
                            }

                            ج.م

                        </td>

                        <td>

                            ${
                                escapeHtml(
                                    expense.employee ||
                                    "-"
                                )
                            }

                        </td>

                        <td>

                            <button
                                class="delete-expense"
                                onclick="deleteExpense(${expense.id})">

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
   OPEN MODAL
================================================== */

document.getElementById(
    "addExpenseButton"
).addEventListener(
    "click",
    function () {

        expenseModal.classList.add(
            "show"
        );

    }
);


/* ==================================================
   CLOSE MODAL
================================================== */

function closeExpenseModal() {

    expenseModal.classList.remove(
        "show"
    );

}


document.getElementById(
    "closeExpenseModal"
).addEventListener(
    "click",
    closeExpenseModal
);


document.getElementById(
    "cancelExpense"
).addEventListener(
    "click",
    closeExpenseModal
);


/* ==================================================
   ADD EXPENSE
================================================== */

document.getElementById(
    "expenseForm"
).addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const type =
            document.getElementById(
                "expenseType"
            ).value;


        const description =
            document.getElementById(
                "expenseDescription"
            ).value.trim();


        const amount =
            Number(
                document.getElementById(
                    "expenseAmount"
                ).value
            );


        if (!description) {

            showToast(
                "اكتب بيان المصروف"
            );

            return;

        }


        if (
            !Number.isFinite(
                amount
            ) ||
            amount <= 0
        ) {

            showToast(
                "أدخل مبلغ صحيح"
            );

            return;

        }


        const user =
            getCurrentUser();


        const now =
            new Date();


        const expense = {

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
                user?.username ||
                "المستخدم",

            createdAt:
                now.toISOString()

        };


        expenses.push(
            expense
        );


        saveExpenses();


        document.getElementById(
            "expenseForm"
        ).reset();


        closeExpenseModal();


        renderAll();


        showToast(
            "تم حفظ المصروف بنجاح ✓"
        );

    }
);


/* ==================================================
   DELETE EXPENSE
================================================== */

function deleteExpense(id) {

    const expense =
        expenses.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!expense) {
        return;
    }


    const confirmed =
        confirm(
            `هل تريد حذف المصروف "${expense.description}" بمبلغ ${money(expense.amount)} ج.م؟`
        );


    if (!confirmed) {
        return;
    }


    expenses =
        expenses.filter(
            item =>
                Number(item.id) !==
                Number(id)
        );


    saveExpenses();


    renderAll();


    showToast(
        "تم حذف المصروف ✓"
    );

}


/* ==================================================
   DATE
================================================== */

expenseDate.value =
    selectedDate;


expenseDate.addEventListener(
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


        expenseDate.value =
            selectedDate;


        renderAll();

    }
);


/* ==================================================
   SEARCH
================================================== */

if (expenseSearch) {

    expenseSearch.addEventListener(
        "input",
        renderExpenses
    );

}


/* ==================================================
   TOAST
================================================== */

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "expenseToast"
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

    renderExpenses();

}


/* ==================================================
   START
================================================== */

loadExpenses();

renderAll();