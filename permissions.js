/* TOP STORE - STRICT FRONT-END PERMISSIONS
   ملاحظة: هذا يمنع التجاوز العادي من صفحات الموقع.
   الحماية الأمنية الحقيقية تحتاج Backend.
*/
"use strict";

const TS = {
  USER_KEY: "TOPSTORE_CURRENT_USER",
  LEGACY_KEYS: [
    "topStoreCurrentUser",
    "currentUser",
    "loggedInUser",
    "topstore_current_user"
  ],
  USERS_KEY: "TOPSTORE_USERS",

  pages: {
    "dashboard.html":"dashboard",
    "sales.html":"sales",
    "products.html":"products",
    "returns.html":"returns",
    "maintenance.html":"maintenance",
    "accounts.html":"accounts",
    "expenses.html":"expenses",
    "reports.html":"reports",
    "users.html":"users"
  },

  employeeDefaults: {
    dashboard:true,
    sales:true,
    products:true,
    returns:true,
    maintenance:true,
    accounts:false,
    expenses:false,
    reports:false,
    users:false
  }
};

function readJSON(key){
  try{
    const x=localStorage.getItem(key);
    return x ? JSON.parse(x) : null;
  }catch(e){
    return null;
  }
}

function currentUser(){
  let u=readJSON(TS.USER_KEY);

  if(!u){
    for(const key of TS.LEGACY_KEYS){
      u=readJSON(key);
      if(u) break;
    }
  }

  if(!u) return null;

  // توحيد شكل المستخدم
  return {
    username:String(u.username ?? u.userName ?? "").trim(),
    name:String(u.name ?? u.fullName ?? u.username ?? u.userName ?? "المستخدم"),
    role:String(u.role ?? "").trim().toLowerCase(),
    active:u.active !== false && u.status !== "inactive",
    permissions:(u.permissions && typeof u.permissions==="object")
      ? {...u.permissions}
      : {}
  };
}

function isAdmin(u=currentUser()){
  if(!u) return false;

  // المدير فقط هو الحساب admin.
  // لا نعتمد على وجود صلاحية users أو accounts لتحديد المدير.
  return u.username.toLowerCase()==="elalmy";
}

function permissions(u=currentUser()){
  if(!u) return {};

  if(isAdmin(u)){
    return {
      dashboard:true,sales:true,products:true,returns:true,
      maintenance:true,accounts:true,expenses:true,
      reports:true,users:true
    };
  }

  // أي حساب غير admin = موظف، ولا يرث صلاحيات المدير.
  return {
    ...TS.employeeDefaults,
    ...u.permissions
  };
}

function hasPermission(name){
  const u=currentUser();
  if(!u || !u.active) return false;
  return permissions(u)[name] === true;
}

function logout(){
  localStorage.removeItem(TS.USER_KEY);
  TS.LEGACY_KEYS.forEach(k=>localStorage.removeItem(k));
  sessionStorage.clear();
  location.replace("index.html");
}

function protectPage(){
  const u=currentUser();

  if(!u || !u.active){
    location.replace("index.html");
    return false;
  }

  const file=location.pathname.split("/").pop().toLowerCase();
  const required=TS.pages[file];

  if(required && !hasPermission(required)){
    alert("🚫 ليس لديك صلاحية للدخول إلى هذه الصفحة.");
    location.replace("dashboard.html");
    return false;
  }

  return true;
}

function hideUnauthorizedLinks(){
  document.querySelectorAll("a[href]").forEach(a=>{
    const href=(a.getAttribute("href")||"").split("/").pop().toLowerCase();
    const p=TS.pages[href];
    if(p && !hasPermission(p)){
      a.remove();
    }
  });
}

function fillUserInfo(){
  const u=currentUser();
  if(!u) return;

  const nameEls=[
    document.getElementById("usernameDisplay"),
    document.getElementById("currentUsername")
  ];

  nameEls.forEach(el=>{
    if(el) el.textContent=u.name;
  });

  const roleEls=[
    document.getElementById("roleDisplay"),
    document.getElementById("currentRole")
  ];

  roleEls.forEach(el=>{
    if(el) el.textContent=isAdmin(u) ? "المدير" : "الموظف";
  });
}

function init(){
  if(!protectPage()) return;

  hideUnauthorizedLinks();
  fillUserInfo();

  document.querySelectorAll(
    "#logoutButton,.logout-button,[data-logout]"
  ).forEach(btn=>{
    if(btn.dataset.tsLogout==="1") return;
    btn.dataset.tsLogout="1";
    btn.addEventListener("click",e=>{
      e.preventDefault();
      if(confirm("هل تريد تسجيل الخروج؟")) logout();
    });
  });
}

window.TOPSTORE={
  getCurrentUser:currentUser,
  hasPermission,
  getPermissions:permissions,
  isAdmin:()=>isAdmin(),
  logout
};

if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",init);
}else{
  init();
}
