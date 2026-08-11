"use strict";

/* =========================================
   TOP STORE - SALES SYSTEM
   المبيعات + المخزن + الفواتير
   ========================================= */

const PRODUCTS_KEY = "topStoreProducts";
const SALES_KEY = "topStoreSales";

let cart = [];
let products = [];


/* =========================================
   العناصر
   ========================================= */

const productInput =
    document.getElementById("productInput");

const addProductButton =
    document.getElementById("addProductButton");

const cartBody =
    document.getElementById("cartBody");

const emptyCart =
    document.getElementById("emptyCart");

const itemsCount =
    document.getElementById("itemsCount");

const subtotalElement =
    document.getElementById("subtotal");

const discountInput =
    document.getElementById("discountInput");

const discountType =
    document.getElementById("discountType");

const discountValueElement =
    document.getElementById("discountValue");

const grandTotalElement =
    document.getElementById("grandTotal");

const paidInput =
    document.getElementById("paidInput");

const remainingElement =
    document.getElementById("remaining");

const saveSaleButton =
    document.getElementById("saveSale");

const clearSaleButton =
    document.getElementById("clearSale");

const printSaleButton =
    document.getElementById("printSale");

const paymentMethod =
    document.getElementById("paymentMethod");

const customerName =
    document.getElementById("customerName");

const customerPhone =
    document.getElementById("customerPhone");

const invoiceNumberElement =
    document.getElementById("invoiceNumber");

const toast =
    document.getElementById("toast");


/* =========================================
   تحميل المنتجات من المخزن
   ========================================= */

function loadProducts() {

    try {

        const saved =
            localStorage.getItem(PRODUCTS_KEY);

        products =
            saved ? JSON.parse(saved) : [];

        if (!Array.isArray(products)) {
            products = [];
        }

    } catch (error) {

        console.error(
            "خطأ في تحميل المنتجات:",
            error
        );

        products = [];
    }
}


/* =========================================
   حفظ المنتجات في المخزن
   ========================================= */

function saveProducts() {

    localStorage.setItem(
        PRODUCTS_KEY,
        JSON.stringify(products)
    );
}


/* =========================================
   رقم الفاتورة
   ========================================= */

function generateInvoiceNumber() {

    const now = new Date();

    return (
        now.getFullYear().toString() +
        (now.getMonth() + 1)
            .toString()
            .padStart(2, "0") +
        now.getDate()
            .toString()
            .padStart(2, "0") +
        "-" +
        now.getHours()
            .toString()
            .padStart(2, "0") +
        now.getMinutes()
            .toString()
            .padStart(2, "0") +
        now.getSeconds()
            .toString()
            .padStart(2, "0")
    );
}


function newInvoiceNumber() {

    if (invoiceNumberElement) {

        invoiceNumberElement.textContent =
            generateInvoiceNumber();
    }
}


/* =========================================
   رسالة النظام
   ========================================= */

function showToast(
    message,
    type = ""
) {

    if (!toast) {
        alert(message);
        return;
    }

    toast.textContent = message;

    toast.className =
        "toast show " + type;

    setTimeout(() => {

        toast.className =
            "toast";

    }, 2500);
}


/* =========================================
   البحث عن المنتج
   ========================================= */

function findProduct(search) {

    const value =
        String(search)
            .trim()
            .toLowerCase();


    if (!value) {
        return null;
    }


    return products.find(product => {

        const barcode =
            String(
                product.barcode ?? ""
            ).toLowerCase();

        const name =
            String(
                product.name ?? ""
            ).toLowerCase();


        return (
            barcode === value ||
            name === value
        );

    }) || products.find(product => {

        const barcode =
            String(
                product.barcode ?? ""
            ).toLowerCase();

        const name =
            String(
                product.name ?? ""
            ).toLowerCase();


        return (
            barcode.includes(value) ||
            name.includes(value)
        );
    });
}


/* =========================================
   إضافة منتج
   ========================================= */

