// src/components/VisitorView.jsx (الكود المُعدَّل)

import React, { useEffect, useState } from 'react'; // ⬅️ إضافة useEffect
import { PROVINCES_MAP } from '../utils/constants';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiBookOpen,
  FiGrid,
  FiFilter,
  FiMapPin,
  FiClock,
  FiHeadphones,
  FiPlayCircle,
  FiFileText,
  FiLogIn
} from 'react-icons/fi';
import styles from './VisitorView.module.css';

// ⬅️ 1. استيراد دالة جلب القصص من طبقة الخدمة
import { fetchStories } from '../api/storyService'; 

// ⬅️ إزالة storiesMock

const typeMeta = {
  all: { label: 'All', icon: <FiGrid /> },
  audio: { label: 'Audio', icon: <FiHeadphones /> },
  video: { label: 'Video', icon: <FiPlayCircle /> },
  text: { label: 'Text', icon: <FiFileText /> }
};

const VisitorView = ({ onLogin }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // ⬅️ 2. حالات جديدة للتعامل مع بيانات الـ API
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ⬅️ 3. منطق جلب البيانات (useEffect)
  useEffect(() => {
    let isMounted = true; 

    const loadStories = async () => {
      setIsLoading(true);
      setError(null);
      
      const params = {
        search: searchTerm,
        // إرسال نوع القصة إلى API إذا لم يكن 'all'
        type: typeFilter !== 'all' ? typeFilter : undefined, 
      };

      try {
        const data = await fetchStories(params); // استدعاء API
        if (isMounted) {
          setStories(data);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching stories:", err);
          setError(err.message || 'Failed to load stories from the server.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadStories();

    return () => {
      isMounted = false; 
    };
  }, [searchTerm, typeFilter]); // إعادة الجلب عند تغيير البحث أو الفلتر


  const renderTypeBadge = (type) => {
    const meta = typeMeta[type];
    if (!meta) return null; 
    return (
      <span className={`${styles.typeBadge} ${styles[`type-${type}`]}`}>
        {meta.icon}
        {meta.label}
      </span>
    );
  };

  return (
    
    <div className={styles.visitorPage}>
      <header className={styles.topBar}>
        <div className={styles.brand}>
          <FiBookOpen />
          <span>Voices Of Syria</span>
        </div>
       <button className={styles.loginBtn} onClick={() => navigate('/login')} >
  <FiLogIn /> Login
</button>
      </header>

      <section className={styles.searchSection}>
        <div className={styles.searchInputWrapper}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search stories, tags, or locations"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filters}>
          <div className={styles.filterLabel}>
            <FiFilter /> Filter
          </div>
          <div className={styles.filterChips}>
            {Object.entries(typeMeta).map(([key, meta]) => (
              <button
                key={key}
                className={`${styles.chip} ${typeFilter === key ? styles.chipActive : ''}`}
                onClick={() => setTypeFilter(key)}
              >
                {meta.icon}
                {meta.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.storiesSection}>
        <div className={styles.sectionHeader}>
          <h2>Stories</h2>
          <span className={styles.count}>{stories.length} results</span> 
        </div>
        
        {isLoading && (
            <div className={styles.emptyState} style={{ color: '#4299e1' }}>
              <p>Loading stories...</p>
            </div>
        )}

        {error && !isLoading && (
            <div className={styles.emptyState} style={{ color: '#c53030' }}>
              <p>Error: {error}</p>
              <p>Could not connect to the server or load data.</p>
            </div>
        )}

        {!isLoading && !error && stories.length === 0 && (
          <div className={styles.emptyState}>
            <p>No stories match your search. Try a different keyword or type.</p>
          </div>
        )}

        {!isLoading && !error && stories.length > 0 && (
          <div className={styles.cardsGrid}>
            {stories.map((story) => (
              <article key={story.id} className={styles.storyCard}>
                <div className={styles.cardHeader}>
                  {renderTypeBadge(story.type)}
                  <span className={styles.date}>
                    <FiClock /> {story.date}
                  </span>
                </div>
                <h3>{story.title}</h3>
                <p className={styles.summary}>{story.summary || 'No summary available.'}</p> 
                <div className={styles.meta}>
                  <span>
  <FiMapPin /> {PROVINCES_MAP[story.province] || story.province || 'Unknown location'}
</span>
                </div>
                <div className={styles.tags}>
                  {story.tags && story.tags.map((tag) => ( 
                    <span key={tag} className={styles.tag}>
                      #{tag}
                    </span>
                  ))}
                </div>
                <button
                  className={styles.viewBtn}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    background: 'linear-gradient(90deg,#2563eb 0%,#7c3aed 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 999,
                    boxShadow: '0 8px 24px rgba(37,99,235,0.18)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'transform 150ms ease, box-shadow 150ms ease, opacity 150ms ease',
                  }}
                  onClick={() => navigate(`/stories/${story.id}`)}
                  aria-label={`View details for ${story.title}`}
                >
                  <FiPlayCircle />
                  View Details
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default VisitorView;