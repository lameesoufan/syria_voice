// src/components/ResetForm.jsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // ⬅️ الإضافة المطلوبة لربط التنقل
import { FiMail, FiArrowLeft, FiSend, FiCheckCircle } from 'react-icons/fi';
import styles from './LoginForm.module.css'; // التأكد من استخدام نفس ملف الـ CSS الأصلي
import { toast } from 'react-toastify';
import { requestPasswordReset } from '../api/authService';

const ResetForm = () => {
  const navigate = useNavigate(); // ⬅️ تعريف أداة التنقل بدلاً من onGoBack
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    try {
      setIsSubmitting(true);
      await requestPasswordReset(email);
      setIsSubmitted(true);
      toast.success('Password reset code sent to your email');
    } catch (err) {
      setError(err.message || 'Failed to send reset code');
      toast.error(err.message || 'Failed to send reset code');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.loginPageWrapper}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={styles.loginContainer}
      >
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>Reset Password</h2>
          <p className={styles.formSubtitle}>
            Enter your email to receive a password reset link
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className={styles.loginForm}>
            {error && (
              <motion.div
                className={styles.errorMessage}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            <div className={styles.inputGroup}>
              <FiMail className={styles.inputIcon} />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.inputField}
                required
                disabled={isSubmitting}
              />
            </div>

            <motion.button
              type="submit"
              className={styles.loginButton}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
            >
              <FiSend className={styles.buttonIcon} />
              <span>{isSubmitting ? 'Sending...' : 'Send Reset Link'}</span>
            </motion.button>

            {/* تعديل الزر الذي كان يسبب الخطأ */}
            <button
              type="button"
              onClick={() => navigate('/login')} // ⬅️ الانتقال لصفحة Login
              className={styles.backButton}
              disabled={isSubmitting}
            >
              <FiArrowLeft /> Back to Login
            </button>
          </form>
        ) : (
          <motion.div 
            className={styles.successState}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={styles.successIconWrapper}>
              <FiCheckCircle size={48} color="#48bb78" />
            </div>
            <p>Check your email for instructions to reset your password.</p>
            <button
              type="button"
              onClick={() => navigate('/login')} // ⬅️ العودة لصفحة Login بعد النجاح
              className={styles.loginButton}
              style={{ marginTop: '20px' }}
            >
              Back to Login
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ResetForm;