function addProduct() {

    loadProducts();


    const search =
        productInput.value.trim();


    if (!search) {

        showToast(
            "اكتب الباركود أو اسم المنتج",
            "error"
        );

        productInput.focus();

        return;
    }


    if (products.length === 0) {

        showToast(
            "المخزن فارغ، أضف منتجات أولاً",
            "error"
        );

        return;
    }


    const product =
        findProduct(search);


    if (!product) {

        showToast(
            "المنتج غير موجود في المخزن",
            "error"
        );

        return;
    }


    const stock =
        Number(product.quantity) || 0;


    if (stock <= 0) {

        showToast(
            "هذا المنتج غير متوفر في المخزن",
            "error"
        );

        return;
    }


    const existing =
        cart.find(item =>
            item.productId === product.id
        );


    if (existing) {

        if (
            existing.qty >=
            stock
        ) {

            showToast(
                "لا توجد كمية إضافية من المنتج",
                "error"
            );

            return;
        }


        existing.qty++;

    } else {

        cart.push({

            productId:
                product.id,

            barcode:
                product.barcode,

            name:
                product.name,

            price:
                Number(product.sellPrice) || 0,

            qty:
                1,

            stock:
                stock,

            discount:
                0
        });
    }


    productInput.value = "";

    renderCart();

    productInput.focus();
}


/* =========================================
   زر إضافة
   ========================================= */

if (addProductButton) {

    addProductButton.addEventListener(
        "click",
        addProduct
    );
}


/* =========================================
   Enter للباركود
   ========================================= */

if (productInput) {

    productInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                addProduct();
            }
        }
    );
}


/* =========================================
   رسم السلة
   ========================================= */

function renderCart() {

    if (!cartBody) {
        return;
    }


    cartBody.innerHTML = "";


    if (cart.length === 0) {

        if (emptyCart) {
            emptyCart.style.display =
                "block";
        }

    } else {

        if (emptyCart) {
            emptyCart.style.display =
                "none";
        }
    }


    cart.forEach(
        (item, index) => {

            const row =
                document.createElement("tr");


            const total =
                (
                    item.price *
                    item.qty
                ) -
                (
                    Number(item.discount) ||
                    0
                );


            row.innerHTML = `

                <td class="product-name">

                    ${escapeHtml(item.name)}

                    <small
                        style="
                            display:block;
                            color:#94a3b8;
                            margin-top:3px;
                        ">

                        ${escapeHtml(
                            item.barcode
                        )}

                    </small>

                </td>


                <td>

                    ${formatMoney(
                        item.price
                    )}

                </td>


                <td>

                    <div class="qty-control">

                        <button
                            type="button"
                            onclick="
                                changeQuantity(
                                    ${index},
                                    -1
                                )
                            ">

                            −

                        </button>


                        <span class="qty-value">

                            ${item.qty}

                        </span>


                        <button
                            type="button"
                            onclick="
                                changeQuantity(
                                    ${index},
                                    1
                                )
                            ">

                            +

                        </button>

                    </div>

                </td>


                <td>

                    ${formatMoney(
                        item.discount
                    )}

                </td>


                <td>

                    <strong>

                        ${formatMoney(
                            total
                        )}

                    </strong>

                </td>


                <td>

                    <button
                        type="button"
                        class="delete-item"
                        onclick="
                            removeProduct(
                                ${index}
                            )
                        ">

                        ×

                    </button>

                </td>
            `;


            cartBody.appendChild(row);

        }
    );


    calculateTotals();
}


/* =========================================
   تغيير الكمية
   ========================================= */

function changeQuantity(
    index,
    amount
) {

    const item =
        cart[index];


    if (!item) {
        return;
    }


    loadProducts();


    const product =
        products.find(
            p =>
                p.id ===
                item.productId
        );


    const stock =
        product
            ? Number(product.quantity) || 0
            : item.stock;


    const newQuantity =
        item.qty + amount;


    if (newQuantity <= 0) {

        removeProduct(index);

        return;
    }


    if (
        newQuantity >
        stock
    ) {

        showToast(
            "الكمية المطلوبة أكبر من المخزون",
            "error"
        );

        return;
    }


    item.qty =
        newQuantity;

    item.stock =
        stock;


    renderCart();
}


/* =========================================
   حذف منتج من السلة
   ========================================= */

function removeProduct(index) {

    if (
        index < 0 ||
        index >= cart.length
    ) {
        return;
    }


    cart.splice(index, 1);

    renderCart();
}


/* =========================================
   حساب الإجماليات
   ========================================= */

function calculateTotals() {

    let subtotal = 0;

    let count = 0;


    cart.forEach(item => {

        subtotal +=
            (
                Number(item.price) *
                Number(item.qty)
            );

        count +=
            Number(item.qty);

    });


    const discountInputValue =
        Number(
            discountInput
                ? discountInput.value
                : 0
        ) || 0;


    let discount = 0;


    if (
        discountType &&
        discountType.value ===
            "percent"
    ) {

        discount =
            subtotal *
            discountInputValue /
            100;

    } else {

        discount =
            discountInputValue;
    }


    if (discount < 0) {
        discount = 0;
    }


    if (discount > subtotal) {
        discount = subtotal;
    }


    const grandTotal =
        subtotal - discount;


    const paid =
        Number(
            paidInput
                ? paidInput.value
                : 0
        ) || 0;


    const remaining =
        grandTotal - paid;


    if (itemsCount) {

        itemsCount.textContent =
            count;
    }


    if (subtotalElement) {

        subtotalElement.textContent =
            formatMoney(subtotal);
    }


    if (discountValueElement) {

        discountValueElement.textContent =
            formatMoney(discount);
    }


    if (grandTotalElement) {

        grandTotalElement.textContent =
            formatMoney(grandTotal);
    }


    if (remainingElement) {

        if (remaining > 0) {

            remainingElement.textContent =
                formatMoney(
                    remaining
                ) + " ج.م";

            remainingElement.style.color =
                "#dc2626";

        } else {

            remainingElement.textContent =
                "الباقي: " +
                formatMoney(
                    Math.abs(remaining)
                ) +
                " ج.م";

            remainingElement.style.color =
                "#16a34a";
        }
    }


    return {
        subtotal,
        discount,
        grandTotal,
        paid,
        remaining
    };
}


/* =========================================
   حساب تلقائي
   ========================================= */

if (discountInput) {

    discountInput.addEventListener(
        "input",
        calculateTotals
    );
}


if (discountType) {

    discountType.addEventListener(
        "change",
        calculateTotals
    );
}


if (paidInput) {

    paidInput.addEventListener(
        "input",
        calculateTotals
    );
}


/* =========================================
   التحقق من المخزون قبل البيع
   ========================================= */

function validateStock() {

    loadProducts();


    for (const item of cart) {

        const product =
            products.find(
                p =>
                    p.id ===
                    item.productId
            );


        if (!product) {

            return {
                valid: false,
                message:
                    `المنتج "${item.name}" لم يعد موجودًا في المخزن.`
            };
        }


        const stock =
            Number(product.quantity) || 0;


        if (
            item.qty >
            stock
        ) {

            return {
                valid: false,
                message:
                    `الكمية المطلوبة من "${item.name}" غير متوفرة. المتاح: ${stock}`
            };
        }
    }


    return {
        valid: true
    };
}


/* =========================================
   حفظ الفاتورة
   ========================================= */

if (saveSaleButton) {

    saveSaleButton.addEventListener(
        "click",
        () => saveSale(false)
    );
}


