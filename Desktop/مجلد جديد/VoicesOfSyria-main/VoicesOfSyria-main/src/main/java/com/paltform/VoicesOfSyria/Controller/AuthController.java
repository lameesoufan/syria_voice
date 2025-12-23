package com.paltform.VoicesOfSyria.Controller;

import com.paltform.VoicesOfSyria.Dto.AuthResponse;
import com.paltform.VoicesOfSyria.Dto.LoginRequest;
import com.paltform.VoicesOfSyria.Dto.RefreshTokenRequest;
import com.paltform.VoicesOfSyria.Model.User;
import com.paltform.VoicesOfSyria.Service.AuthService;
import com.paltform.VoicesOfSyria.Service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    @Autowired
    private UserService userService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    
   ;

    // الخطوة 1: إنشاء الحساب وإرسال كود التحقق
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody User user) {
        try {
            userService.register(user);
            return ResponseEntity.ok("تم إرسال رمز التحقق إلى بريدك الإلكتروني.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // الخطوة 2: إدخال رمز التحقق
    @PostMapping("/verify")
    public ResponseEntity<String> verifyUser(
            @RequestParam String email,
            @RequestParam String code) {
    
        boolean verified = userService.verifyEmail(email, code);
    
        if (verified) {
            return ResponseEntity.ok("تم التحقق من البريد الإلكتروني بنجاح!");
        } else {
            return ResponseEntity.badRequest().body("رمز التحقق غير صحيح أو منتهي الصلاحية.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        try {
            AuthResponse response = authService.refreshToken(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
