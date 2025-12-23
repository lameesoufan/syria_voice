// src/components/StoryDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStoryById } from '../api/storyService';
import { FiArrowLeft, FiFileText, FiMic, FiVideo, FiMapPin, FiClock, FiUser } from 'react-icons/fi';
import styles from './VisitorView.module.css'; // استخدام نفس الـ styles

const StoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const data = await getStoryById(id);
        setStory(data);
      } catch (err) {
        setError(err.message || 'Failed to load story');
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  const renderTypeIcon = (type) => {
    switch (type) {
      case 'AUDIO': return <FiMic />;
      case 'VIDEO': return <FiVideo />;
      default: return <FiFileText />;
    }
  };

  if (loading) return <div className={styles.visitorPage}><p>Loading...</p></div>;
  if (error) return <div className={styles.visitorPage}><p>Error: {error}</p></div>;
  if (!story) return <div className={styles.visitorPage}><p>Story not found</p></div>;

  return (
    <div className={styles.visitorPage}>
      <header className={styles.topBar}>
        <button className={styles.backButton} onClick={() => navigate('/')}>
          <FiArrowLeft /> Back to Stories
        </button>
        <div className={styles.brand}>
          <FiFileText />
          <span>Story Details</span>
        </div>
      </header>

      <div className={styles.storyDetail}>
        <div className={styles.storyHeader}>
          <h1>{story.title}</h1>
          <div className={styles.storyMeta}>
            <span className={styles.typeBadge}>
              {renderTypeIcon(story.type)}
              {story.type}
            </span>
            <span className={styles.metaItem}>
              <FiMapPin />
              {story.province}
            </span>
            <span className={styles.metaItem}>
              <FiClock />
              {new Date(story.incidentDate).toLocaleDateString()}
            </span>
            {story.author && (
              <span className={styles.metaItem}>
                <FiUser />
                {story.author.name}
              </span>
            )}
          </div>
        </div>

        <div className={styles.storyContent}>
          {story.textContent && (
            <div className={styles.textContent}>
              <h3>Story Content</h3>
              <p>{story.textContent}</p>
            </div>
          )}

          {story.mediaUrl && (
            <div className={styles.mediaContent}>
              {story.type === 'VIDEO' && (
                <video controls src={story.mediaUrl} className={styles.mediaPlayer} />
              )}
              {story.type === 'AUDIO' && (
                <audio controls src={story.mediaUrl} className={styles.mediaPlayer} />
              )}
            </div>
          )}

          {story.attacker && (
            <div className={styles.attackerInfo}>
              <h4>Attacker</h4>
              <p>{story.attacker}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryDetail;