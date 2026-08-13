"use strict";

/* =========================================
   TOP STORE - SALES SYSTEM
   ========================================= */


/* المنتجات التجريبية مؤقتًا
   لاحقًا هنستبدلها بقاعدة البيانات */

const products = [
    {
        barcode: "1001",
        name: "iPhone 15",
        price: 35000,
        stock: 5
    },
    {
        barcode: "1002",
        name: "Samsung A55",
        price: 18000,
        stock: 8
    },
    {
        barcode: "1003",
        name: "شاحن Type-C",
        price: 350,
        stock: 20
    },
    {
        barcode: "1004",
        name: "سماعة Bluetooth",
        price: 750,
        stock: 12
    }
];


let cart = [];


/* =========================================
   Elements
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

const toast =
    document.getElementById("toast");

const invoiceNumberElement =
    document.getElementById("invoiceNumber");


/* =========================================
   Invoice Number
   ========================================= */

function generateInvoiceNumber() {

    const now = new Date();

    return (
        now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, "0") +
        now.getDate().toString().padStart(2, "0") +
        "-" +
        now.getHours().toString().padStart(2, "0") +
        now.getMinutes().toString().padStart(2, "0") +
        now.getSeconds().toString().padStart(2, "0")
    );
}


invoiceNumberElement.textContent =
    generateInvoiceNumber();


/* =========================================
   Toast
   ========================================= */

function showToast(message, type = "") {

    toast.textContent = message;

    toast.className =
        "toast show " + type;

    setTimeout(() => {

        toast.className = "toast";

    }, 2500);
}


/* =========================================
   Add Product
   ========================================= */

function addProduct() {

    const search =
        productInput.value.trim().toLowerCase();

    if (!search) {

        showToast(
            "اكتب الباركود أو اسم المنتج",
            "error"
        );

        productInput.focus();

        return;
    }


    const product =
        products.find(item =>
            item.barcode.toLowerCase() === search ||
            item.name.toLowerCase().includes(search)
        );


    if (!product) {

        showToast(
            "المنتج غير موجود",
            "error"
        );

        return;
    }


    const existing =
        cart.find(item =>
            item.barcode === product.barcode
        );


    if (existing) {

        if (existing.qty >= product.stock) {

            showToast(
                "الكمية المطلوبة غير متوفرة في المخزن",
                "error"
            );

            return;
        }

        existing.qty++;

    } else {

        cart.push({
            barcode: product.barcode,
            name: product.name,
            price: product.price,
            qty: 1,
            discount: 0,
            stock: product.stock
        });
    }


    productInput.value = "";

    renderCart();

    productInput.focus();
}


addProductButton.addEventListener(
    "click",
    addProduct
);


/* =========================================
   Barcode Enter
   ========================================= */

productInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            event.preventDefault();

            addProduct();
        }
    }
);


/* =========================================
   Render Cart
   ========================================= */

function renderCart() {

    cartBody.innerHTML = "";


    if (cart.length === 0) {

        emptyCart.style.display = "block";

    } else {

        emptyCart.style.display = "none";
    }


    cart.forEach((item, index) => {

        const row =
            document.createElement("tr");


        const itemTotal =
            (item.price * item.qty) -
            item.discount;


        row.innerHTML = `

            <td class="product-name">
                ${escapeHtml(item.name)}
                <small style="display:block;color:#94a3b8">
                    ${escapeHtml(item.barcode)}
                </small>
            </td>

            <td>
                ${formatMoney(item.price)}
            </td>

            <td>

                <div class="qty-control">

                    <button
                        onclick="changeQuantity(${index}, -1)">
                        −
                    </button>

                    <span class="qty-value">
                        ${item.qty}
                    </span>

                    <button
                        onclick="changeQuantity(${index}, 1)">
                        +
                    </button>

                </div>

            </td>

            <td>
                ${formatMoney(item.discount)}
            </td>

            <td>
                <strong>
                    ${formatMoney(itemTotal)}
                </strong>
            </td>

            <td>

                <button
                    class="delete-item"
                    onclick="removeProduct(${index})">

                    ×

                </button>

            </td>
        `;


        cartBody.appendChild(row);

    });


    calculateTotals();
}


/* =========================================
   Quantity
   ========================================= */

function changeQuantity(index, amount) {

    const item = cart[index];

    const newQuantity =
        item.qty + amount;


    if (newQuantity <= 0) {

        removeProduct(index);

        return;
    }


    if (newQuantity > item.stock) {

        showToast(
            "الكمية غير متوفرة في المخزن",
            "error"
        );

        return;
    }


    item.qty = newQuantity;

    renderCart();
}


/* =========================================
   Remove Product
   ========================================= */

function removeProduct(index) {

    cart.splice(index, 1);

    renderCart();
}


/* =========================================
   Calculate
   ========================================= */

function calculateTotals() {

    let subtotal = 0;

    let count = 0;


    cart.forEach(item => {

        subtotal +=
            item.price * item.qty;

        count += item.qty;

    });


    let discount = 0;

    const discountInputValue =
        Number(discountInput.value) || 0;


    if (discountType.value === "percent") {

        discount =
            subtotal *
            discountInputValue /
            100;

    } else {

        discount =
            discountInputValue;
    }


    if (discount > subtotal) {
        discount = subtotal;
    }


    const grandTotal =
        subtotal - discount;


    const paid =
        Number(paidInput.value) || 0;


    const remaining =
        grandTotal - paid;


    itemsCount.textContent =
        count;


    subtotalElement.textContent =
        formatMoney(subtotal);


    discountValueElement.textContent =
        formatMoney(discount);


    grandTotalElement.textContent =
        formatMoney(grandTotal);


    if (remaining > 0) {

        remainingElement.textContent =
            formatMoney(remaining) + " ج.م";

        remainingElement.style.color =
            "#dc2626";

    } else {

        const change =
            Math.abs(remaining);

        remainingElement.textContent =
            "الباقي: " +
            formatMoney(change) +
            " ج.م";

        remainingElement.style.color =
            "#16a34a";
    }
}


/* =========================================
   Inputs Calculation
   ========================================= */

discountInput.addEventListener(
    "input",
    calculateTotals
);

discountType.addEventListener(
    "change",
    calculateTotals
);

paidInput.addEventListener(
    "input",
    calculateTotals
);


/* =========================================
   Save Sale
   ========================================= */

saveSaleButton.addEventListener(
    "click",
    saveSale
);


function saveSale() {

    if (cart.length === 0) {

        showToast(
            "لا يمكن حفظ فاتورة فارغة",
            "error"
        );

        return;
    }


    calculateTotals();


    const total =
        Number(
            grandTotalElement.textContent
        );


    const paid =
        Number(paidInput.value) || 0;


    if (paid < total) {

        showToast(
            "المبلغ المدفوع أقل من إجمالي الفاتورة",
            "error"
        );

        return;
    }


    const sale = {

        invoice:
            invoiceNumberElement.textContent,

        date:
            new Date().toISOString(),

        customer:
            document.getElementById(
                "customerName"
            ).value.trim(),

        phone:
            document.getElementById(
                "customerPhone"
            ).value.trim(),

        payment:
            document.getElementById(
                "paymentMethod"
            ).value,

        items:
            cart,

        total:
            total,

        paid:
            paid,

        change:
            paid - total
    };


    /*
     * حفظ الفاتورة مؤقتًا في المتصفح.
     * لاحقًا هنربطها بقاعدة بيانات حقيقية.
     */

    const sales =
        JSON.parse(
            localStorage.getItem(
                "topStoreSales"
            ) || "[]"
        );


    sales.push(sale);


    localStorage.setItem(
        "topStoreSales",
        JSON.stringify(sales)
    );


    showToast(
        "تم حفظ الفاتورة بنجاح ✓",
        "success"
    );


    setTimeout(() => {

        clearSale();

    }, 700);
}


/* =========================================
   Clear Sale
   ========================================= */

clearSaleButton.addEventListener(
    "click",
    clearSale
);


function clearSale() {

    if (cart.length > 0) {

        const confirmClear =
            confirm(
                "هل تريد إلغاء الفاتورة الحالية؟"
            );

        if (!confirmClear) {
            return;
        }
    }


    cart = [];

    document.getElementById(
        "customerName"
    ).value = "";

    document.getElementById(
        "customerPhone"
    ).value = "";

    discountInput.value = 0;

    paidInput.value = 0;

    invoiceNumberElement.textContent =
        generateInvoiceNumber();

    renderCart();
}


/* =========================================
   Print
   ========================================= */

printSaleButton.addEventListener(
    "click",
    function () {

        if (cart.length === 0) {

            showToast(
                "أضف منتجات أولاً",
                "error"
            );

            return;
        }


        window.print();
    }
);


/* =========================================
   Helpers
   ========================================= */

function formatMoney(value) {

    return Number(value).toLocaleString(
        "ar-EG",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}


function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================
   Start
   ========================================= */

renderCart();