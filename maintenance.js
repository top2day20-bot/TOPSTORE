'use strict';

const STORAGE_KEY = 'topStoreMaintenance';

function getRecords(){
    try{
        const data = localStorage.getItem(STORAGE_KEY);
        const records = data ? JSON.parse(data) : [];
        return Array.isArray(records) ? records : [];
    }catch(e){ return []; }
}

function saveRecords(records){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function esc(v){
    return String(v ?? '')
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'",'&#039;');
}

function render(){
    const tbody=document.getElementById('maintenanceTable');
    const empty=document.getElementById('emptyState');
    const count=document.getElementById('maintenanceCount');
    if(!tbody)return;

    const records=getRecords();
    tbody.innerHTML='';
    if(count) count.textContent=records.length;
    if(empty) empty.style.display=records.length?'none':'block';

    records.slice().reverse().forEach((r,rev)=>{
        const index=records.length-1-rev;
        const tr=document.createElement('tr');
        tr.innerHTML=`
        <td>${esc(r.id)}</td>
        <td>${esc(r.date)}</td>
        <td>${esc(r.customerName)}</td>
        <td>${esc(r.customerPhone)}</td>
        <td>${esc(r.device)}</td>
        <td>${esc(r.problem)}</td>
        <td>${Number(r.cost||0).toFixed(2)} ج.م</td>
        <td><span class="status">${esc(r.status)}</span></td>
        <td><button class="delete" data-index="${index}" type="button">حذف</button></td>`;
        tbody.appendChild(tr);
    });
}

document.getElementById('maintenanceForm')?.addEventListener('submit',e=>{
    e.preventDefault();

    const record={
        id:'M-'+Date.now(),
        date:new Date().toLocaleString('ar-EG'),
        customerName:document.getElementById('customerName').value.trim(),
        customerPhone:document.getElementById('customerPhone').value.trim(),
        device:document.getElementById('device').value.trim(),
        serial:document.getElementById('serial').value.trim(),
        problem:document.getElementById('problem').value.trim(),
        cost:Number(document.getElementById('cost').value||0),
        status:document.getElementById('status').value,
        notes:document.getElementById('notes').value.trim()
    };

    if(!record.customerName||!record.device||!record.problem){
        alert('أكمل اسم العميل والجهاز والعطل.');
        return;
    }

    const records=getRecords();
    records.push(record);
    saveRecords(records);

    e.target.reset();
    document.getElementById('cost').value='0';
    render();
    alert('تم تسجيل الصيانة بنجاح ✅');
});

document.getElementById('maintenanceTable')?.addEventListener('click',e=>{
    if(!e.target.classList.contains('delete'))return;
    const index=Number(e.target.dataset.index);
    if(!confirm('هل تريد حذف سجل الصيانة؟'))return;
    const records=getRecords();
    records.splice(index,1);
    saveRecords(records);
    render();
});

document.getElementById('clearButton')?.addEventListener('click',()=>{
    document.getElementById('maintenanceForm')?.reset();
    document.getElementById('cost').value='0';
});

document.getElementById('backButton')?.addEventListener('click',()=>{
    location.href='dashboard.html';
});

document.getElementById('logoutButton')?.addEventListener('click',()=>{
    if(!confirm('هل تريد تسجيل الخروج؟'))return;
    if(window.TOPSTORE && typeof TOPSTORE.logout==='function'){
        TOPSTORE.logout();
    }else{
        localStorage.removeItem('topStoreCurrentUser');
        location.href='index.html';
    }
});

render();
