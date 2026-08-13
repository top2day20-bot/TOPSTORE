نسخة الصلاحيات V2

استبدل:
permissions.js
users.html
users.js

مهم جدًا:
كل صفحة محمية يجب أن تحتوي قبل ملفها الخاص:
<script src="permissions.js"></script>

مثال sales.html:
<script src="permissions.js"></script>
<script src="sales.js"></script>

المدير:
admin

أي مستخدم غير admin يعامل كموظف، ولا يأخذ صلاحيات المدير تلقائيًا.

تنبيه أمني:
GitHub Pages + localStorage لا يوفر حماية حقيقية ضد شخص يعبث من DevTools.
هذه النسخة تصلح لمنع الوصول العادي داخل الواجهة.
للحماية الحقيقية من التلاعب نحتاج Backend وقاعدة بيانات.
