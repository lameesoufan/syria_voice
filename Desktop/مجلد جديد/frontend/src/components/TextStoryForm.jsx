// src/components/TextStoryForm.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './StoryForm.module.css';
import { FiSave, FiXCircle, FiFileText, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { PROVINCES_MAP } from '../utils/constants';
import useStories from '../hooks/useStories';

const TextStoryForm = ({ onCancel, onSuccess }) => {
  // Story State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Metadata State
  const [province, setProvince] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [attacker, setAttacker] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { submit } = useStories();

  // --- handleSubmit Function (مُعدلة) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. التحقق من جميع الحقول الإلزامية
    if (!title || !content || !province || !incidentDate) {
      setError('الرجاء ملء جميع الحقول المطلوبة: العنوان، المحتوى، المحافظة، وتاريخ الحادثة.');
      return;
    }

    setIsSubmitting(true);

    // 2. بناء حمولة بيانات القصة (Story JSON Payload)
    const storyPayload = {
      title: title,
      textContent: content, // 🟢 تم التعديل: مطابقة مواصفات الـ YAML (textContent بدلاً من content)
      type: 'TEXT', // ⬅️ النوع: TEXT
      attacker: attacker || null,
      incidentDate: incidentDate,
      province: province,
    };

    try {
      // Build multipart/form-data per backend spec: 'story' JSON + optional file
      const formData = new FormData();
      formData.append('story', JSON.stringify(storyPayload));
      // If there's a file field in state (not used for text stories), append it
      // (UI components that support file uploads should set payload.file)
      if (storyPayload.file) formData.append('file', storyPayload.file);
      await submit(formData, 'multipart/form-data');

      // 4. التعامل مع النجاح
      toast.success("Text story submitted successfully!", { autoClose: 3000 });
      if (onSuccess) onSuccess();

    } catch (err) {
      // 5. التعامل مع الأخطاء القادمة من طبقة الخدمة
      const errorMessage = err.message || 'An unexpected error occurred during submission.';
      setError(errorMessage);
      toast.error(errorMessage);

    } finally {
      setIsSubmitting(false);
    }
  };

  // --- JSX Return (مُعدلة) ---

  return (
    <motion.div
      className={styles.formCard}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      key="text-form"
    >
      <header className={styles.formHeader}>
        <div className={styles.eyebrow} style={{ background: '#e6fffa', color: '#38b2ac' }}>
          <FiFileText />
          <span>Text Story</span>
        </div>
        <h2>Share Your Story</h2>
      </header>

      <form onSubmit={handleSubmit} dir="rtl">
        {error && (
          <div className={styles.errorMessage} style={{ marginBottom: '15px' }}>
            {error}
          </div>
        )}

        {/* 1. Title Field */}
        <div className={styles.inputGroup}>
          <label htmlFor="title">عنوان القصة (Headline) *</label>
          <input
            id="title"
            type="text"
            placeholder="أدخل عنواناً واضحاً وموجزاً لقصتك..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.inputField}
            required
            disabled={isSubmitting}
          />
        </div>

        {/* 2. Content Field */}
        <div className={styles.inputGroup}>
          <label htmlFor="content">محتوى القصة *</label>
          <textarea
            id="content"
            rows="8"
            placeholder="اكتب قصتك هنا..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={styles.textareaField}
            required
            disabled={isSubmitting}
          />
        </div>

        {/* 3. Metadata Grid */}
        <div className={styles.metaDataGrid}>

          {/* Province */}
        <div className={styles.inputGroup}>
    <label>المحافظة *</label>
    <select 
        value={province} 
        onChange={(e) => setProvince(e.target.value)} 
        className={styles.inputField}
        required
    >
        <option value="">اختر المحافظة...</option>
        {Object.entries(PROVINCES_MAP).map(([key, label]) => (
            <option key={key} value={key}>
                {label}
            </option>
        ))}
    </select>
</div>

          {/* Date */}
          <div className={styles.inputGroup} style={{ position: 'relative' }}>
            <label htmlFor="incidentDate">تاريخ الحادثة *</label>
            <input
              id="incidentDate"
              type="date"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              className={styles.inputField}
              required
              disabled={isSubmitting}
            />
            <FiCalendar className={styles.dateIcon} />
          </div>

          {/* Attacker */}
          <div className={styles.inputGroup}>
            <label htmlFor="attacker">المهاجم/الجهة المسؤولة (اختياري)</label>
            <input
              id="attacker"
              type="text"
              placeholder="Specify a specific group..."
              value={attacker}
              onChange={(e) => setAttacker(e.target.value)}
              className={styles.inputField}
              disabled={isSubmitting}
            />
          </div>

        </div>

        {/* Buttons */}
        <div className={styles.buttonRow}>
          <motion.button
            type="button"
            className={styles.ghostButton}
            onClick={onCancel}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={isSubmitting}
          >
            <FiXCircle className={styles.buttonIcon} />
            <span>Cancel</span>
          </motion.button>

          <motion.button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiSave className={styles.buttonIcon} />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Story'}</span>
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default TextStoryForm;