// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import {
  FiHome, FiFileText, FiPlusCircle, FiSearch,
  FiSettings, FiBell, FiLogOut, FiActivity,
  FiUser, FiMail, FiPhone, FiGlobe, FiMapPin,
  FiUploadCloud, FiTrash2, FiCheckCircle, FiClock, FiEdit
} from 'react-icons/fi';
import { toast } from 'react-toastify';

// استيراد الخدمات والكونات
import { logoutUser, uploadAvatar } from '../api/authService';
import { submitNewStory } from '../api/storyService';
import CreateStory from './CreateStory'; 
import MyStories from './MyStories'; // تأكدي أن اسم الملف مطابق

const DEFAULT_AVATAR = '/placeholder-avatar.svg'; 

const Dashboard = ({ onLogout }) => {
  // --- States (التعريفات الأساسية) ---
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [profile, setProfile] = useState({
    name: 'Publisher Account',
    email: 'publisher@example.com',
    phone: '+963 9XX XXX XXX',
    organization: 'Voices Of Syria',
    website: 'https://example.com',
    location: 'Damascus, Syria',
    bio: 'Short bio about the publisher goes here.',
    avatarUrl: DEFAULT_AVATAR,
  });

  // --- Logic Functions ---

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatarUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let currentUrl = profile.avatarUrl;
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        toast.info("Uploading avatar...");
        currentUrl = await uploadAvatar(formData);
      }
      // ملاحظة: هنا يمكن إضافة دالة تحديث بيانات الملف الشخصي مستقبلاً
      setProfile(prev => ({ ...prev, avatarUrl: currentUrl }));
      toast.success('Profile updated!');
      setAvatarFile(null);
    } catch (error) {
      toast.error(error.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoutClick = () => {
    logoutUser();
    if (onLogout) onLogout();
    toast.info("Logged out successfully");
  };

  // --- UI Render ---
  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}><FiActivity /></div>
          <span>Publisher Panel</span>
        </div>
        <nav className={styles.navMenu}>
          <button 
            className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
           <FiHome /> 
  <span>Overview</span>
          </button>
  <button 
  className={`${styles.navItem} ${activeTab === 'my-stories' ? styles.active : ''}`}
  onClick={() => setActiveTab('my-stories')}
>
  <FiFileText /> My Stories
</button>
          <button 
            className={`${styles.navItem} ${activeTab === 'new-story' ? styles.active : ''}`}
            onClick={() => setActiveTab('new-story')}
          >
            <FiPlusCircle /> New Story
          </button>
          <div className={styles.navDivider} />
          <button 
            className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FiSettings /> Settings
          </button>
        </nav>
        <button className={styles.logoutBtn} onClick={handleLogoutClick}>
          <FiLogOut /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.topHeader}>
          <div className={styles.searchBar}>
            <FiSearch />
            <input type="text" placeholder="Search your stories..." />
          </div>
          <div className={styles.userProfileSummary}>
            <FiBell className={styles.notifIcon} />
            <div className={styles.userInfo}>
              <p className={styles.userName}>{profile.name}</p>
              <p className={styles.userRole}>Publisher</p>
            </div>
            <img src={profile.avatarUrl} alt="Avatar" className={styles.topAvatar} />
          </div>
        </header>

        {/* Dynamic Tabs */}
        {activeTab === 'overview' && (
          <div className={styles.tabContent}>
            <div className={styles.overviewHeader}>
              <div>
                <h1 className={styles.welcomeTitle}>Welcome back, {profile.name.split(' ')[0]}!</h1>
                <p className={styles.welcomeSubtitle}>Here's what's happening with your stories today</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <FiFileText />
                </div>
                <div className={styles.statContent}>
                  <h3 className={styles.statValue}>12</h3>
                  <p className={styles.statLabel}>Total Stories</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <FiCheckCircle />
                </div>
                <div className={styles.statContent}>
                  <h3 className={styles.statValue}>8</h3>
                  <p className={styles.statLabel}>Approved</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                  <FiClock />
                </div>
                <div className={styles.statContent}>
                  <h3 className={styles.statValue}>3</h3>
                  <p className={styles.statLabel}>Pending Review</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                  <FiActivity />
                </div>
                <div className={styles.statContent}>
                  <h3 className={styles.statValue}>1</h3>
                  <p className={styles.statLabel}>Needs Modification</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
              <h2 className={styles.sectionTitle}>Quick Actions</h2>
              <div className={styles.actionsGrid}>
                <button 
                  className={styles.actionCard}
                  onClick={() => setActiveTab('new-story')}
                >
                  <div className={styles.actionIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <FiPlusCircle />
                  </div>
                  <h3>Create New Story</h3>
                  <p>Share your story with the community</p>
                </button>
                <button 
                  className={styles.actionCard}
                  onClick={() => setActiveTab('my-stories')}
                >
                  <div className={styles.actionIcon} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                    <FiFileText />
                  </div>
                  <h3>Manage Stories</h3>
                  <p>View and edit your submissions</p>
                </button>
                <button 
                  className={styles.actionCard}
                  onClick={() => setActiveTab('settings')}
                >
                  <div className={styles.actionIcon} style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                    <FiSettings />
                  </div>
                  <h3>Profile Settings</h3>
                  <p>Update your account information</p>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className={styles.recentActivity}>
              <h2 className={styles.sectionTitle}>Recent Activity</h2>
              <div className={styles.activityList}>
                <div className={styles.activityItem}>
                  <div className={styles.activityIcon} style={{ background: '#dcfce7', color: '#15803d' }}>
                    <FiCheckCircle />
                  </div>
                  <div className={styles.activityContent}>
                    <p className={styles.activityTitle}>Story "Memory of Aleppo" was approved</p>
                    <p className={styles.activityTime}>2 hours ago</p>
                  </div>
                </div>
                <div className={styles.activityItem}>
                  <div className={styles.activityIcon} style={{ background: '#fef3c7', color: '#92400e' }}>
                    <FiClock />
                  </div>
                  <div className={styles.activityContent}>
                    <p className={styles.activityTitle}>Story "Damascus Road" is pending review</p>
                    <p className={styles.activityTime}>1 day ago</p>
                  </div>
                </div>
                <div className={styles.activityItem}>
                  <div className={styles.activityIcon} style={{ background: '#fee2e2', color: '#b91c1c' }}>
                    <FiEdit />
                  </div>
                  <div className={styles.activityContent}>
                    <p className={styles.activityTitle}>Modification requested for "Homs Memories"</p>
                    <p className={styles.activityTime}>3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'new-story' && (
          <CreateStory onBack={() => setActiveTab('overview')} />
        )}
{/* ⬅️ أضيفي السطر هنا ⬇️ */}
{activeTab === 'my-stories' && (
  <MyStories />
)}

        {activeTab === 'settings' && (
          <div className={styles.settingsContainer}>
            <div className={styles.settingsHeader}>
              <h2>Profile Settings</h2>
              <p>Manage your account information and preferences</p>
            </div>

            <form onSubmit={handleSaveProfile} className={styles.settingsForm}>
              {/* Avatar Section */}
              <div className={styles.settingsSection}>
                <h3 className={styles.sectionTitle}>Profile Picture</h3>
                <div className={styles.avatarSection}>
                  <div className={styles.avatarWrapper}>
                    <div 
                      className={styles.avatarPreview} 
                      style={{ backgroundImage: `url(${profile.avatarUrl})` }}
                    />
                    <div className={styles.avatarOverlay}>
                      <FiUploadCloud />
                    </div>
                  </div>
                  <div className={styles.avatarInfo}>
                    <label className={styles.uploadButton}>
                      <FiUploadCloud /> Change Photo
                      <input type="file" hidden onChange={handleAvatarChange} accept="image/*" />
                    </label>
                    <p className={styles.helpText}>JPG, PNG or GIF. Max size 2MB</p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className={styles.settingsSection}>
                <h3 className={styles.sectionTitle}>Personal Information</h3>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label><FiUser /> Full Name</label>
                    <input 
                      type="text" 
                      value={profile.name} 
                      onChange={(e) => handleProfileChange('name', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label><FiMail /> Email Address</label>
                    <input 
                      type="email" 
                      value={profile.email} 
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label><FiPhone /> Phone Number</label>
                    <input 
                      type="tel" 
                      value={profile.phone} 
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      placeholder="+963 9XX XXX XXX"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label><FiMapPin /> Location</label>
                    <input 
                      type="text" 
                      value={profile.location} 
                      onChange={(e) => handleProfileChange('location', e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </div>

              {/* Organization Details */}
              <div className={styles.settingsSection}>
                <h3 className={styles.sectionTitle}>Organization Details</h3>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label><FiUser /> Organization Name</label>
                    <input 
                      type="text" 
                      value={profile.organization} 
                      onChange={(e) => handleProfileChange('organization', e.target.value)}
                      placeholder="Your organization name"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label><FiGlobe /> Website</label>
                    <input 
                      type="url" 
                      value={profile.website} 
                      onChange={(e) => handleProfileChange('website', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div className={styles.settingsSection}>
                <h3 className={styles.sectionTitle}>Bio</h3>
                <div className={styles.inputGroup}>
                  <label>About You</label>
                  <textarea 
                    value={profile.bio} 
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className={styles.formActions}>
                <button type="button" className={styles.secondaryButton} onClick={() => setActiveTab('overview')}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryButton} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;