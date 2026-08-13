/* TOP STORE - USERS
   صفحة المستخدمين: المدير فقط
*/
"use strict";

const USERS_KEY="TOPSTORE_USERS";

function usersRead(){
  try{
    const x=localStorage.getItem(USERS_KEY);
    const arr=x?JSON.parse(x):[];
    return Array.isArray(arr)?arr:[];
  }catch(e){return [];}
}

function usersWrite(arr){
  localStorage.setItem(USERS_KEY,JSON.stringify(arr));
}

function escapeHTML(v){
  return String(v??"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

const permissionNames={
  sales:"المبيعات",
  products:"المنتجات والمخزن",
  returns:"المرتجعات",
  maintenance:"الصيانة",
  accounts:"الحسابات",
  expenses:"المصروفات",
  reports:"التقارير",
  users:"المستخدمين"
};

let editIndex=-1;

function ensureAdmin(){
  let arr=usersRead();

  const i=arr.findIndex(
    u=>String(u.username||"").toLowerCase()==="admin"
  );

  const admin={
    username:"admin",
    name:"المدير",
    role:"admin",
    active:true,
    permissions:{
      dashboard:true,sales:true,products:true,returns:true,
      maintenance:true,accounts:true,expenses:true,
      reports:true,users:true
    }
  };

  if(i===-1){
    arr.unshift(admin);
    usersWrite(arr);
  }else{
    // لا تسمح لصفحة الموظفين بتقليل صلاحيات admin.
    arr[i]={...arr[i],...admin};
    usersWrite(arr);
  }

  return arr;
}

function render(){
  const tbody=document.getElementById("usersTable");
  if(!tbody)return;

  const arr=ensureAdmin();
  tbody.innerHTML="";

  arr.forEach((u,i)=>{
    const admin=String(u.username||"").toLowerCase()==="admin";

    const names=admin
      ?"كل الصلاحيات"
      :Object.keys(permissionNames)
        .filter(k=>u.permissions?.[k]===true)
        .map(k=>permissionNames[k])
        .join("، ") || "لا توجد";

    const tr=document.createElement("tr");

    tr.innerHTML=`
      <td>${escapeHTML(u.username)}</td>
      <td>${escapeHTML(u.name)}</td>
      <td>${admin?"👑 المدير":"👤 الموظف"}</td>
      <td>${escapeHTML(names)}</td>
      <td>${u.active===false?"متوقف":"نشط"}</td>
      <td>
        ${admin?"—":`
          <button data-edit="${i}">تعديل</button>
          <button data-delete="${i}" class="danger">حذف</button>
        `}
      </td>`;

    tbody.appendChild(tr);
  });
}

function selectedPermissions(){
  const p={dashboard:true};
  document.querySelectorAll("[data-permission]").forEach(c=>{
    p[c.dataset.permission]=c.checked;
  });
  return p;
}

function resetForm(){
  document.getElementById("userForm")?.reset();
  editIndex=-1;
  const title=document.getElementById("formTitle");
  if(title)title.textContent="إضافة موظف جديد";

  document.querySelectorAll("[data-permission]")
    .forEach(c=>{
      c.checked=["sales","products","returns","maintenance"]
        .includes(c.dataset.permission);
    });
}

function editUser(i){
  const arr=ensureAdmin();
  const u=arr[i];
  if(!u || String(u.username).toLowerCase()==="admin"){
    alert("لا يمكن تعديل حساب المدير.");
    return;
  }

  editIndex=i;
  document.getElementById("username").value=u.username||"";
  document.getElementById("name").value=u.name||"";
  document.getElementById("password").value=u.password||"";
  document.getElementById("passwordConfirm").value=u.password||"";

  document.querySelectorAll("[data-permission]").forEach(c=>{
    c.checked=u.permissions?.[c.dataset.permission]===true;
  });

  document.getElementById("formTitle").textContent="تعديل الموظف";
}

document.getElementById("userForm")?.addEventListener("submit",e=>{
  e.preventDefault();

  const username=document.getElementById("username").value.trim();
  const name=document.getElementById("name").value.trim();
  const password=document.getElementById("password").value;
  const confirmPassword=document.getElementById("passwordConfirm").value;

  if(!username||!name||!password){
    alert("أكمل البيانات.");
    return;
  }

  if(password!==confirmPassword){
    alert("كلمتا المرور غير متطابقتين.");
    return;
  }

  if(username.toLowerCase()==="admin"){
    alert("اسم admin محجوز للمدير.");
    return;
  }

  const arr=ensureAdmin();

  const duplicate=arr.findIndex((u,i)=>
    i!==editIndex &&
    String(u.username||"").toLowerCase()===username.toLowerCase()
  );

  if(duplicate!==-1){
    alert("اسم المستخدم موجود بالفعل.");
    return;
  }

  const employee={
    username,
    name,
    password,
    role:"employee",
    active:true,
    permissions:selectedPermissions()
  };

  if(editIndex===-1){
    arr.push(employee);
    alert("تم إضافة الموظف ✅");
  }else{
    arr[editIndex]={
      ...arr[editIndex],
      ...employee,
      role:"employee"
    };
    alert("تم تعديل الصلاحيات ✅");
  }

  usersWrite(arr);
  resetForm();
  render();
});

document.getElementById("cancelEdit")?.addEventListener("click",resetForm);

document.getElementById("usersTable")?.addEventListener("click",e=>{
  const edit=e.target.closest("[data-edit]");
  const del=e.target.closest("[data-delete]");

  if(edit)editUser(Number(edit.dataset.edit));

  if(del){
    const i=Number(del.dataset.delete);
    const arr=ensureAdmin();

    if(confirm("هل تريد حذف الموظف؟")){
      arr.splice(i,1);
      usersWrite(arr);
      render();
    }
  }
});

render();
