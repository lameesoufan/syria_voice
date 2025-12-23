// src/components/VideoStoryForm.jsx

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // أضفنا AnimatePresence
import styles from './StoryForm.module.css';
import { FiSave, FiXCircle, FiVideo, FiCalendar, FiUploadCloud, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { PROVINCES_MAP } from '../utils/constants';
import useStories from '../hooks/useStories';

const MAX_FILE_SIZE_MB = 200;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const VideoStoryForm = ({ onCancel, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [province, setProvince] = useState('');
    const [incidentDate, setIncidentDate] = useState('');
    const [attacker, setAttacker] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0); // الحالة الجديدة للتقدم
    const { submit } = useStories();
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith('video/')) {
                if (file.size > MAX_FILE_SIZE_BYTES) {
                    setError(`File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
                    setVideoFile(null);
                } else {
                    setVideoFile(file);
                    setError('');
                }
            } else {
                setError('Please select a valid video file.');
                setVideoFile(null);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!videoFile || !title || !province || !incidentDate) {
            setError('Please fill in all required fields and select a video.');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setUploadProgress(0);

        // Build payload
        const storyPayload = {
            title: title,
            type: 'VIDEO',
            attacker: attacker || null,
            incidentDate: incidentDate,
            province: province,
        };

        const formData = new FormData();
        formData.append('story', JSON.stringify(storyPayload));
        formData.append('file', videoFile);

        try {
            await submit(formData, 'multipart/form-data', {
                onUploadProgress: (e) => {
                    if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total));
                }
            });
            setUploadProgress(100);
            toast.success('Video story submitted successfully!');
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.message || 'An error occurred during upload. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div 
            className={styles.formCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className={styles.formHeader}>
                <div className={styles.iconCircle}>
                    <FiVideo />
                </div>
                <h2>Share Video Story</h2>
                <p>Upload your video testimony (Max {MAX_FILE_SIZE_MB}MB)</p>
            </div>

            {error && <div className={styles.errorAlert}>{error}</div>}

            <form onSubmit={handleSubmit}>
                {/* Title Input */}
                <div className={styles.inputGroup}>
                    <label>Story Title *</label>
                    <input 
                        type="text"
                        placeholder="e.g., My testimony from Homs..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={styles.inputField}
                        disabled={isSubmitting}
                    />
                </div>

                {/* Video Upload Area */}
                {!videoFile ? (
                    <div 
                        className={styles.uploadArea}
                        onClick={() => !isSubmitting && fileInputRef.current.click()}
                    >
                        <FiUploadCloud className={styles.uploadIcon} />
                        <p className={styles.uploadText}>Click to upload video</p>
                        <p className={styles.uploadSubtext}>MP4, MOV or AVI (Max {MAX_FILE_SIZE_MB}MB)</p>
                        <input 
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="video/*"
                            style={{ display: 'none' }}
                        />
                    </div>
                ) : (
                    <div className={styles.filePreview}>
                        <div className={styles.fileInfo}>
                            <FiVideo className={styles.fileIcon} />
                            <span className={styles.fileName}>{videoFile.name}</span>
                        </div>
                        <button 
                            type="button" 
                            className={styles.removeBtn}
                            onClick={() => setVideoFile(null)}
                            disabled={isSubmitting}
                        >
                            <FiTrash2 />
                        </button>
                    </div>
                )}

                {/* شريط التقدم الجديد (يظهر فقط أثناء الرفع) */}
                <AnimatePresence>
                    {isSubmitting && (
                        <motion.div 
                            className={styles.progressContainer}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <div className={styles.progressLabel}>
                                <span>{uploadProgress < 100 ? 'Uploading your story...' : 'Processing...'}</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className={styles.progressBarWrapper}>
                                <motion.div 
                                    className={styles.progressBarFill}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadProgress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Metadata Row */}
                <div className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                        <label>Province *</label>
                        <select 
                            value={province}
                            onChange={(e) => setProvince(e.target.value)}
                            className={styles.inputField}
                            disabled={isSubmitting}
                        >
                            <option value="">Select province...</option>
                            {Object.entries(PROVINCES_MAP).map(([key, value]) => (
                                <option key={key} value={key}>{value}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Date of Incident *</label>
                        <input 
                            type="date"
                            value={incidentDate}
                            onChange={(e) => setIncidentDate(e.target.value)}
                            className={styles.inputField}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.buttonRow}>
                    <button
                        type="button"
                        className={styles.ghostButton}
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        <FiXCircle /> Cancel
                    </button>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <><FiSave /> Uploading...</>
                        ) : (
                            <><FiCheckCircle /> Submit Story</>
                        )}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default VideoStoryForm;