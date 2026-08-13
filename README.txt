TOP STORE - إصلاح صفحات المبيعات والمخزن والمرتجع والصيانة

تم تعديل HTML فقط لإضافة permissions.js قبل JavaScript الخاص بكل صفحة.
تم إزالة auth.js من maintenance.html لأنه كان نظام حماية منفصلًا وقد يسبب تعارضًا.

الملفات:
sales.html + sales.js
products.html + products.js
returns.html + returns.js
maintenance.html + maintenance.js
permissions.js

مهم:
- لا تغيّر ملفات JS الأربعة الآن.
- ارفع permissions.js مع الملفات.
- كل صفحة الآن تفحص صلاحيتها عند فتحها.
- الموظف لا يحصل على صلاحيات إضافية بمجرد دخوله صفحة المبيعات/المنتجات/المرتجع/الصيانة.

تنبيه:
لأن المشروع يعمل Front-end فقط، هذه حماية للواجهة وليست حماية أمنية حقيقية ضد تعديل localStorage من DevTools.
