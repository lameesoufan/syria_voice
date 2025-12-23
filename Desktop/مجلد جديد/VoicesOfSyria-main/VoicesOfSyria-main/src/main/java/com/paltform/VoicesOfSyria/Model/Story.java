package com.paltform.VoicesOfSyria.Model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.paltform.VoicesOfSyria.Enum.Province;
import com.paltform.VoicesOfSyria.Enum.StoryStatus;
import com.paltform.VoicesOfSyria.Enum.StoryType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "stories")
@Data
public class Story {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 5000)
    private String textContent; // للقصة النصية فقط

    private String mediaUrl; // رابط ملف الصوت أو الفيديو (إن وجد)

    @Enumerated(EnumType.STRING)
    private StoryType type; // TEXT, AUDIO, VIDEO

    @Enumerated(EnumType.STRING)
    private StoryStatus status = StoryStatus.PENDING; // PENDING, APPROVED, REJECTED

    private LocalDateTime publishDate;

    private LocalDateTime updatedAt;

    private String attacker; // الجهة المعتدية (جيش النظام/حزب الله..)

    private LocalDate incidentDate;

    @Enumerated(EnumType.STRING)
    private Province province;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties("stories") // تجاهل الـ stories عند serialization لتجنب loop
    private User author;

    String adminMessage;


}
