/* TOP STORE - shared permission guard for admin + Elalmy */
"use strict";

const TS_USER_KEYS = [
  "TOPSTORE_CURRENT_USER",
  "topStoreCurrentUser",
  "currentUser",
  "loggedInUser",
  "topstore_current_user"
];

const TS_PAGE_PERMISSIONS = {
  "dashboard.html": "dashboard",
  "sales.html": "sales",
  "products.html": "products",
  "returns.html": "returns",
  "maintenance.html": "maintenance",
  "accounts.html": "accounts",
  "expenses.html": "expenses",
  "reports.html": "reports",
  "users.html": "users"
};

function tsReadJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

function tsGetUser() {
  for (const key of TS_USER_KEYS) {
    const u = tsReadJSON(key);
    if (u) return u;
  }
  return null;
}

function tsUsername(u) {
  return String(u?.username ?? u?.userName ?? u?.name ?? "").trim().toLowerCase();
}

function tsIsManager(u = tsGetUser()) {
  const n = tsUsername(u);
  const role = String(u?.role ?? "").trim().toLowerCase();
  return n === "admin" || n === "elalmy" || role === "admin" || role === "manager";
}

function tsPermissions(u = tsGetUser()) {
  if (!u) return {};
  if (tsIsManager(u)) {
    return {
      dashboard:true, sales:true, products:true, returns:true,
      maintenance:true, accounts:true, expenses:true,
      reports:true, users:true
    };
  }

  const p = (u.permissions && typeof u.permissions === "object") ? u.permissions : {};
  return {
    dashboard: true,
    sales: p.sales === true,
    products: p.products === true,
    returns: p.returns === true,
    maintenance: p.maintenance === true,
    accounts: p.accounts === true,
    expenses: p.expenses === true,
    reports: p.reports === true,
    users: false
  };
}

function tsHasPermission(permission) {
  const u = tsGetUser();
  if (!u || u.active === false || u.status === "inactive") return false;
  return tsPermissions(u)[permission] === true;
}

function tsProtectCurrentPage() {
  const u = tsGetUser();
  if (!u) {
    location.replace("index.html");
    return false;
  }

  const file = location.pathname.split("/").pop().toLowerCase();
  const permission = TS_PAGE_PERMISSIONS[file];

  if (permission && !tsHasPermission(permission)) {
    location.replace("dashboard.html");
    return false;
  }
  return true;
}

window.TOPSTORE_PERMISSIONS = {
  getUser: tsGetUser,
  isManager: tsIsManager,
  getPermissions: tsPermissions,
  has: tsHasPermission,
  protect: tsProtectCurrentPage
};
