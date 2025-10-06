# دليل النشر الشامل على Coolify و n8n

## 📋 جدول المحتويات
1. [إعداد n8n Workflows](#إعداد-n8n-workflows)
2. [إعداد Google Sheets](#إعداد-google-sheets)
3. [نشر الموقع على Coolify](#نشر-الموقع-على-coolify)
4. [ربط subdomain](#ربط-subdomain)
5. [الربط مع n8n](#الربط-مع-n8n)

---

## 1️⃣ إعداد n8n Workflows

### Workflow 1: جلب البيانات من Google Sheets

هذا الـ workflow يستقبل طلبات من النموذج ويعيد البيانات من Google Sheets.

#### الخطوات:

1. **أنشئ workflow جديد في n8n**

2. **أضف Webhook Node:**
   - اسم النود: `Webhook - Get Data`
   - HTTP Method: `POST`
   - Path: `/get-data` (أو أي مسار تختاره)
   - Response Mode: `On Received`
   - احفظ الـ webhook URL

3. **أضف Switch Node:**
   - اسم النود: `Check Action`
   - Mode: `Expression`
   - Value: `{{ $json.body.action }}`
   - Routing Rules:
     - Output 0: `getGroups`
     - Output 1: `getPlanTypes`
     - Output 2: `getPlanElements`

4. **للمجموعات - أضف Google Sheets Node:**
   - اسم النود: `Get Groups`
   - Authentication: اربط حساب Google الخاص بك
   - Operation: `Read`
   - Spreadsheet: اختر ملف Google Sheets
   - Sheet Name: `المجموعات` (أو اسم الشيت عندك)
   - Range: `A2:A` (يقرأ كل الأسماء من العمود A)

5. **أضف Code Node بعد Get Groups:**
   ```javascript
   // Format groups data
   const groups = [];
   for (const item of $input.all()) {
     if (item.json['0']) { // العمود الأول
       groups.push(item.json['0']);
     }
   }
   
   return [{
     json: {
       groups: groups
     }
   }];
   ```

6. **للخطط - أضف Google Sheets Node:**
   - اسم النود: `Get Plan Types`
   - Authentication: نفس الحساب
   - Operation: `Read`
   - Spreadsheet: نفس الملف
   - Sheet Name: `أنواع_الخطط`
   - Range: `A2:A`

7. **أضف Code Node بعد Get Plan Types:**
   ```javascript
   // Format plan types data
   const planTypes = [];
   for (const item of $input.all()) {
     if (item.json['0']) {
       planTypes.push(item.json['0']);
     }
   }
   
   return [{
     json: {
       planTypes: planTypes
     }
   }];
   ```

8. **لعناصر الخطة - أضف Google Sheets Node:**
   - اسم النود: `Get Plan Elements`
   - Authentication: نفس الحساب
   - Operation: `Read`
   - Spreadsheet: نفس الملف
   - Sheet Name: استخدم expression: `{{ $json.body.planType }}` (اسم الشيت حسب نوع الخطة)
   - Range: `A2:A`

9. **أضف Code Node بعد Get Plan Elements:**
   ```javascript
   // Format plan elements data
   const planElements = [];
   for (const item of $input.all()) {
     if (item.json['0']) {
       planElements.push(item.json['0']);
     }
   }
   
   return [{
     json: {
       planElements: planElements
     }
   }];
   ```

10. **قم بتفعيل الـ workflow** ✅

---

### Workflow 2: استقبال بيانات النموذج

هذا الـ workflow يستقبل البيانات المرسلة من النموذج.

#### الخطوات:

1. **أنشئ workflow جديد**

2. **أضف Webhook Node:**
   - اسم النود: `Webhook - Submit Data`
   - HTTP Method: `POST`
   - Path: `/submit-data`
   - Response Mode: `On Received`
   - احفظ الـ webhook URL

3. **أضف Google Sheets Node:**
   - اسم النود: `Add to Sheet`
   - Authentication: اربط حساب Google
   - Operation: `Append`
   - Spreadsheet: اختر ملف Google Sheets
   - Sheet Name: `البيانات_المرسلة` (أو أي اسم)
   - Columns:
     - Column A: `{{ $json.body.studentName }}`
     - Column B: `{{ $json.body.group }}`
     - Column C: `{{ $json.body.planType }}`
     - Column D: `{{ $json.body.planElement }}`
     - Column E: `{{ $json.body.days[0] }}`
     - Column F: `{{ $json.body.days[1] }}`
     - Column G: `{{ $json.body.startDate }}`
     - Column H: `{{ $json.body.planDays }}`
     - Column I: `{{ $json.body.timestamp }}`

4. **قم بتفعيل الـ workflow** ✅

---

## 2️⃣ إعداد Google Sheets

### هيكل الملف:

#### Sheet 1: المجموعات
```
| العمود A      |
|---------------|
| المجموعة الأولى |
| المجموعة الثانية|
| المجموعة الثالثة|
```

#### Sheet 2: أنواع_الخطط
```
| العمود A      |
|---------------|
| خطة يومية     |
| خطة أسبوعية   |
| خطة شهرية     |
```

#### Sheet 3: خطة_يومية (مثال لكل نوع خطة)
```
| العمود A      |
|---------------|
| عنصر 1        |
| عنصر 2        |
| عنصر 3        |
```

#### Sheet 4: خطة_أسبوعية
```
| العمود A      |
|---------------|
| عنصر أ        |
| عنصر ب        |
| عنصر ج        |
```

#### Sheet 5: البيانات_المرسلة
```
| الاسم | المجموعة | نوع الخطة | عنصر الخطة | اليوم 1 | اليوم 2 | تاريخ البدء | عدد الأيام | التاريخ والوقت |
|-------|----------|-----------|------------|---------|---------|-------------|-----------|----------------|
```

**ملاحظة هامة:** اسم كل sheet لعناصر الخطة يجب أن يطابق تماماً اسم نوع الخطة في sheet "أنواع_الخطط"

---

## 3️⃣ نشر الموقع على Coolify

### الطريقة 1: باستخدام GitHub

1. **ارفع الكود على GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **في Coolify:**
   - اذهب إلى Dashboard
   - اضغط `+ New Resource`
   - اختر `Application`
   - اختر `Public Repository`
   - الصق رابط GitHub repo
   - Build Pack: `Nixpacks`
   - Branch: `main`
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Start Command: `npm run preview` أو اتركه فارغاً
   - Port: `4173` (أو حسب إعدادات Vite)
   - اضغط `Deploy`

### الطريقة 2: باستخدام Docker

1. **أنشئ Dockerfile في مجلد المشروع:**

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Configure nginx for SPA
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

2. **في Coolify:**
   - اذهب إلى Dashboard
   - اضغط `+ New Resource`
   - اختر `Application`
   - اختر `Dockerfile`
   - الصق رابط GitHub repo
   - Port: `80`
   - اضغط `Deploy`

---

## 4️⃣ ربط Subdomain

### في Coolify:

1. **افتح Application Settings:**
   - اذهب إلى التطبيق الذي نشرته
   - اضغط على `Domains`

2. **أضف Domain:**
   - اضغط `+ Add Domain`
   - أدخل subdomain: `students.yourdomain.com`
   - اضغط `Save`

3. **في إعدادات الـ DNS (عند مزود النطاق):**
   
   **إذا كان Coolify لديه IP ثابت:**
   ```
   Type: A Record
   Name: students
   Value: YOUR_COOLIFY_SERVER_IP
   TTL: 3600
   ```

   **إذا كنت تستخدم Proxy:**
   ```
   Type: CNAME
   Name: students
   Value: your-coolify-domain.com
   TTL: 3600
   ```

4. **SSL Certificate:**
   - Coolify سيقوم بإنشاء SSL تلقائياً عبر Let's Encrypt
   - انتظر 5-10 دقائق

---

## 5️⃣ الربط مع n8n

### الخطوات النهائية:

1. **احصل على webhook URLs من n8n:**
   - Webhook للبيانات: `https://your-n8n.com/webhook/get-data`
   - Webhook للإرسال: `https://your-n8n.com/webhook/submit-data`

2. **في موقعك المنشور:**
   - افتح الموقع: `https://students.yourdomain.com`
   - أدخل الـ webhook URLs في قسم "إعدادات n8n"
   - ستُحفظ في Local Storage

3. **اختبر النظام:**
   - تأكد من ظهور المجموعات في القائمة الأولى
   - اختر مجموعة وتأكد من ظهور أنواع الخطط
   - اختر نوع خطة وتأكد من ظهور العناصر
   - املأ النموذج وأرسل
   - تحقق من إضافة البيانات في Google Sheets

---

## ⚙️ إعدادات إضافية مهمة

### تفعيل CORS في n8n:

إذا واجهت مشاكل CORS، أضف هذه المتغيرات في n8n:

```bash
N8N_CORS_ORIGINS=https://students.yourdomain.com
N8N_WEBHOOK_CORS_ORIGINS=https://students.yourdomain.com
```

### في Coolify:
- اذهب لإعدادات Application
- Environment Variables
- أضف المتغيرات إذا لزم الأمر

---

## 🔍 استكشاف الأخطاء

### المشكلة: القوائم لا تُحمل
- تحقق من webhook URL
- تحقق من تفعيل n8n workflow
- افتح Console في المتصفح (F12)

### المشكلة: البيانات لا تُرسل
- تحقق من webhook URL الثاني
- تحقق من أذونات Google Sheets
- تحقق من n8n logs

### المشكلة: CORS errors
- أضف domain موقعك في إعدادات n8n CORS
- تأكد من استخدام HTTPS

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. راجع console logs في المتصفح (F12)
2. راجع n8n execution logs
3. راجع Coolify deployment logs

---

## ✅ Checklist النشر النهائي

- [ ] n8n workflows تعمل بشكل صحيح
- [ ] Google Sheets منظمة بالشكل الصحيح
- [ ] الموقع منشور على Coolify
- [ ] Subdomain مربوط
- [ ] SSL certificate فعّال
- [ ] webhook URLs محفوظة في الموقع
- [ ] القوائم تُحمل بشكل صحيح
- [ ] البيانات تُرسل وتُحفظ في Sheets

---

**تهانينا! 🎉 نظامك الآن جاهز للعمل**
