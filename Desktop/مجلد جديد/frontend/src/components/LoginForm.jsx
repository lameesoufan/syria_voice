// src/components/LoginForm.jsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // ⬅️ أضفنا هذا للتنقل
import styles from './LoginForm.module.css';
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff, FiUserPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';
// Ensure localStorage is only updated after successful login (inside handler)


const LoginForm = ({ onLoginSuccess }) => {
  const navigate = useNavigate(); // ⬅️ تعريف أداة التنقل
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  };

  const { login } = useAuth();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  if (!email || !password) {
    setError('Please enter both email and password.');
    return;
  }

    try {
      setIsSubmitting(true);
      const result = await login(email, password);
      // Persist user tokens/info after successful login
      try {
        if (result?.user) localStorage.setItem('user', JSON.stringify(result.user));
      } catch (err) {
        console.warn('Failed to write user to localStorage', err);
      }
      if (!result?.user) throw new Error('Invalid login response');
      toast.success('Login successful');
      onLoginSuccess(result.user.role);
    } catch (err) {
      console.error('Login error:', err); // ⬅️ إضافة logging للخطأ
      console.error('Error response:', err.response?.data); // ⬅️ إضافة تفاصيل الـ response
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
};


 
  return (
    <div className={styles.loginPageWrapper}>
      <motion.div
        key="login-form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: 'tween', duration: 0.4 }}
        className={styles.loginContainer}
      >
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>Welcome Back</h2>
          <p className={styles.formSubtitle}>Sign in to continue to your account</p>
        </div>

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

        <form onSubmit={handleSubmit} className={styles.loginForm}>
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
              disabled={isSubmitting}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {/* Forgot Password Link - تم تعديله للرابط الجديد */}
          <div className={styles.forgotPasswordContainer}>
            <a
              href="#"
              onClick={(e) => { 
                e.preventDefault(); 
                navigate('/reset-password'); // ⬅️ استخدام navigate
              }}
              className={styles.forgotPasswordLink}
            >
              Forgot Password?
            </a>
          </div>

          {/* Login Button */}
          <motion.button
            type="submit"
            className={styles.loginButton}
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            disabled={isSubmitting}
          >
            <FiLogIn className={styles.buttonIcon} />
            <span>{isSubmitting ? 'Logging In...' : 'Log In'}</span>
          </motion.button>

          {/* زر العودة للزائر - تم تعديله للرابط الجديد ليعود للظهور */}
          <button
            type="button"
            onClick={() => navigate('/')} // ⬅️ استخدام navigate للرابط الرئيسي
            className={styles.backButton}
            disabled={isSubmitting}
          >
            Continue as Visitor
          </button>
        </form>

        {/* Sign Up Section */}
        <div className={styles.signUpSection}>
          <div className={styles.divider}>
            <span>or</span>
          </div>
          <p className={styles.signUpText}>
            Don't have an account?
          </p>
          <motion.button
            type="button"
            onClick={() => navigate('/signup')} // ⬅️ استخدام navigate
            className={styles.signUpButton}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiUserPlus className={styles.signUpIcon} />
            <span>Create New Account</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;