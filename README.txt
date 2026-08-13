TOP STORE - نظام الصلاحيات

الملفات:
1. permissions.js
2. users.html
3. users.js

المدير الافتراضي:
اسم المستخدم: admin
كلمة المرور: 1234

مهم:
- يجب أن يكون permissions.js موجوداً في كل صفحة تريد حمايتها.
- يجب تحميل permissions.js قبل ملف JS الخاص بالصفحة.
- المدير له كل الصلاحيات.
- الموظف يتم تحديد صلاحياته من users.html.
- لا تغيّر login.js الآن حتى نربط نظام الدخول الموجود عندك بهذا النظام بعد التجربة.

مثال:
<script src="permissions.js"></script>
<script src="sales.js"></script>
