# 📡 توثيق API - موقع المنيو الرقمي

## Base URL

```
https://dcdawbfrmeivtpivoxqz.supabase.co/functions/v1/make-server-69dd17e9
```

## المصادقة (Authentication)

يستخدم الـ API نظام JWT tokens من Supabase Auth.

### Public Anon Key (للطلبات العامة)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZGF3YmZybWVpdnRwaXZveHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MDQxMzEsImV4cCI6MjA5NjA4MDEzMX0.88YXOdya4KHGfLLZk8h6JnIovB0WquRpx07qVaqVx5g
```

### Access Token (للطلبات المحمية)
يتم الحصول عليه بعد تسجيل الدخول.

---

## 🔐 Auth Endpoints

### 1. إنشاء حساب مدير جديد

**POST** `/signup`

#### Headers
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {PUBLIC_ANON_KEY}"
}
```

#### Request Body
```json
{
  "email": "admin@cafe.com",
  "password": "strong_password_123",
  "name": "مدير الكافيه"
}
```

#### Response (Success - 200)
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@cafe.com",
    "user_metadata": {
      "name": "مدير الكافيه"
    }
  }
}
```

#### Response (Error - 400)
```json
{
  "error": "User already exists"
}
```

#### مثال باستخدام cURL
```bash
curl -X POST https://dcdawbfrmeivtpivoxqz.supabase.co/functions/v1/make-server-69dd17e9/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZGF3YmZybWVpdnRwaXZveHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MDQxMzEsImV4cCI6MjA5NjA4MDEzMX0.88YXOdya4KHGfLLZk8h6JnIovB0WquRpx07qVaqVx5g" \
  -d '{
    "email": "admin@cafe.com",
    "password": "strong_password_123",
    "name": "مدير الكافيه"
  }'
```

---

## 📦 Products Endpoints

### 2. الحصول على جميع المنتجات

**GET** `/products`

#### Headers
```json
{
  "Authorization": "Bearer {PUBLIC_ANON_KEY}"
}
```

#### Response (Success - 200)
```json
{
  "products": [
    {
      "id": "product:1733855234567-abc123",
      "name": "قهوة تركي",
      "description": "قهوة تركية أصلية محضرة بطريقة تقليدية",
      "price": 25,
      "category": "ساخن",
      "image": "https://...",
      "available": true,
      "createdAt": "2024-12-10T12:00:00.000Z"
    }
  ]
}
```

#### مثال باستخدام JavaScript
```javascript
const response = await fetch('https://dcdawbfrmeivtpivoxqz.supabase.co/functions/v1/make-server-69dd17e9/products', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
});
const data = await response.json();
console.log(data.products);
```

---

### 3. الحصول على منتج واحد

**GET** `/products/:id`

#### Headers
```json
{
  "Authorization": "Bearer {PUBLIC_ANON_KEY}"
}
```

#### Response (Success - 200)
```json
{
  "product": {
    "id": "product:1733855234567-abc123",
    "name": "قهوة تركي",
    "description": "قهوة تركية أصلية محضرة بطريقة تقليدية",
    "price": 25,
    "category": "ساخن",
    "image": "https://...",
    "available": true,
    "createdAt": "2024-12-10T12:00:00.000Z"
  }
}
```

#### Response (Error - 404)
```json
{
  "error": "Product not found"
}
```

---

### 4. إضافة منتج جديد (محمي)

**POST** `/products`

#### Headers
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {ACCESS_TOKEN}"
}
```

#### Request Body
```json
{
  "name": "قهوة تركي",
  "description": "قهوة تركية أصلية",
  "price": 25,
  "category": "ساخن",
  "image": "https://...",
  "available": true
}
```

#### Response (Success - 200)
```json
{
  "product": {
    "id": "product:1733855234567-abc123",
    "name": "قهوة تركي",
    "description": "قهوة تركية أصلية",
    "price": 25,
    "category": "ساخن",
    "image": "https://...",
    "available": true,
    "createdAt": "2024-12-10T12:00:00.000Z"
  }
}
```

#### Response (Error - 401)
```json
{
  "error": "Unauthorized"
}
```

---

### 5. تحديث منتج (محمي)

**PUT** `/products/:id`

#### Headers
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {ACCESS_TOKEN}"
}
```

#### Request Body
```json
{
  "name": "قهوة تركي مميزة",
  "price": 30,
  "available": false
}
```

#### Response (Success - 200)
```json
{
  "product": {
    "id": "product:1733855234567-abc123",
    "name": "قهوة تركي مميزة",
    "description": "قهوة تركية أصلية",
    "price": 30,
    "category": "ساخن",
    "image": "https://...",
    "available": false,
    "createdAt": "2024-12-10T12:00:00.000Z"
  }
}
```

---

### 6. حذف منتج (محمي)

**DELETE** `/products/:id`

#### Headers
```json
{
  "Authorization": "Bearer {ACCESS_TOKEN}"
}
```

#### Response (Success - 200)
```json
{
  "success": true
}
```

#### Response (Error - 401)
```json
{
  "error": "Unauthorized"
}
```

---

## 📁 Upload Endpoints

### 7. رفع صورة (محمي)

**POST** `/upload`

#### Headers
```json
{
  "Authorization": "Bearer {ACCESS_TOKEN}"
}
```

#### Request Body
Form Data with file field:
```
file: [Binary Image File]
```

#### Response (Success - 200)
```json
{
  "url": "https://dcdawbfrmeivtpivoxqz.supabase.co/storage/v1/object/sign/make-69dd17e9-products/1733855234567-image.jpg?token=...",
  "path": "1733855234567-image.jpg"
}
```

#### مثال باستخدام JavaScript
```javascript
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('https://dcdawbfrmeivtpivoxqz.supabase.co/functions/v1/make-server-69dd17e9/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

const data = await response.json();
console.log(data.url); // URL الصورة
```

---

## 🏷️ Categories Endpoints

### 8. الحصول على جميع الأقسام

**GET** `/categories`

#### Headers
```json
{
  "Authorization": "Bearer {PUBLIC_ANON_KEY}"
}
```

#### Response (Success - 200)
```json
{
  "categories": [
    {
      "id": "category:1733855234567-xyz",
      "name": "ساخن"
    },
    {
      "id": "category:1733855234568-abc",
      "name": "بارد"
    }
  ]
}
```

---

### 9. إضافة قسم جديد (محمي)

**POST** `/categories`

#### Headers
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {ACCESS_TOKEN}"
}
```

#### Request Body
```json
{
  "name": "مشروبات موسمية"
}
```

#### Response (Success - 200)
```json
{
  "category": {
    "id": "category:1733855234569-def",
    "name": "مشروبات موسمية"
  }
}
```

---

## 🔧 Health Check

### 10. فحص حالة الخادم

**GET** `/health`

#### Response (Success - 200)
```json
{
  "status": "ok"
}
```

---

## 📝 أمثلة عملية

### مثال 1: إنشاء مدير وتسجيل الدخول

```javascript
// 1. إنشاء حساب مدير
const signupResponse = await fetch('BASE_URL/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer PUBLIC_ANON_KEY'
  },
  body: JSON.stringify({
    email: 'admin@cafe.com',
    password: 'password123',
    name: 'Admin'
  })
});

// 2. تسجيل الدخول (باستخدام Supabase Client)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, PUBLIC_ANON_KEY);
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@cafe.com',
  password: 'password123'
});

const accessToken = data.session.access_token;
```

---

### مثال 2: إضافة منتج كامل مع صورة

```javascript
// 1. رفع الصورة
const formData = new FormData();
formData.append('file', imageFile);

const uploadResponse = await fetch('BASE_URL/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

const { url } = await uploadResponse.json();

// 2. إضافة المنتج
const productResponse = await fetch('BASE_URL/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    name: 'كابتشينو',
    description: 'قهوة كابتشينو كريمية',
    price: 40,
    category: 'ساخن',
    image: url,
    available: true
  })
});

const { product } = await productResponse.json();
```

---

## ⚠️ رموز الأخطاء

| الكود | المعنى | الحل |
|------|--------|-----|
| 400 | طلب غير صحيح | تحقق من البيانات المرسلة |
| 401 | غير مصرح | تحقق من Access Token |
| 404 | غير موجود | تحقق من ID المطلوب |
| 500 | خطأ في الخادم | تواصل مع الدعم |

---

## 🔒 ملاحظات أمنية

1. ⚠️ لا تشارك `SERVICE_ROLE_KEY` مطلقاً
2. ✅ استخدم `PUBLIC_ANON_KEY` للطلبات العامة فقط
3. ✅ استخدم `ACCESS_TOKEN` للطلبات المحمية
4. ✅ Tokens تنتهي بعد فترة (استخدم refresh token)

---

## 📞 الدعم

للحصول على مساعدة:
- راجع التوثيق الكامل
- تحقق من حالة الخادم عبر `/health`
- تواصل مع فريق التطوير

---

**آخر تحديث:** يونيو 2026
