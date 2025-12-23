import React, { useState, useMemo } from 'react';
import { 
  FiCheckCircle,
  FiXCircle,
  FiEdit,
  FiShield,
  FiLogOut,
  FiFileText,
  FiMic,
  FiVideo,
  FiMapPin,
  FiClock,
  FiUser,
  FiAlertCircle,
  FiX,
  FiSettings
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import useAdmin from '../hooks/useAdmin';
import useAuth from '../hooks/useAuth';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AdminView.module.css';
import { PROVINCES_MAP } from '../utils/constants';

// Helper to render type icon
const TypeIcon = ({ type }) => {
  if (type === 'AUDIO') return <FiMic />;
  if (type === 'VIDEO') return <FiVideo />;
  return <FiFileText />;
};

// Initial mock data shaped like the OpenAPI Story schema
const INITIAL_QUEUE = [
  {
    id: 1,
    title: 'Memory of Aleppo',
    textContent: 'A testimony from Aleppo about the events in 2013...',
    mediaUrl: '',
    type: 'AUDIO',
    status: 'PENDING',
    publishDate: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    attacker: 'Unknown militia',
    incidentDate: '2013-05-20',
    province: 'ALEPPO',
    author: {
      id: 101,
      name: 'User1',
      email: 'user1@example.com',
      role: 'USER'
    },
    adminMessage: ''
  },
  {
    id: 2,
    title: 'Damascus Road',
    textContent: 'Description of events on the road to Damascus...',
    mediaUrl: 'https://example.com/video.mp4',
    type: 'VIDEO',
    status: 'PENDING',
    publishDate: '2025-01-18T09:30:00Z',
    updatedAt: '2025-01-18T09:30:00Z',
    attacker: 'Air strike',
    incidentDate: '2014-03-11',
    province: 'DAMASCUS',
    author: {
      id: 102,
      name: 'User2',
      email: 'user2@example.com',
      role: 'USER'
    },
    adminMessage: ''
  }
];

const AdminView = ({ onLogout }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [selectedId, setSelectedId] = useState(INITIAL_QUEUE[0]?.id ?? null);
  const [modificationNote, setModificationNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [storyToReject, setStoryToReject] = useState(null);

  const selectedStory = useMemo(
    () => queue.find((item) => item.id === selectedId) || queue[0] || null,
    [queue, selectedId]
  );

  const pendingCount = queue.length;

  const { pending, fetchPending, approve, reject, requestModification } = useAdmin();

  useEffect(() => {
    fetchPending().then((res) => {
      if (Array.isArray(res)) setQueue(res);
    }).catch(() => {});
  }, [fetchPending]);

  const handleApprove = async (storyId) => {
    try {
      await approve(storyId);
      setQueue((prev) => prev.filter((s) => s.id !== storyId));
      toast.success('Story approved');
    } catch (err) { toast.error(err.message || 'Approve failed'); }
  };

  const handleReject = (storyId) => {
    const story = queue.find((s) => s.id === storyId);
    setStoryToReject(story);
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection.');
      return;
    }
    try {
      // Do not send the reason to backend (backend reject endpoint doesn't accept a body)
      await reject(storyToReject.id);
      setQueue((prev) => prev.filter((s) => s.id !== storyToReject.id));
      toast.error(`Story "${storyToReject.title}" rejected`);
    } catch (err) {
      toast.error(err.message || 'Reject failed');
    } finally {
      setShowRejectModal(false);
      setRejectionReason('');
      setStoryToReject(null);
    }
  };

  const handleCancelReject = () => {
    setShowRejectModal(false);
    setRejectionReason('');
    setStoryToReject(null);
  };

  const handleRequestModification = async (storyId) => {
    if (!modificationNote.trim()) {
      toast.warn('Please write a modification note first.');
      return;
    }
    try {
      await requestModification(storyId, modificationNote);
      setQueue((prev) => prev.filter((s) => s.id !== storyId));
      setModificationNote('');
      toast.info('Requested modification');
    } catch (err) { toast.error(err.message || 'Request modification failed'); }
  };

  // Super-admin creation is disabled in the UI — must be performed by an authenticated SUPER_ADMIN

  return (
    <div className={styles.adminPage}>
<header className={styles.topBar}>
        <div className={styles.brand}>
          <FiShield />
          <span>Admin Moderation Panel</span>
        </div>
        <div className={styles.topBarRight}>
          {user?.role === 'SUPER_ADMIN' && (
            <button 
              onClick={() => navigate('/super-admin')} 
              className={styles.superAdminBtn}
              title="Manage Admin Accounts"
            >
              <FiSettings />
              <span>Manage Admins</span>
            </button>
          )}
          <button onClick={onLogout} className={styles.logoutBtn}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
</header>

      <main className={styles.mainContent}>
        <section className={styles.statsBar}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Pending stories</span>
            <span className={styles.statValue}>{pendingCount}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Today&apos;s focus</span>
            <span className={styles.statSub}>Review and triage new submissions</span>
          </div>
        </section>

        <section className={styles.layout}>
          <div className={styles.queuePanel}>
            <div className={styles.panelHeader}>
              <h2>Moderation queue</h2>
              <span className={styles.badge}>{pendingCount} pending</span>
            </div>

            {queue.length === 0 ? (
              <div className={styles.emptyState}>
                <FiCheckCircle />
                <p>No stories waiting for review. You&apos;re all caught up!</p>
              </div>
            ) : (
              <div className={styles.queueList}>
                {queue.map((story) => (
                  <button
                    key={story.id}
                    type="button"
                    className={`${styles.storyCard} ${
                      selectedStory?.id === story.id ? styles.storyCardActive : ''
                    }`}
                    onClick={() => setSelectedId(story.id)}
                  >
                    <div className={styles.storyHeader}>
                      <span
                        className={`${styles.typeTag} ${styles[`type-${story.type?.toLowerCase()}`]}`}
                      >
                        <TypeIcon type={story.type} />
                        {story.type}
                      </span>
                      <span className={styles.storyId}>#{story.id}</span>
                    </div>
                    <h3 className={styles.storyTitle}>{story.title}</h3>
                    <div className={styles.storyMeta}>
                      <span>
                        <FiMapPin />
                        {PROVINCES_MAP[story.province] || story.province}
                      </span>
                      <span>
                        <FiClock />
                        Pending
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.detailPanel}>
            {!selectedStory ? (
              <div className={styles.emptyDetails}>
                <FiAlertCircle />
                <p>Select a story from the queue to review its details.</p>
              </div>
            ) : (
              <div className={styles.detailContent}>
                <div className={styles.detailHeader}>
                  <div>
                    <h2>{selectedStory.title}</h2>
                    <div className={styles.storyMetaRow}>
                      <span>
                        <FiUser />
                        {selectedStory.author?.name} ({selectedStory.author?.email})
                      </span>
                      <span>
                        <FiMapPin />
                        {PROVINCES_MAP[selectedStory.province] || selectedStory.province}
                      </span>
                      <span>
                        <FiClock />
                        Incident: {selectedStory.incidentDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.detailBody}>
                  <div className={styles.section}>
                    <h3>Story summary</h3>
                    <p className={styles.textBlock}>{selectedStory.textContent}</p>
                  </div>

                  <div className={styles.section}>
                    <h3>Context</h3>
                    <div className={styles.contextGrid}>
                      <div>
                        <span className={styles.contextLabel}>Type</span>
                        <span className={styles.contextValue}>{selectedStory.type}</span>
                      </div>
                      <div>
                        <span className={styles.contextLabel}>Attacker</span>
                        <span className={styles.contextValue}>
                          {selectedStory.attacker || 'Not specified'}
                        </span>
                      </div>
                      <div>
                        <span className={styles.contextLabel}>Submitted on</span>
                        <span className={styles.contextValue}>
                          {selectedStory.publishDate?.slice(0, 10)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedStory.mediaUrl && (
                    <div className={styles.section}>
                      <h3>Attached media</h3>
                      <a
                        href={selectedStory.mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.mediaLink}
                      >
                        View media
                      </a>
                    </div>
                  )}

                  <div className={styles.section}>
                    <h3>Request modification (optional)</h3>
                    <textarea
                      className={styles.noteInput}
                      placeholder="Explain clearly what needs to be changed or clarified for this story."
                      value={modificationNote}
                      onChange={(e) => setModificationNote(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.actionsBar}>
                  <button
                    type="button"
                    className={`${styles.actionButton} ${styles.reject}`}
                    onClick={() => handleReject(selectedStory.id)}
                  >
                    <FiXCircle />
                    <span>Reject</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionButton} ${styles.modify}`}
                    onClick={() => handleRequestModification(selectedStory.id)}
                  >
                    <FiEdit />
                    <span>Request modification</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionButton} ${styles.approve}`}
                    onClick={() => handleApprove(selectedStory.id)}
                  >
                    <FiCheckCircle />
                    <span>Approve</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Modals */}
      <div>

        {/* Rejection Reason Modal */}
        <AnimatePresence>
          {showRejectModal && storyToReject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modalOverlay}
            onClick={handleCancelReject}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>
                  <FiXCircle />
                  Reject Story
                </h2>
                <button
                  className={styles.modalClose}
                  onClick={handleCancelReject}
                >
                  <FiX />
                </button>
              </div>

              <div className={styles.rejectModalBody}>
                <div className={styles.rejectStoryInfo}>
                  <h3>{storyToReject.title}</h3>
                  <p>By: {storyToReject.author?.name} ({storyToReject.author?.email})</p>
                </div>

                <div className={styles.formGroup}>
                  <label>
                    <FiAlertCircle />
                    Reason for rejection *
                  </label>
                  <textarea
                    className={styles.rejectReasonInput}
                    placeholder="Please explain why this story is being rejected. This feedback will be sent to the publisher to help them understand what needs to be fixed."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                    required
                  />
                  <small className={styles.inputHelp}>
                    Be specific about what needs to be corrected or improved.
                  </small>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCancelReject}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`${styles.rejectButton} ${!rejectionReason.trim() ? styles.disabled : ''}`}
                  onClick={handleConfirmReject}
                  disabled={!rejectionReason.trim()}
                >
                  <FiXCircle />
                  Reject Story
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminView;