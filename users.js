/* TOP STORE - Users: manager is Elalmy, admin account removed */
"use strict";
const USERS_KEY="TOPSTORE_USERS";
const MANAGER={username:"Elalmy",name:"Elalmy",password:"2003",role:"admin",active:true,
permissions:{dashboard:true,sales:true,products:true,returns:true,maintenance:true,accounts:true,expenses:true,reports:true,users:true}};
const names={sales:"المبيعات",products:"المنتجات والمخزن",returns:"المرتجعات",maintenance:"الصيانة",accounts:"الحسابات",expenses:"المصروفات",reports:"التقارير",users:"المستخدمين"};
let editIndex=-1;
function read(){try{const x=localStorage.getItem(USERS_KEY);const a=x?JSON.parse(x):[];return Array.isArray(a)?a:[]}catch(e){return[]}}
function write(a){localStorage.setItem(USERS_KEY,JSON.stringify(a))}
function esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}
function ensureManager(){
 let a=read();
 // Remove legacy admin account completely.
 a=a.filter(u=>String(u.username||"").trim().toLowerCase()!=="admin");
 const i=a.findIndex(u=>String(u.username||"").trim().toLowerCase()==="elalmy");
 if(i===-1)a.unshift({...MANAGER});
 else a[i]={...a[i],...MANAGER};
 write(a); return a;
}
function render(){
 const body=document.getElementById("usersTable"); if(!body)return;
 const a=ensureManager(); body.innerHTML="";
 a.forEach((u,i)=>{
  const manager=String(u.username||"").toLowerCase()==="elalmy";
  const p=manager?"كل الصلاحيات":Object.keys(names).filter(k=>u.permissions?.[k]===true).map(k=>names[k]).join("، ")||"لا توجد";
  const tr=document.createElement("tr");
  tr.innerHTML=`<td>${esc(u.username)}</td><td>${esc(u.name)}</td><td>${manager?"👑 المدير":"👤 الموظف"}</td><td>${esc(p)}</td><td>${u.active===false?"متوقف":"نشط"}</td><td>${manager?"—":`<button data-edit="${i}">تعديل</button> <button class="danger" data-delete="${i}">حذف</button>`}</td>`;
  body.appendChild(tr);
 });
}
function selected(){const p={dashboard:true};document.querySelectorAll("[data-permission]").forEach(c=>p[c.dataset.permission]=c.checked);return p}
function reset(){document.getElementById("userForm")?.reset();editIndex=-1;document.getElementById("formTitle").textContent="إضافة موظف جديد";document.querySelectorAll("[data-permission]").forEach(c=>c.checked=["sales","products","returns","maintenance"].includes(c.dataset.permission))}
function edit(i){
 const a=ensureManager(),u=a[i];if(!u||String(u.username).toLowerCase()==="elalmy"){alert("لا يمكن تعديل حساب المدير.");return}
 editIndex=i;document.getElementById("username").value=u.username||"";document.getElementById("name").value=u.name||"";document.getElementById("password").value=u.password||"";document.getElementById("passwordConfirm").value=u.password||"";
 document.querySelectorAll("[data-permission]").forEach(c=>c.checked=u.permissions?.[c.dataset.permission]===true);document.getElementById("formTitle").textContent="تعديل الموظف";
}
document.getElementById("userForm")?.addEventListener("submit",e=>{
 e.preventDefault();
 const username=document.getElementById("username").value.trim(),name=document.getElementById("name").value.trim(),password=document.getElementById("password").value,pc=document.getElementById("passwordConfirm").value;
 if(!username||!name||!password)return alert("أكمل البيانات.");
 if(password!==pc)return alert("كلمتا المرور غير متطابقتين.");
 if(username.toLowerCase()==="admin"||username.toLowerCase()==="elalmy")return alert("هذا الاسم محجوز للمدير.");
 const a=ensureManager();
 if(a.some((u,i)=>i!==editIndex&&String(u.username||"").toLowerCase()===username.toLowerCase()))return alert("اسم المستخدم موجود بالفعل.");
 const emp={username,name,password,role:"employee",active:true,permissions:selected()};
 if(editIndex===-1){a.push(emp);alert("تم إضافة الموظف ✅")}else{a[editIndex]={...a[editIndex],...emp};alert("تم تعديل الموظف ✅")}
 write(a);reset();render();
});
document.getElementById("cancelEdit")?.addEventListener("click",reset);
document.getElementById("usersTable")?.addEventListener("click",e=>{
 const ed=e.target.closest("[data-edit]"),del=e.target.closest("[data-delete]");
 if(ed)edit(Number(ed.dataset.edit));
 if(del){const i=Number(del.dataset.delete),a=ensureManager();if(confirm("هل تريد حذف الموظف؟")){a.splice(i,1);write(a);render()}}
});
render();
