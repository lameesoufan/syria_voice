// src/components/AudioStoryForm.jsx (الكود المُعدل)

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import styles from './StoryForm.module.css';
import { FiSave, FiXCircle, FiMic, FiCalendar, FiUploadCloud, FiTrash2, FiMusic } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { PROVINCES_MAP } from '../utils/constants';
import useStories from '../hooks/useStories';

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const AudioStoryForm = ({ onCancel, onSuccess }) => {
    // Story State
    const [title, setTitle] = useState('');
    const [audioFile, setAudioFile] = useState(null);

    // Metadata State
    const [province, setProvince] = useState('');
    const [incidentDate, setIncidentDate] = useState('');
    const [attacker, setAttacker] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { submit } = useStories();
    const fileInputRef = useRef(null);

    // --- File Handling Functions (لم تتغير) ---

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith('audio/')) {
                if (file.size > MAX_FILE_SIZE_BYTES) {
                    setError(`File size exceeds the limit of ${MAX_FILE_SIZE_MB}MB.`);
                    toast.error(`File size exceeds the limit of ${MAX_FILE_SIZE_MB}MB.`);
                    setAudioFile(null);
                } else {
                    setAudioFile(file);
                    setError('');
                }
            } else {
                setError('Please upload a valid audio file.');
                toast.error('Invalid file type. Please upload an audio file.');
            }
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            if (file.type.startsWith('audio/')) {
                if (file.size > MAX_FILE_SIZE_BYTES) {
                    setError(`File size exceeds the limit of ${MAX_FILE_SIZE_MB}MB.`);
                    toast.error(`File size exceeds the limit of ${MAX_FILE_SIZE_MB}MB.`);
                    setAudioFile(null);
                } else {
                    setAudioFile(file);
                    setError('');
                }
            } else {
                setError('Please upload a valid audio file.');
                toast.error('Invalid file type. Please upload an audio file.');
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const removeFile = () => {
        setAudioFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // --- handleSubmit Function (مُعدلة) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // 1. التحقق من جميع الحقول الإلزامية
        if (!title || !audioFile || !province || !incidentDate) {
            setError('الرجاء ملء جميع الحقول المطلوبة: العنوان، ملف الصوت، المحافظة، وتاريخ الحادثة.');
            return;
        }

        setIsSubmitting(true);

        // 2. بناء حمولة بيانات القصة (Story JSON Payload)
        const storyPayload = {
            title: title,
            type: 'AUDIO', // ⬅️ النوع: AUDIO
            attacker: attacker || null, 
            incidentDate: incidentDate, 
            province: province,
        };
        
        // 3. بناء كائن FormData
        const formData = new FormData();
        formData.append('story', JSON.stringify(storyPayload)); 
        formData.append('file', audioFile); // 'file' هو اسم الحقل المتوقع للملف

        try {
            // ⬅️ 4. استدعاء الدالة من طبقة الخدمة
            // نمرر FormData ونوع المحتوى كـ 'multipart/form-data'
            await submit(formData, 'multipart/form-data');
            
            // 5. التعامل مع النجاح
            toast.success("Audio story submitted successfully!", { autoClose: 3000 });
            if (onSuccess) onSuccess();

        } catch (err) {
            // 6. التعامل مع الأخطاء القادمة من طبقة الخدمة
            const errorMessage = err.message || 'An unexpected error occurred during submission.';
            setError(errorMessage);
            toast.error(errorMessage);
            
        } finally {
            setIsSubmitting(false);
        }
    };
    // -----------------------------------------------------------------

    // --- JSX Return (لم يتغير) ---

    return (
        <motion.div
            className={styles.formCard}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            key="audio-form"
        >
            <header className={styles.formHeader}>
                <div className={styles.eyebrow} style={{ background: '#f0fff4', color: '#38a169' }}>
                    <FiMic />
                    <span>Audio Story</span>
                </div>
                <h2>Share Your Voice</h2>
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

                {/* 2. Audio Upload Area */}
                <div className={styles.inputGroup}>
                    <label>ملف الصوت *</label>

                    {!audioFile ? (
                        <div
                            className={styles.uploadZone}
                            onClick={() => fileInputRef.current.click()}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            disabled={isSubmitting}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="audio/*"
                                style={{ display: 'none' }}
                                disabled={isSubmitting}
                            />
                            <FiUploadCloud className={styles.uploadIcon} />
                            <div className={styles.uploadText}>اضغط للرفع أو اسحب الملف هنا</div>
                            <div className={styles.uploadSubtext}>MP3, WAV, M4A (Max {MAX_FILE_SIZE_MB}MB)</div>
                        </div>
                    ) : (
                        <div className={styles.filePreview}>
                            <div className={styles.fileInfo}>
                                <FiMusic size={24} color="#4299e1" />
                                <div>
                                    <div className={styles.fileName}>{audioFile.name}</div>
                                    <div className={styles.fileSize}>{formatFileSize(audioFile.size)}</div>
                                </div>
                            </div>
                            <button type="button" onClick={removeFile} className={styles.removeButton} disabled={isSubmitting}>
                                <FiTrash2 size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* 3. Metadata Grid */}
                <div className={styles.metaDataGrid}>

                    {/* Province */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="province">المحافظة (مكان الحادثة) *</label>
                        <select
                            id="province"
                            value={province}
                            onChange={(e) => setProvince(e.target.value)}
                            className={styles.inputField}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="">اختر محافظة</option>
                            {Object.entries(PROVINCES_MAP).map(([key, value]) => (
                                <option key={key} value={key}>{value}</option>
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

export default AudioStoryForm;