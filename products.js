"use strict";

/* =========================================
   TOP STORE - PRODUCTS & INVENTORY
   ========================================= */

const STORAGE_KEY = "topStoreProducts";

let products = [];
let editingId = null;


/* ==============================
   Elements
   ============================== */

const productsBody =
    document.getElementById("productsBody");

const emptyProducts =
    document.getElementById("emptyProducts");

const productModal =
    document.getElementById("productModal");

const productForm =
    document.getElementById("productForm");

const modalTitle =
    document.getElementById("modalTitle");

const productId =
    document.getElementById("productId");

const barcode =
    document.getElementById("barcode");

const productName =
    document.getElementById("productName");

const category =
    document.getElementById("category");

const buyPrice =
    document.getElementById("buyPrice");

const sellPrice =
    document.getElementById("sellPrice");

const quantity =
    document.getElementById("quantity");

const minQuantity =
    document.getElementById("minQuantity");

const searchInput =
    document.getElementById("searchInput");

const stockFilter =
    document.getElementById("stockFilter");

const formError =
    document.getElementById("formError");

const toast =
    document.getElementById("toast");


/* ==============================
   Load Products
   ============================== */

function loadProducts() {

    const saved =
        localStorage.getItem(STORAGE_KEY);

    if (saved) {

        try {

            products =
                JSON.parse(saved);

        } catch {

            products = [];
        }

    } else {

        products = [];
    }

    renderProducts();
}


/* ==============================
   Save Products
   ============================== */

function saveProducts() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(products)
    );
}


/* ==============================
   Generate ID
   ============================== */

function generateId() {

    return Date.now().toString();
}


/* ==============================
   Status
   ============================== */

function getProductStatus(product) {

    const qty =
        Number(product.quantity);

    const min =
        Number(product.minQuantity);


    if (qty <= 0) {

        return {
            type: "out",
            text: "نفد المخزون"
        };

    }


    if (qty <= min) {

        return {
            type: "low",
            text: "مخزون منخفض"
        };

    }


    return {
        type: "available",
        text: "متوفر"
    };
}


/* ==============================
   Render
   ============================== */

