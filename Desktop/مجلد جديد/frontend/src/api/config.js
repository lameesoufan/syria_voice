// src/api/config.js (الكود الصحيح والنهائي)

// ⬅️ Base URL: use environment variable when provided, otherwise default to localhost per OpenAPI
export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// ⬅️ API BASE PATH: المسار الأساسي الذي يسبق جميع نقاط النهاية
export const API_BASE_PATH ='' ; // 🟢 فارغ - مطابقة مواصفات الـ YAML (المسارات تبدأ من الجذر)

// ⬅️ اسم حقل المفتاح لتخزين Access Token في LocalStorage
export const ACCESS_TOKEN_KEY = 'accessToken';

// ⬅️ اسم حقل مفتاح الـ Refresh Token في LocalStorage
export const REFRESH_TOKEN_KEY = 'refreshToken';