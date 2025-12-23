package com.paltform.VoicesOfSyria.Service;

import com.paltform.VoicesOfSyria.Enum.UserRole;
import com.paltform.VoicesOfSyria.Model.User;
import com.paltform.VoicesOfSyria.Repo.UserRepo;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class UserService {

    private final UserRepo userRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepo userRepository, JavaMailSender mailSender, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
    }

    // نخزّن المستخدمين مؤقتًا مع كود التحقق
    private final Map<String, User> pendingUsers = new HashMap<>();
    private final Map<String, String> verificationCodes = new HashMap<>();

    // 1️⃣ إنشاء مستخدم مؤقت وإرسال الكود
    public String register(User user) {

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return "البريد الإلكتروني مستخدم مسبقاً!";
        }

        // تعيين الدور الافتراضي للمستخدم العادي
        user.setRole(UserRole.USER);

        // تعيين verified = false كبداية
        user.setVerified(false);

        // تشفير كلمة السر قبل تخزينها
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // إنشاء كود التحقق
        String code = generateVerificationCode();
        verificationCodes.put(user.getEmail(), code);
        pendingUsers.put(user.getEmail(), user);

        // إرسال الكود فعليًا
        sendVerificationEmail(user.getEmail(), code);

        return "تم إرسال رمز التحقق إلى بريدك الإلكتروني.";
    }

    // 2️⃣ التحقق من الكود وحفظ المستخدم فعليًا
    public boolean verifyEmail(String email, String code) {

        String savedCode = verificationCodes.get(email);
        if (savedCode == null || !savedCode.equals(code)) {
            return false;
        }

        User user = pendingUsers.get(email);
        if (user == null) {
            return false;
        }

        // يفتح حسابه الآن
        user.setVerified(true);

        // نحفظ المستخدم فعلياً بقاعدة البيانات
        userRepository.save(user);

        // إزالة البيانات المؤقتة
        pendingUsers.remove(email);
        verificationCodes.remove(email);

        return true;
    }

    private void sendVerificationEmail(String toEmail, String code) {
        String subject = "رمز التحقق من Voices of Syria";
        String text = "مرحباً!\n\nرمز التحقق الخاص بك هو: " + code +
                "\n\nيرجى إدخاله في الموقع لتفعيل حسابك.";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(text);
        message.setFrom("taymaaalhayek2003@gmail.com");

        mailSender.send(message);
    }

    private String generateVerificationCode() {
        Random random = new Random();
        int number = random.nextInt(900000) + 100000;
        return String.valueOf(number);
    }
}
