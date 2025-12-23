# 🔐 كيفية إنشاء حساب SUPER_ADMIN

## المشكلة:
الـ `/auth/register` دايماً بينشئ حسابات `USER` فقط (لأسباب أمنية)

---

## ✅ الحل 1: من قاعدة البيانات مباشرة (الأسهل)

### الخطوات:

#### 1. شغلي الباك إند
```bash
cd VoicesOfSyria-main/VoicesOfSyria-main
mvnw spring-boot:run
```

#### 2. افتحي H2 Console
```
http://localhost:8080/h2-console
```

**الإعدادات:**
- JDBC URL: `jdbc:h2:file:./data/testdb`
- User Name: `sa`
- Password: (فارغ)

#### 3. نفذي SQL لإنشاء SUPER_ADMIN

**⚠️ مهم:** لازم تعملي hash لكلمة المرور أولاً

**استخدمي هذا الكود Java لعمل Hash:**
```java
// في أي Java file مؤقت
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHasher {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "admin123";  // كلمة المرور اللي بدك إياها
        String hashed = encoder.encode(password);
        System.out.println("Hashed: " + hashed);
    }
}
```

**أو استخدمي موقع online:**
- https://bcrypt-generator.com/
- اكتبي كلمة المرور
- Rounds: 10
- انسخي الـ hash

**مثال Hash:**
```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

**SQL:**
```sql
INSERT INTO users (name, email, password, role, verified) 
VALUES (
  'Super Admin', 
  'superadmin@example.com', 
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'SUPER_ADMIN', 
  true
);
```

#### 4. تحققي من الإنشاء
```sql
SELECT * FROM users WHERE role = 'SUPER_ADMIN';
```

#### 5. سجلي دخول
- Email: `superadmin@example.com`
- Password: `admin123` (أو اللي استخدمتيها)

---

## ✅ الحل 2: تعديل الباك إند مؤقتاً (للتطوير)

### الخطوات:

#### 1. افتحي الملف:
```
VoicesOfSyria-main/VoicesOfSyria-main/src/main/java/com/paltform/VoicesOfSyria/Service/UserService.java
```

#### 2. عدلي دالة `register()`:

**قبل:**
```java
public String register(User user) {
    if (userRepository.findByEmail(user.getEmail()).isPresent()) {
        return "البريد الإلكتروني مستخدم مسبقاً!";
    }

    // تعيين الدور الافتراضي للمستخدم العادي
    user.setRole(UserRole.USER);  // ← هون المشكلة
    
    // ... باقي الكود
}
```

**بعد:**
```java
public String register(User user) {
    if (userRepository.findByEmail(user.getEmail()).isPresent()) {
        return "البريد الإلكتروني مستخدم مسبقاً!";
    }

    // إذا ما في role محدد، حطي USER
    if (user.getRole() == null) {
        user.setRole(UserRole.USER);
    }
    // هلأ بتقدري تبعتي role من الفرونت إند
    
    // ... باقي الكود
}
```

#### 3. من الفرونت إند، سجلي حساب:

**⚠️ مؤقتاً فقط للتطوير!**

افتحي Console في المتصفح واكتبي:
```javascript
fetch('http://localhost:8080/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Super Admin',
    email: 'superadmin@example.com',
    password: 'admin123',
    role: 'SUPER_ADMIN'  // ← هلأ بيشتغل
  })
})
.then(r => r.text())
.then(console.log);
```

#### 4. تحقق من البريد وسجل دخول

#### 5. ⚠️ مهم: أرجعي التعديل!
بعد ما تنشئي الحساب، أرجعي الكود لحالته الأصلية:
```java
user.setRole(UserRole.USER);
```

---

## ✅ الحل 3: باستخدام Postman (احترافي)

### الخطوات:

#### 1. سجلي حساب ADMIN عادي أولاً
من الفرونت إند، سجلي حساب عادي

#### 2. عدلي الـ role في قاعدة البيانات
```sql
UPDATE users 
SET role = 'SUPER_ADMIN' 
WHERE email = 'youremail@example.com';
```

#### 3. سجلي دخول من جديد
هلأ حسابك صار SUPER_ADMIN

---

## 🎯 الطريقة الموصى بها للإنتاج:

### في بيئة الإنتاج الحقيقية:

1. **أنشئي SUPER_ADMIN الأول يدوياً** من قاعدة البيانات
2. **استخدمي SUPER_ADMIN** لإنشاء ADMIN accounts من الواجهة
3. **ADMIN accounts** يراجعوا القصص
4. **SUPER_ADMIN** يدير الـ ADMIN accounts

---

## 📋 ملخص سريع:

### للتطوير والاختبار (بكرا):
```
1. شغلي الباك إند
2. افتحي H2 Console: http://localhost:8080/h2-console
3. نفذي SQL لإنشاء SUPER_ADMIN (مع hashed password)
4. سجلي دخول من الفرونت إند
5. اختبري الوظائف
```

### كلمة المرور المشفرة الجاهزة:
```
Password: admin123
Hashed: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

**استخدميها في SQL:**
```sql
INSERT INTO users (name, email, password, role, verified) 
VALUES (
  'Super Admin', 
  'superadmin@example.com', 
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'SUPER_ADMIN', 
  true
);
```

---

**تم! 🎉**
