"use strict";

/* =========================================
   TOP STORE
   REPORTS SYSTEM
   ========================================= */

const SALES_KEY = "topStoreSales";
const RETURNS_KEY = "topStoreReturns";
const PRODUCTS_KEY = "topStoreProducts";


let sales = [];
let returns = [];
let products = [];

let currentPeriod = "today";


/* =========================================
   ELEMENTS
   ========================================= */

const totalSales =
    document.getElementById(
        "totalSales"
    );

const totalReturns =
    document.getElementById(
        "totalReturns"
    );

const netSales =
    document.getElementById(
        "netSales"
    );

const invoiceCount =
    document.getElementById(
        "invoiceCount"
    );

const productsCount =
    document.getElementById(
        "productsCount"
    );

const lowStockCount =
    document.getElementById(
        "lowStockCount"
    );

const outOfStockCount =
    document.getElementById(
        "outOfStockCount"
    );

const averageInvoice =
    document.getElementById(
        "averageInvoice"
    );

const topProductsBody =
    document.getElementById(
        "topProductsBody"
    );

const latestSalesBody =
    document.getElementById(
        "latestSalesBody"
    );

const stockAlertsBody =
    document.getElementById(
        "stockAlertsBody"
    );

const paymentMethods =
    document.getElementById(
        "paymentMethods"
    );

const refreshReports =
    document.getElementById(
        "refreshReports"
    );

const reportToast =
    document.getElementById(
        "reportToast"
    );


/* =========================================
   LOAD DATA
   ========================================= */

function loadData() {

    try {

        sales = JSON.parse(
            localStorage.getItem(
                SALES_KEY
            ) || "[]"
        );

    } catch {

        sales = [];
    }


    try {

        returns = JSON.parse(
            localStorage.getItem(
                RETURNS_KEY
            ) || "[]"
        );

    } catch {

        returns = [];
    }


    try {

        products = JSON.parse(
            localStorage.getItem(
                PRODUCTS_KEY
            ) || "[]"
        );

    } catch {

        products = [];
    }


    if (!Array.isArray(sales)) {
        sales = [];
    }

    if (!Array.isArray(returns)) {
        returns = [];
    }

    if (!Array.isArray(products)) {
        products = [];
    }
}


/* =========================================
   PERIOD
   ========================================= */

function getPeriodDates() {

    const now =
        new Date();


    let start =
        new Date(now);


    if (currentPeriod === "today") {

        start.setHours(
            0,
            0,
            0,
            0
        );

    }


    else if (
        currentPeriod === "week"
    ) {

        const day =
            now.getDay();

        const difference =
            day === 0
                ? 6
                : day - 1;


        start.setDate(
            now.getDate() -
            difference
        );

        start.setHours(
            0,
            0,
            0,
            0
        );

    }


    else if (
        currentPeriod === "month"
    ) {

        start =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );

    }


    else {

        start =
            new Date(0);
    }


    return {
        start,
        end: now
    };
}


/* =========================================
   DATE CHECK
   ========================================= */

function isInPeriod(dateValue) {

    if (
        currentPeriod === "all"
    ) {

        return true;
    }


    if (!dateValue) {

        return false;
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return false;
    }


    const period =
        getPeriodDates();


    return (
        date >= period.start &&
        date <= period.end
    );
}


/* =========================================
   FILTER SALES
   ========================================= */

function getFilteredSales() {

    return sales.filter(
        sale =>
            isInPeriod(
                sale.date
            )
    );
}


/* =========================================
   FILTER RETURNS
   ========================================= */

function getFilteredReturns() {

    return returns.filter(
        item =>
            isInPeriod(
                item.date
            )
    );
}


/* =========================================
   FORMAT MONEY
   ========================================= */

function formatMoney(value) {

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


/* =========================================
   FORMAT DATE
   ========================================= */

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


/* =========================================
   UPDATE MAIN STATS
   ========================================= */

function updateMainStats() {

    const filteredSales =
        getFilteredSales();


    const filteredReturns =
        getFilteredReturns();


    let salesTotal = 0;

    let returnsTotal = 0;


    filteredSales.forEach(
        sale => {

            salesTotal +=
                Number(
                    sale.total
                ) || 0;

        }
    );


    filteredReturns.forEach(
        item => {

            returnsTotal +=
                Number(
                    item.total
                ) || 0;

        }
    );


    const net =
        salesTotal -
        returnsTotal;


    const invoiceTotal =
        filteredSales.length;


    const average =
        invoiceTotal > 0
            ? salesTotal /
              invoiceTotal
            : 0;


    if (totalSales) {

        totalSales.textContent =
            formatMoney(
                salesTotal
            ) +
            " ج.م";
    }


    if (totalReturns) {

        totalReturns.textContent =
            formatMoney(
                returnsTotal
            ) +
            " ج.م";
    }


    if (netSales) {

        netSales.textContent =
            formatMoney(
                net
            ) +
            " ج.م";
    }


    if (invoiceCount) {

        invoiceCount.textContent =
            invoiceTotal;
    }


    if (averageInvoice) {

        averageInvoice.textContent =
            formatMoney(
                average
            ) +
            " ج.م";
    }
}


/* =========================================
   STOCK STATS
   ========================================= */

function updateStockStats() {

    let low = 0;

    let out = 0;


    products.forEach(
        product => {

            const quantity =
                Number(
                    product.quantity
                ) || 0;


            const minimum =
                Number(
                    product.minQuantity
                ) || 0;


            if (quantity <= 0) {

                out++;

            }

            else if (
                quantity <= minimum
            ) {

                low++;
            }

        }
    );


    if (productsCount) {

        productsCount.textContent =
            products.length;
    }


    if (lowStockCount) {

        lowStockCount.textContent =
            low;
    }


    if (outOfStockCount) {

        outOfStockCount.textContent =
            out;
    }
}


/* =========================================
   TOP PRODUCTS
   ========================================= */

function renderTopProducts() {

    if (!topProductsBody) {
        return;
    }


    const filteredSales =
        getFilteredSales();


    const productMap = {};


    filteredSales.forEach(
        sale => {

            const items =
                sale.items || [];


            items.forEach(
                item => {

                    const key =
                        String(
                            item.productId ??
                            item.barcode ??
                            item.name
                        );


                    if (
                        !productMap[key]
                    ) {

                        productMap[key] = {

                            name:
                                item.name ||
                                "منتج",

                            quantity:
                                0,

                            total:
                                0
                        };

                    }


                    productMap[key].quantity +=
                        Number(
                            item.qty
                        ) || 0;


                    productMap[key].total +=
                        Number(
                            item.total
                        ) ||
                        (
                            Number(
                                item.price
                            ) || 0
                        ) *
                        (
                            Number(
                                item.qty
                            ) || 0
                        );

                }
            );

        }
    );


    const list =
        Object.values(
            productMap
        )
        .sort(
            (a, b) =>
                b.quantity -
                a.quantity
        )
        .slice(
            0,
            10
        );


    if (list.length === 0) {

        topProductsBody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="empty-table">

                    لا توجد مبيعات في هذه الفترة

                </td>

            </tr>

        `;

        return;
    }


    topProductsBody.innerHTML =
        list.map(
            (
                item,
                index
            ) => {

                let rankClass = "";


                if (index === 0) {
                    rankClass = "first";
                }

                else if (index === 1) {
                    rankClass = "second";
                }

                else if (index === 2) {
                    rankClass = "third";
                }


                return `

                    <tr>

                        <td>

                            <div
                                class="rank ${rankClass}">

                                ${index + 1}

                            </div>

                        </td>


                        <td
                            class="product-report-name">

                            ${escapeHtml(
                                item.name
                            )}

                        </td>


                        <td>

                            ${item.quantity}

                        </td>


                        <td>

                            ${formatMoney(
                                item.total
                            )}
                            ج.م

                        </td>

                    </tr>

                `;

            }
        )
        .join("");
}


/* =========================================
   LATEST SALES
   ========================================= */

function renderLatestSales() {

    if (!latestSalesBody) {
        return;
    }


    const filteredSales =
        getFilteredSales()
        .slice()
        .sort(
            (
                a,
                b
            ) =>
                new Date(
                    b.date
                ) -
                new Date(
                    a.date
                )
        )
        .slice(
            0,
            10
        );


    if (
        filteredSales.length === 0
    ) {

        latestSalesBody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="empty-table">

                    لا توجد فواتير في هذه الفترة

                </td>

            </tr>

        `;

        return;
    }


    latestSalesBody.innerHTML =
        filteredSales.map(
            sale => `

                <tr>

                    <td>

                        <strong>

                            ${escapeHtml(
                                sale.invoice ||
                                "-"
                            )}

                        </strong>

                    </td>


                    <td>

                        ${escapeHtml(
                            sale.customerName ||
                            "عميل نقدي"
                        )}

                    </td>


                    <td>

                        <strong>

                            ${formatMoney(
                                sale.total
                            )}
                            ج.م

                        </strong>

                    </td>


                    <td>

                        ${formatDate(
                            sale.date
                        )}

                    </td>

                </tr>

            `
        )
        .join("");
}


/* =========================================
   STOCK ALERTS
   ========================================= */

function renderStockAlerts() {

    if (!stockAlertsBody) {
        return;
    }


    const alerts =
        products.filter(
            product => {

                const quantity =
                    Number(
                        product.quantity
                    ) || 0;


                const minimum =
                    Number(
                        product.minQuantity
                    ) || 0;


                return (
                    quantity <=
                    minimum
                );

            }
        )
        .sort(
            (
                a,
                b
            ) =>
                (
                    Number(
                        a.quantity
                    ) || 0
                ) -
                (
                    Number(
                        b.quantity
                    ) || 0
                )
        )
        .slice(
            0,
            20
        );


    if (alerts.length === 0) {

        stockAlertsBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty-table">

                    المخزون بحالة جيدة ✓

                </td>

            </tr>

        `;

        return;
    }


    stockAlertsBody.innerHTML =
        alerts.map(
            product => {

                const quantity =
                    Number(
                        product.quantity
                    ) || 0;


                const minimum =
                    Number(
                        product.minQuantity
                    ) || 0;


                let status =
                    "جيد";

                let statusClass =
                    "good";


                if (
                    quantity <= 0
                ) {

                    status =
                        "نفد المخزون";

                    statusClass =
                        "out";

                }

                else if (
                    quantity <=
                    minimum
                ) {

                    status =
                        "مخزون منخفض";

                    statusClass =
                        "low";
                }


                return `

                    <tr>

                        <td
                            class="product-report-name">

                            ${escapeHtml(
                                product.name ||
                                "-"
                            )}

                        </td>


                        <td>

                            ${escapeHtml(
                                product.barcode ||
                                "-"
                            )}

                        </td>


                        <td>

                            <strong>

                                ${quantity}

                            </strong>

                        </td>


                        <td>

                            ${minimum}

                        </td>


                        <td>

                            <span
                                class="stock-status ${statusClass}">

                                ${status}

                            </span>

                        </td>

                    </tr>

                `;

            }
        )
        .join("");
}


/* =========================================
   PAYMENT METHODS
   ========================================= */

function renderPaymentMethods() {

    if (!paymentMethods) {
        return;
    }


    const filteredSales =
        getFilteredSales();


    const methods = {};


    filteredSales.forEach(
        sale => {

            const method =
                sale.paymentMethod ||
                "cash";


            if (!methods[method]) {

                methods[method] = {

                    total:
                        0,

                    count:
                        0

                };

            }


            methods[method].total +=
                Number(
                    sale.total
                ) || 0;


            methods[method].count++;

        }
    );


    const names = {

        cash:
            "💵 نقدي",

        card:
            "💳 بطاقة",

        vodafone:
            "📱 فودافون كاش",

        instapay:
            "⚡ InstaPay",

        wallet:
            "📱 محفظة",

        other:
            "💰 أخرى"
    };


    const entries =
        Object.entries(
            methods
        );


    if (entries.length === 0) {

        paymentMethods.innerHTML = `

            <div class="payment-box">

                <div class="payment-title">

                    لا توجد بيانات

                </div>

                <strong>
                    0.00 ج.م
                </strong>

                <small>
                    لا توجد مبيعات في الفترة
                </small>

            </div>

        `;

        return;
    }


    paymentMethods.innerHTML =
        entries.map(
            (
                [
                    key,
                    data
                ]
            ) => `

                <div class="payment-box">

                    <div
                        class="payment-title">

                        ${names[key] || key}

                    </div>


                    <strong>

                        ${formatMoney(
                            data.total
                        )}
                        ج.م

                    </strong>


                    <small>

                        ${data.count}
                        فاتورة

                    </small>

                </div>

            `
        )
        .join("");
}


/* =========================================
   RENDER EVERYTHING
   ========================================= */

function renderReports() {

    loadData();

    updateMainStats();

    updateStockStats();

    renderTopProducts();

    renderLatestSales();

    renderStockAlerts();

    renderPaymentMethods();
}


/* =========================================
   FILTER BUTTONS
   ========================================= */

document
    .querySelectorAll(
        ".filter-btn"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".filter-btn"
                        )
                        .forEach(
                            btn =>
                                btn.classList
                                    .remove(
                                        "active"
                                    )
                        );


                    button.classList.add(
                        "active"
                    );


                    currentPeriod =
                        button.dataset.period ||
                        "today";


                    renderReports();

                }
            );

        }
    );


/* =========================================
   REFRESH
   ========================================= */

if (refreshReports) {

    refreshReports.addEventListener(
        "click",
        () => {

            renderReports();

            showToast(
                "تم تحديث التقارير ✓",
                "success"
            );

        }
    );
}


/* =========================================
   ESCAPE HTML
   ========================================= */

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


/* =========================================
   TOAST
   ========================================= */

function showToast(
    message,
    type = ""
) {

    if (!reportToast) {

        return;
    }


    reportToast.textContent =
        message;


    reportToast.className =
        "report-toast show " +
        type;


    setTimeout(
        () => {

            reportToast.className =
                "report-toast";

        },
        2500
    );
}


/* =========================================
   START
   ========================================= */

renderReports();