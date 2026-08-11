"use strict";

/* =========================================
   TOP STORE - RETURNS SYSTEM
   ========================================= */

const SALES_KEY = "topStoreSales";
const PRODUCTS_KEY = "topStoreProducts";
const RETURNS_KEY = "topStoreReturns";


let sales = [];
let products = [];

let selectedSale = null;


/* =========================================
   Elements
   ========================================= */

const invoiceSearch =
    document.getElementById(
        "invoiceSearch"
    );

const searchInvoiceButton =
    document.getElementById(
        "searchInvoiceButton"
    );

const invoiceInfo =
    document.getElementById(
        "invoiceInfo"
    );

const returnPanel =
    document.getElementById(
        "returnPanel"
    );

const emptyReturns =
    document.getElementById(
        "emptyReturns"
    );

const returnProductsBody =
    document.getElementById(
        "returnProductsBody"
    );

const returnItemsCount =
    document.getElementById(
        "returnItemsCount"
    );

const returnTotal =
    document.getElementById(
        "returnTotal"
    );

const returnReason =
    document.getElementById(
        "returnReason"
    );

const confirmReturn =
    document.getElementById(
        "confirmReturn"
    );

const cancelReturn =
    document.getElementById(
        "cancelReturn"
    );

const toast =
    document.getElementById(
        "toast"
    );


/* =========================================
   Load Data
   ========================================= */

function loadData() {

    try {

        sales =
            JSON.parse(
                localStorage.getItem(
                    SALES_KEY
                ) || "[]"
            );

        products =
            JSON.parse(
                localStorage.getItem(
                    PRODUCTS_KEY
                ) || "[]"
            );

    } catch {

        sales = [];

        products = [];
    }


    if (!Array.isArray(sales)) {
        sales = [];
    }

    if (!Array.isArray(products)) {
        products = [];
    }
}


/* =========================================
   Save Products
   ========================================= */

function saveProducts() {

    localStorage.setItem(
        PRODUCTS_KEY,
        JSON.stringify(products)
    );
}


/* =========================================
   Save Returns
   ========================================= */

function loadReturns() {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(
                    RETURNS_KEY
                ) || "[]"
            );

        return Array.isArray(data)
            ? data
            : [];

    } catch {

        return [];
    }
}


function saveReturns(data) {

    localStorage.setItem(
        RETURNS_KEY,
        JSON.stringify(data)
    );
}


/* =========================================
   Search Invoice
   ========================================= */

function searchInvoice() {

    loadData();


    const invoice =
        invoiceSearch
            .value
            .trim();


    if (!invoice) {

        showToast(
            "اكتب رقم الفاتورة أولاً",
            "error"
        );

        invoiceSearch.focus();

        return;
    }


    selectedSale =
        sales.find(
            sale =>
                String(
                    sale.invoice
                ).trim() === invoice
        );


    if (!selectedSale) {

        hideInvoice();

        showToast(
            "الفاتورة غير موجودة",
            "error"
        );

        return;
    }


    showInvoice();

    renderReturnProducts();
}


/* =========================================
   Show Invoice
   ========================================= */

function showInvoice() {

    if (emptyReturns) {

        emptyReturns.style.display =
            "none";
    }


    if (invoiceInfo) {

        invoiceInfo.style.display =
            "grid";
    }


    if (returnPanel) {

        returnPanel.style.display =
            "block";
    }


    document.getElementById(
        "invoiceNumber"
    ).textContent =
        selectedSale.invoice || "-";


    document.getElementById(
        "invoiceDate"
    ).textContent =
        formatDate(
            selectedSale.date
        );


    document.getElementById(
        "invoiceCustomer"
    ).textContent =
        selectedSale.customerName ||
        "عميل نقدي";


    document.getElementById(
        "invoiceTotal"
    ).textContent =
        formatMoney(
            selectedSale.total
        ) + " ج.م";
}


/* =========================================
   Hide Invoice
   ========================================= */

function hideInvoice() {

    selectedSale = null;


    if (invoiceInfo) {

        invoiceInfo.style.display =
            "none";
    }


    if (returnPanel) {

        returnPanel.style.display =
            "none";
    }


    if (emptyReturns) {

        emptyReturns.style.display =
            "block";
    }
}


/* =========================================
   Already Returned Quantity
   ========================================= */

