package com.paltform.VoicesOfSyria.Model;

import jakarta.persistence.*;
import java.util.List;

import com.paltform.VoicesOfSyria.Enum.UserRole;

import lombok.Data;

@Data
@Entity
@Table(name = "users") // لأن كلمة "user" محجوزة في بعض قواعد البيانات
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    private boolean verified;

    private String verificationCode;

    private String profileImageUrl; // صورة المستخدم (اختيارية)

    @Enumerated(EnumType.STRING)
    private UserRole role; // ADMIN أو USER

    // علاقة المستخدم مع القصص التي أرسلها
    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Story> stories;

}