function renderProducts() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();

    const filter =
        stockFilter.value;


    let filtered =
        products.filter(product => {

            const matchesSearch =
                !search ||
                product.barcode
                    .toLowerCase()
                    .includes(search) ||
                product.name
                    .toLowerCase()
                    .includes(search) ||
                product.category
                    .toLowerCase()
                    .includes(search);


            if (!matchesSearch) {
                return false;
            }


            const status =
                getProductStatus(product);


            if (
                filter === "available" &&
                status.type !== "available"
            ) {
                return false;
            }


            if (
                filter === "low" &&
                status.type !== "low"
            ) {
                return false;
            }


            if (
                filter === "out" &&
                status.type !== "out"
            ) {
                return false;
            }


            return true;

        });


    productsBody.innerHTML = "";


    filtered.forEach((product, index) => {

        const status =
            getProductStatus(product);


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${index + 1}
            </td>

            <td class="barcode-cell">
                ${escapeHtml(product.barcode)}
            </td>

            <td class="product-name-cell">
                ${escapeHtml(product.name)}
            </td>

            <td>
                ${escapeHtml(product.category || "-")}
            </td>

            <td>
                ${money(product.buyPrice)}
            </td>

            <td>
                ${money(product.sellPrice)}
            </td>

            <td class="stock-number">
                ${product.quantity}
            </td>

            <td>

                <span class="status ${status.type}">
                    ${status.text}
                </span>

            </td>

            <td>

                <div class="action-buttons">

                    <button
                        class="table-action edit-action"
                        onclick="editProduct('${product.id}')">

                        ✏️

                    </button>

                    <button
                        class="table-action delete-action"
                        onclick="deleteProduct('${product.id}')">

                        🗑️

                    </button>

                </div>

            </td>
        `;


        productsBody.appendChild(row);

    });


    if (filtered.length === 0) {

        emptyProducts.style.display =
            "block";

    } else {

        emptyProducts.style.display =
            "none";
    }


    updateStatistics();
}


/* ==============================
   Statistics
   ============================== */

function updateStatistics() {

    let stockValue = 0;

    let low = 0;

    let out = 0;


    products.forEach(product => {

        stockValue +=
            Number(product.buyPrice) *
            Number(product.quantity);


        const status =
            getProductStatus(product);


        if (status.type === "low") {
            low++;
        }


        if (status.type === "out") {
            out++;
        }

    });


    document.getElementById(
        "totalProducts"
    ).textContent =
        products.length;


    document.getElementById(
        "stockValue"
    ).textContent =
        money(stockValue) + " ج.م";


    document.getElementById(
        "lowStock"
    ).textContent =
        low;


    document.getElementById(
        "outOfStock"
    ).textContent =
        out;
}


/* ==============================
   Open Add Modal
   ============================== */

function openAddModal() {

    editingId = null;

    productForm.reset();

    productId.value = "";

    minQuantity.value = 2;

    modalTitle.textContent =
        "إضافة منتج";

    formError.textContent = "";

    productModal.classList.add("show");

    setTimeout(() => {
        barcode.focus();
    }, 100);
}


/* ==============================
   Close Modal
   ============================== */

function closeModal() {

    productModal.classList.remove(
        "show"
    );

    productForm.reset();

    formError.textContent = "";

    editingId = null;
}


/* ==============================
   Edit
   ============================== */

function editProduct(id) {

    const product =
        products.find(
            item => item.id === id
        );


    if (!product) {
        return;
    }


    editingId = id;

    productId.value = id;

    barcode.value =
        product.barcode;

    productName.value =
        product.name;

    category.value =
        product.category;

    buyPrice.value =
        product.buyPrice;

    sellPrice.value =
        product.sellPrice;

    quantity.value =
        product.quantity;

    minQuantity.value =
        product.minQuantity;


    modalTitle.textContent =
        "تعديل المنتج";


    formError.textContent = "";

    productModal.classList.add(
        "show"
    );
}


/* ==============================
   Delete
   ============================== */

function deleteProduct(id) {

    const product =
        products.find(
            item => item.id === id
        );


    if (!product) {
        return;
    }


    const confirmed =
        confirm(
            `هل تريد حذف المنتج "${product.name}"؟`
        );


    if (!confirmed) {
        return;
    }


    products =
        products.filter(
            item => item.id !== id
        );


    saveProducts();

    renderProducts();


    showToast(
        "تم حذف المنتج",
        "success"
    );
}


/* ==============================
   Form Submit
   ============================== */

productForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        formError.textContent = "";


        const data = {

            barcode:
                barcode.value.trim(),

            name:
                productName.value.trim(),

            category:
                category.value.trim(),

            buyPrice:
                Number(buyPrice.value),

            sellPrice:
                Number(sellPrice.value),

            quantity:
                Number(quantity.value),

            minQuantity:
                Number(minQuantity.value) || 0
        };


        if (!data.barcode) {

            formError.textContent =
                "الباركود مطلوب.";

            barcode.focus();

            return;
        }


        if (!data.name) {

            formError.textContent =
                "اسم المنتج مطلوب.";

            productName.focus();

            return;
        }


        if (
            data.buyPrice < 0 ||
            data.sellPrice < 0
        ) {

            formError.textContent =
                "الأسعار لا يمكن أن تكون سالبة.";

            return;
        }


        if (
            data.quantity < 0 ||
            data.minQuantity < 0
        ) {

            formError.textContent =
                "الكمية لا يمكن أن تكون سالبة.";

            return;
        }


        const duplicate =
            products.find(product =>
                product.barcode === data.barcode &&
                product.id !== editingId
            );


        if (duplicate) {

            formError.textContent =
                "هذا الباركود مستخدم بالفعل.";

            barcode.focus();

            return;
        }


        if (editingId) {

            const product =
                products.find(
                    item =>
                        item.id === editingId
                );


            if (product) {

                Object.assign(
                    product,
                    data
                );
            }


            showToast(
                "تم تعديل المنتج بنجاح ✓",
                "success"
            );

        } else {

            products.push({

                id: generateId(),

                ...data

            });


            showToast(
                "تم إضافة المنتج بنجاح ✓",
                "success"
            );
        }


        saveProducts();

        renderProducts();

        closeModal();

    }
);


/* ==============================
   Search
   ============================== */

searchInput.addEventListener(
    "input",
    renderProducts
);


stockFilter.addEventListener(
    "change",
    renderProducts
);


/* ==============================
   Buttons
   ============================== */

document
    .getElementById("addProductButton")
    .addEventListener(
        "click",
        openAddModal
    );


document
    .getElementById("emptyAddButton")
    .addEventListener(
        "click",
        openAddModal
    );


document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        closeModal
    );


document
    .getElementById("cancelModal")
    .addEventListener(
        "click",
        closeModal
    );


productModal.addEventListener(
    "click",
    event => {

        if (
            event.target === productModal
        ) {

            closeModal();
        }
    }
);


/* ==============================
   Toast
   ============================== */

function showToast(
    message,
    type = ""
) {

    toast.textContent = message;

    toast.className =
        "product-toast show " + type;


    setTimeout(() => {

        toast.className =
            "product-toast";

    }, 2500);
}


/* ==============================
   Helpers
   ============================== */

function money(value) {

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


/* ==============================
   Start
   ============================== */

loadProducts();