function getReturnedQuantity(
    invoice,
    productId
) {

    const returns =
        loadReturns();


    let quantity = 0;


    returns.forEach(item => {

        if (
            String(item.invoice) ===
                String(invoice) &&
            String(item.productId) ===
                String(productId)
        ) {

            quantity +=
                Number(
                    item.quantity
                ) || 0;
        }

    });


    return quantity;
}


/* =========================================
   Render Products
   ========================================= */

function renderReturnProducts() {

    if (
        !selectedSale ||
        !returnProductsBody
    ) {
        return;
    }


    returnProductsBody.innerHTML = "";


    const items =
        selectedSale.items || [];


    items.forEach(
        (item, index) => {

            const productId =
                item.productId;


            const soldQuantity =
                Number(item.qty) || 0;


            const alreadyReturned =
                getReturnedQuantity(
                    selectedSale.invoice,
                    productId
                );


            const availableReturn =
                Math.max(
                    0,
                    soldQuantity -
                    alreadyReturned
                );


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td class="return-product-name">

                    ${escapeHtml(
                        item.name
                    )}

                </td>


                <td class="return-barcode">

                    ${escapeHtml(
                        item.barcode || "-"
                    )}

                </td>


                <td>

                    ${formatMoney(
                        item.price
                    )}

                    ج.م

                </td>


                <td>

                    ${soldQuantity}

                </td>


                <td>

                    ${alreadyReturned}

                </td>


                <td>

                    <input
                        type="number"
                        class="return-qty"
                        min="0"
                        max="${availableReturn}"
                        value="0"
                        data-index="${index}"
                        data-product-id="${escapeHtml(
                            productId
                        )}"
                        ${availableReturn === 0
                            ? "disabled"
                            : ""}
                    >

                    <small
                        style="
                            display:block;
                            color:#94a3b8;
                            margin-top:4px;
                        ">

                        المتاح:
                        ${availableReturn}

                    </small>

                </td>


                <td>

                    <strong
                        class="row-return-total"
                        data-index="${index}">

                        0.00 ج.م

                    </strong>

                </td>

            `;


            returnProductsBody.appendChild(
                row
            );

        }
    );


    document
        .querySelectorAll(
            ".return-qty"
        )
        .forEach(input => {

            input.addEventListener(
                "input",
                calculateReturn
            );

        });


    calculateReturn();
}


/* =========================================
   Calculate Return
   ========================================= */

function calculateReturn() {

    if (!selectedSale) {
        return;
    }


    const inputs =
        document.querySelectorAll(
            ".return-qty"
        );


    let count = 0;

    let total = 0;


    inputs.forEach(input => {

        const index =
            Number(
                input.dataset.index
            );


        const item =
            selectedSale.items[index];


        if (!item) {
            return;
        }


        let quantity =
            Number(input.value) || 0;


        const sold =
            Number(item.qty) || 0;


        const returned =
            getReturnedQuantity(
                selectedSale.invoice,
                item.productId
            );


        const max =
            Math.max(
                0,
                sold - returned
            );


        if (quantity < 0) {

            quantity = 0;

            input.value = 0;
        }


        if (quantity > max) {

            quantity = max;

            input.value = max;

            showToast(
                `الحد الأقصى للإرجاع هو ${max}`,
                "error"
            );
        }


        const rowTotal =
            quantity *
            Number(item.price || 0);


        const totalElement =
            document.querySelector(
                `.row-return-total[data-index="${index}"]`
            );


        if (totalElement) {

            totalElement.textContent =
                formatMoney(
                    rowTotal
                ) + " ج.م";
        }


        count += quantity;

        total += rowTotal;

    });


    if (returnItemsCount) {

        returnItemsCount.textContent =
            count;
    }


    if (returnTotal) {

        returnTotal.textContent =
            formatMoney(total) +
            " ج.م";
    }


    return {
        count,
        total
    };
}


/* =========================================
   Confirm Return
   ========================================= */

if (confirmReturn) {

    confirmReturn.addEventListener(
        "click",
        processReturn
    );
}


function processReturn() {

    if (!selectedSale) {

        showToast(
            "اختر فاتورة أولاً",
            "error"
        );

        return;
    }


    loadData();


    const inputs =
        document.querySelectorAll(
            ".return-qty"
        );


    const selectedItems = [];


    inputs.forEach(input => {

        const quantity =
            Number(input.value) || 0;


        if (quantity <= 0) {
            return;
        }


        const index =
            Number(
                input.dataset.index
            );


        const item =
            selectedSale.items[index];


        if (!item) {
            return;
        }


        const alreadyReturned =
            getReturnedQuantity(
                selectedSale.invoice,
                item.productId
            );


        const max =
            Math.max(
                0,
                Number(item.qty) -
                alreadyReturned
            );


        if (quantity > max) {

            showToast(
                `كمية مرتجع "${item.name}" غير صحيحة`,
                "error"
            );

            return;
        }


        selectedItems.push({

            productId:
                item.productId,

            barcode:
                item.barcode,

            name:
                item.name,

            price:
                Number(item.price) || 0,

            quantity:
                quantity,

            total:
                quantity *
                (
                    Number(item.price) || 0
                )
        });

    });


    if (selectedItems.length === 0) {

        showToast(
            "حدد كمية مرتجعة واحدة على الأقل",
            "error"
        );

        return;
    }


    const reason =
        returnReason
            ? returnReason.value.trim()
            : "";


    const total =
        selectedItems.reduce(
            (
                sum,
                item
            ) =>
                sum + item.total,
            0
        );


    const confirmed =
        confirm(
            `تأكيد إرجاع المنتجات؟\n\nقيمة المرتجع: ${formatMoney(total)} ج.م`
        );


    if (!confirmed) {
        return;
    }


    /* =====================================
       إعادة الكمية للمخزن
       ===================================== */

    selectedItems.forEach(
        returnItem => {

            const product =
                products.find(
                    p =>
                        String(p.id) ===
                        String(
                            returnItem.productId
                        )
                );


            if (product) {

                product.quantity =
                    (
                        Number(
                            product.quantity
                        ) || 0
                    ) +
                    returnItem.quantity;

            } else {

                /*
                   لو المنتج لم يعد موجودًا
                   في المخزن، نعيد إنشاءه
                */

                products.push({

                    id:
                        returnItem.productId,

                    barcode:
                        returnItem.barcode,

                    name:
                        returnItem.name,

                    category:
                        "مرتجع",

                    buyPrice:
                        0,

                    sellPrice:
                        returnItem.price,

                    quantity:
                        returnItem.quantity,

                    minQuantity:
                        0
                });
            }

        }
    );


    saveProducts();


    /* =====================================
       تسجيل المرتجع
       ===================================== */

    const returns =
        loadReturns();


    const returnRecord = {

        id:
            Date.now().toString(),

        invoice:
            selectedSale.invoice,

        date:
            new Date().toISOString(),

        customerName:
            selectedSale.customerName ||
            "",

        reason:
            reason,

        total:
            total,

        items:
            selectedItems

    };


    returns.push(
        returnRecord
    );


    saveReturns(
        returns
    );


    showToast(
        "تم المرتجع وإعادة الكمية للمخزن ✓",
        "success"
    );


    setTimeout(
        () => {

            resetReturnPage();

        },
        900
    );
}


/* =========================================
   Reset
   ========================================= */

function resetReturnPage() {

    selectedSale = null;


    if (invoiceSearch) {

        invoiceSearch.value = "";
    }


    if (returnReason) {

        returnReason.value = "";
    }


    hideInvoice();

    loadData();
}


/* =========================================
   Cancel
   ========================================= */

if (cancelReturn) {

    cancelReturn.addEventListener(
        "click",
        resetReturnPage
    );
}


/* =========================================
   Search Events
   ========================================= */

if (searchInvoiceButton) {

    searchInvoiceButton.addEventListener(
        "click",
        searchInvoice
    );
}


if (invoiceSearch) {

    invoiceSearch.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                searchInvoice();
            }

        }
    );
}


/* =========================================
   Helpers
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

        return value;
    }


    return date.toLocaleString(
        "ar-EG"
    );
}


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


function showToast(
    message,
    type = ""
) {

    if (!toast) {

        alert(message);

        return;
    }


    toast.textContent =
        message;


    toast.className =
        "return-toast show " +
        type;


    setTimeout(
        () => {

            toast.className =
                "return-toast";

        },
        2800
    );
}


/* =========================================
   Start
   ========================================= */

loadData();