function saveSale(
    printAfterSave = false
) {

    if (cart.length === 0) {

        showToast(
            "لا يمكن حفظ فاتورة فارغة",
            "error"
        );

        return false;
    }


    const stockCheck =
        validateStock();


    if (!stockCheck.valid) {

        showToast(
            stockCheck.message,
            "error"
        );

        return false;
    }


    const totals =
        calculateTotals();


    if (
        totals.paid <
        totals.grandTotal
    ) {

        showToast(
            "المبلغ المدفوع أقل من إجمالي الفاتورة",
            "error"
        );

        if (paidInput) {
            paidInput.focus();
        }

        return false;
    }


    const invoice =
        invoiceNumberElement
            ? invoiceNumberElement.textContent
            : generateInvoiceNumber();


    const sale = {

        id:
            Date.now().toString(),

        invoice:
            invoice,

        date:
            new Date().toISOString(),

        customerName:
            customerName
                ? customerName.value.trim()
                : "",

        customerPhone:
            customerPhone
                ? customerPhone.value.trim()
                : "",

        paymentMethod:
            paymentMethod
                ? paymentMethod.value
                : "cash",

        items:
            cart.map(item => ({
                productId:
                    item.productId,

                barcode:
                    item.barcode,

                name:
                    item.name,

                price:
                    Number(item.price),

                qty:
                    Number(item.qty),

                discount:
                    Number(item.discount) || 0,

                total:
                    (
                        Number(item.price) *
                        Number(item.qty)
                    ) -
                    (
                        Number(item.discount) || 0
                    )
            })),

        subtotal:
            totals.subtotal,

        discount:
            totals.discount,

        total:
            totals.grandTotal,

        paid:
            totals.paid,

        remaining:
            totals.remaining
    };


    /* =====================================
       خصم الكمية من المخزن
       ===================================== */

    cart.forEach(item => {

        const product =
            products.find(
                p =>
                    p.id ===
                    item.productId
            );


        if (product) {

            product.quantity =
                (
                    Number(product.quantity) ||
                    0
                ) -
                Number(item.qty);


            if (
                product.quantity <
                0
            ) {

                product.quantity = 0;
            }
        }
    });


    saveProducts();


    /* =====================================
       حفظ الفاتورة
       ===================================== */

    let sales = [];


    try {

        const savedSales =
            localStorage.getItem(
                SALES_KEY
            );


        sales =
            savedSales
                ? JSON.parse(savedSales)
                : [];


        if (!Array.isArray(sales)) {
            sales = [];
        }

    } catch {

        sales = [];
    }


    sales.push(sale);


    localStorage.setItem(
        SALES_KEY,
        JSON.stringify(sales)
    );


    showToast(
        "تم حفظ الفاتورة وخصم الكمية من المخزن ✓",
        "success"
    );


    if (printAfterSave) {

        setTimeout(() => {

            printInvoice(sale);

        }, 400);

    }


    setTimeout(() => {

        clearSale(false);

    }, 800);


    return true;
}


/* =========================================
   زر الطباعة
   ========================================= */

if (printSaleButton) {

    printSaleButton.addEventListener(
        "click",
        () => {

            saveSale(true);

        }
    );
}


/* =========================================
   تنظيف الفاتورة
   ========================================= */

if (clearSaleButton) {

    clearSaleButton.addEventListener(
        "click",
        () => clearSale(true)
    );
}


function clearSale(
    askConfirmation = true
) {

    if (
        askConfirmation &&
        cart.length > 0
    ) {

        const confirmed =
            confirm(
                "هل تريد إلغاء الفاتورة الحالية؟"
            );


        if (!confirmed) {
            return;
        }
    }


    cart = [];


    if (customerName) {
        customerName.value = "";
    }


    if (customerPhone) {
        customerPhone.value = "";
    }


    if (discountInput) {
        discountInput.value = 0;
    }


    if (paidInput) {
        paidInput.value = 0;
    }


    newInvoiceNumber();

    renderCart();

    loadProducts();
}


/* =========================================
   طباعة الفاتورة
   ========================================= */

function printInvoice(sale) {

    const printWindow =
        window.open(
            "",
            "_blank",
            "width=420,height=700"
        );


    if (!printWindow) {

        showToast(
            "المتصفح منع نافذة الطباعة",
            "error"
        );

        return;
    }


    const itemsHtml =
        sale.items.map(item => `

            <tr>

                <td>
                    ${escapeHtml(
                        item.name
                    )}
                </td>

                <td>
                    ${item.qty}
                </td>

                <td>
                    ${formatMoney(
                        item.price
                    )}
                </td>

                <td>
                    ${formatMoney(
                        item.total
                    )}
                </td>

            </tr>

        `).join("");


    printWindow.document.write(`

        <!DOCTYPE html>

        <html
            lang="ar"
            dir="rtl">

        <head>

            <meta charset="UTF-8">

            <title>
                فاتورة ${sale.invoice}
            </title>

            <style>

                * {
                    box-sizing: border-box;
                }

                body {
                    font-family:
                        Arial,
                        Tahoma,
                        sans-serif;

                    margin: 0;

                    padding: 20px;

                    color: #111;

                    direction: rtl;
                }

                .receipt {
                    max-width: 380px;

                    margin: auto;
                }

                .store-name {
                    text-align: center;

                    font-size: 25px;

                    font-weight: 900;

                    margin-bottom: 5px;
                }

                .store-subtitle {
                    text-align: center;

                    color: #555;

                    font-size: 12px;

                    margin-bottom: 15px;
                }

                .line {
                    border-top:
                        1px dashed #777;

                    margin: 10px 0;
                }

                .invoice-info {
                    font-size: 12px;

                    line-height: 1.8;
                }

                table {
                    width: 100%;

                    border-collapse:
                        collapse;

                    margin-top: 10px;

                    font-size: 11px;
                }

                th,
                td {
                    padding: 7px 3px;

                    border-bottom:
                        1px solid #ddd;

                    text-align: center;
                }

                th {
                    background: #f1f1f1;
                }

                .totals {
                    margin-top: 12px;

                    font-size: 13px;
                }

                .total-row {
                    display: flex;

                    justify-content:
                        space-between;

                    padding: 5px 0;
                }

                .grand {
                    font-size: 18px;

                    font-weight: 900;

                    border-top:
                        2px solid #111;

                    padding-top: 8px;
                }

                .thanks {
                    text-align: center;

                    margin-top: 20px;

                    font-size: 12px;
                }

                @media print {

                    body {
                        padding: 0;
                    }

                }

            </style>

        </head>


        <body>

            <div class="receipt">

                <div class="store-name">
                    TOP STORE
                </div>

                <div class="store-subtitle">
                    فاتورة بيع
                </div>


                <div class="line"></div>


                <div class="invoice-info">

                    <div>
                        رقم الفاتورة:
                        ${escapeHtml(
                            sale.invoice
                        )}
                    </div>

                    <div>
                        التاريخ:
                        ${new Date(
                            sale.date
                        ).toLocaleString(
                            "ar-EG"
                        )}
                    </div>

                    ${
                        sale.customerName
                        ? `
                            <div>
                                العميل:
                                ${escapeHtml(
                                    sale.customerName
                                )}
                            </div>
                        `
                        : ""
                    }

                    ${
                        sale.customerPhone
                        ? `
                            <div>
                                الهاتف:
                                ${escapeHtml(
                                    sale.customerPhone
                                )}
                            </div>
                        `
                        : ""
                    }

                </div>


                <div class="line"></div>


                <table>

                    <thead>

                        <tr>

                            <th>
                                المنتج
                            </th>

                            <th>
                                ك
                            </th>

                            <th>
                                السعر
                            </th>

                            <th>
                                الإجمالي
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${itemsHtml}

                    </tbody>

                </table>


                <div class="totals">

                    <div class="total-row">

                        <span>
                            قبل الخصم
                        </span>

                        <strong>
                            ${formatMoney(
                                sale.subtotal
                            )}
                            ج.م
                        </strong>

                    </div>


                    <div class="total-row">

                        <span>
                            الخصم
                        </span>

                        <strong>
                            ${formatMoney(
                                sale.discount
                            )}
                            ج.م
                        </strong>

                    </div>


                    <div
                        class="total-row grand">

                        <span>
                            الإجمالي
                        </span>

                        <strong>
                            ${formatMoney(
                                sale.total
                            )}
                            ج.م
                        </strong>

                    </div>


                    <div class="total-row">

                        <span>
                            المدفوع
                        </span>

                        <strong>
                            ${formatMoney(
                                sale.paid
                            )}
                            ج.م
                        </strong>

                    </div>


                    <div class="total-row">

                        <span>
                            الباقي
                        </span>

                        <strong>
                            ${formatMoney(
                                Math.max(
                                    0,
                                    sale.paid -
                                    sale.total
                                )
                            )}
                            ج.م
                        </strong>

                    </div>

                </div>


                <div class="line"></div>


                <div class="thanks">
                    شكرًا لتعاملكم مع TOP STORE ❤️
                </div>

            </div>


            <script>

                window.onload = function() {

                    window.print();

                };

            <\/script>

        </body>

        </html>

    `);


    printWindow.document.close();
}


/* =========================================
   أدوات
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


function escapeHtml(value) {

    return String(value ?? "")
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
   تشغيل الصفحة
   ========================================= */

loadProducts();

newInvoiceNumber();

renderCart();
