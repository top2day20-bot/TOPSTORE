TOP STORE - نسخة الصيانة الجديدة

استبدل فقط:
maintenance.html
maintenance.css
maintenance.js

هذه النسخة لا تحتوي على نظام صلاحيات مستقل داخل maintenance.js.
permissions.js هو المسؤول عن الصلاحيات.

مهم: لا تضف permissions.js مرتين.
ترتيب السكربتات في maintenance.html:
permissions.js
ثم maintenance.js

الصيانة نفسها لا تقوم بفحص صلاحيات إضافي، لذلك لا يوجد تعارض داخلي.
