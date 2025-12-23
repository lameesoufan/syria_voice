// src/components/SignUpForm.jsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // ⬅️ الإضافة المطلوبة
import styles from './LoginForm.module.css'; // التأكد من استخدام نفس ملف التنسيق
import { FiMail, FiLock, FiUser, FiArrowLeft, FiUserPlus, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { registerUser, verifyEmail } from '../api/authService';

const SignUpForm = () => {
  const navigate = useNavigate(); // ⬅️ تعريف أداة التنقل
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState(''); // ⬅️ إضافة state للكود
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false); // ⬅️ إضافة state للتحقق
  const [showVerification, setShowVerification] = useState(false); // ⬅️ إضافة state لإظهار form التحقق
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!verificationCode.trim()) {
      setError('Please enter verification code');
      return;
    }

    try {
      setIsVerifying(true);
      await verifyEmail({ email, code: verificationCode });
      toast.success('Email verified successfully! You can now login.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Verification failed');
      toast.error(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e) => { // ⬅️ إضافة بداية الدالة
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      await registerUser({ name: fullName, email, password });
      toast.success('Account created! Please check your email for verification code.');
      setShowVerification(true); // ⬅️ إظهار form التحقق بدلاً من الانتقال
    } catch (err) {
      setError(err.message || 'Failed to create account');
      toast.error(err.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.loginPageWrapper}>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={styles.loginContainer}
      >
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>Create Account</h2>
          <p className={styles.formSubtitle}>Join us to start sharing your stories</p>
        </div>

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

          {/* Full Name Input */}
          <div className={styles.inputGroup}>
            <FiUser className={styles.inputIcon} />
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={styles.inputField}
              required
            />
          </div>

          {/* Email Input */}
          <div className={styles.inputGroup}>
            <FiMail className={styles.inputIcon} />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.inputField}
              required
            />
          </div>

          {/* Password Input */}
          <div className={styles.inputGroup}>
            <FiLock className={styles.inputIcon} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.inputField}
              required
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <motion.button
            type="submit"
            className={styles.loginButton}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
          >
            <FiUserPlus className={styles.buttonIcon} />
            <span>{isSubmitting ? 'Creating Account...' : 'Sign Up'}</span>
          </motion.button>
        </form>

        {/* Verification Form */}
        {showVerification && (
          <motion.form
            onSubmit={handleVerify}
            className={styles.loginForm}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className={styles.verificationTitle}>Verify Your Email</h3>
            <p className={styles.verificationText}>
              We've sent a verification code to {email}
            </p>

            <div className={styles.inputGroup}>
              <FiMail className={styles.inputIcon} />
              <input
                type="text"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className={styles.inputField}
                required
              />
            </div>

            <motion.button
              type="submit"
              disabled={isVerifying}
              className={styles.loginButton}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isVerifying ? 'Verifying...' : 'Verify Email'}
            </motion.button>
          </motion.form>
        )}

        <div className={styles.signUpSection}>
          <div className={styles.divider}>
            <span>Already have an account?</span>
          </div>
          
          {/* تم تعديل هذا الزر الذي كان يسبب الخطأ */}
          <motion.button
            type="button"
            onClick={() => navigate('/login')} // ⬅️ التعديل هنا بدلاً من onLogin
            className={styles.backButton}
            whileHover={{ x: -5 }}
          >
            <FiArrowLeft /> Back to Login
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpForm;