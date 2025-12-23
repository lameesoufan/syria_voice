import React, { useEffect } from 'react';
import useMyStories from '../hooks/useMyStories';
import { 
    FiEdit3, FiTrash2, FiEye, FiFileText, 
    FiMic, FiVideo, FiCheck, FiClock, FiX, FiAlertCircle 
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import styles from './MyStories.module.css'; // تأكدي من الاستيراد من الملف الجديد

const MyStories = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const { data: stories, loading, error, fetch, remove } = useMyStories();

    console.log('MyStories: Component rendered with:', { stories, loading, error });
    useEffect(() => {
        fetch();
    }, []);

    if (!user) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Access Denied</h2>
                <p>You must be logged in to view your stories.</p>
            </div>
        );
    }


    const handleDelete = async (id) => {
        try {
            await remove(id);
            toast.success('Story deleted');
        } catch (err) {
            toast.error(err.message || 'Delete failed');
        }
    };

    // دالة مساعدة لتحديد أيقونة ونمط النوع
    const getTypeStyle = (type) => {
        switch (type) {
            case 'TEXT': return { style: styles.typeText, icon: <FiFileText /> };
            case 'AUDIO': return { style: styles.typeAudio, icon: <FiMic /> };
            case 'VIDEO': return { style: styles.typeVideo, icon: <FiVideo /> };
            default: return { style: styles.typeText, icon: <FiFileText /> };
        }
    };

    // دالة مساعدة لتحديد نمط الحالة
    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED': return { style: styles.statusApproved, icon: <FiCheck /> };
            case 'PENDING': return { style: styles.statusPending, icon: <FiClock /> };
            case 'REJECTED': return { style: styles.statusRejected, icon: <FiX /> };
            case 'NEEDS_MODIFICATION': return { style: styles.statusNeedsModification || styles.statusPending, icon: <FiClock /> };
            default: return { style: styles.statusPending, icon: <FiClock /> };
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.title}>
                    <h2>My Stories</h2>
                    <span className={styles.stats}>Manage your contributions</span>
                </div>
                <div className={styles.stats}>
                    Total: {Array.isArray(stories) ? stories.length : 0}
                    {loading && <span> (Loading...)</span>}
                    {error && <span style={{color: 'red'}}> (Error: {error.message})</span>}
                    <button onClick={() => window.location.reload()} style={{marginLeft: '10px', padding: '2px 8px', fontSize: '12px', background: 'red', color: 'white', border: 'none', borderRadius: '3px'}}>Reload Page</button>
                    <button onClick={() => fetch()} style={{marginLeft: '5px', padding: '2px 8px', fontSize: '12px'}}>Retry</button>
                </div>
            </div>

            {/* Table */}
            <div className={styles.tableWrapper}>
                {loading ? (
                    <div style={{textAlign: 'center', padding: '20px'}}>
                        <p>Loading your stories...</p>
                    </div>
                ) : error ? (
                    <div style={{textAlign: 'center', padding: '20px', color: 'red'}}>
                        <p>Error loading stories: {error.message}</p>
                        <button onClick={() => fetch()}>Retry</button>
                    </div>
                ) : !Array.isArray(stories) || stories.length === 0 ? (
                    <div style={{textAlign: 'center', padding: '20px'}}>
                        <p>No stories found. Create your first story!</p>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Story Title</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Admin Message</th>
                                <th>Date</th>
                                <th style={{textAlign: 'right'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stories.map(story => {
                                const typeMeta = getTypeStyle(story.type);
                                const statusMeta = getStatusStyle(story.status);
                                
                                return (
                                    <tr key={story.id}>
                                        <td>
                                            <div className={styles.storyTitle}>{story.title}</div>
                                        </td>
                                        
                                        <td>
                                            <span className={`${styles.typeBadge} ${typeMeta.style}`}>
                                                {typeMeta.icon} {story.type}
                                            </span>
                                        </td>

                                        <td>
                                            <div className={`${styles.statusBadge} ${statusMeta.style}`}>
                                                {statusMeta.icon}
                                                <span>{story.status}</span>
                                            </div>
                                        </td>

                                        <td>
                                            {story.adminMessage ? (
                                                <div className={styles.adminMessageCell}>
                                                    <FiAlertCircle className={styles.messageIcon} />
                                                    <span className={styles.messageText}>{story.adminMessage}</span>
                                                </div>
                                            ) : (
                                                <span className={styles.noMessage}>—</span>
                                            )}
                                        </td>

                                        <td className={styles.storyDate}>
                                            {story.publishDate ? new Date(story.publishDate).toLocaleDateString()
                                              : story.updatedAt ? new Date(story.updatedAt).toLocaleDateString()
                                              : '—'}
                                        </td>

                                        <td>
                                            <div className={styles.actions} style={{justifyContent: 'flex-end'}}>
                                                <button className={`${styles.actionBtn} ${styles.btnView}`} title="View Details">
                                                    <FiEye />
                                                </button>
                                                <button className={`${styles.actionBtn} ${styles.btnEdit}`} title="Edit Story">
                                                    <FiEdit3 />
                                                </button>
                                                <button className={`${styles.actionBtn} ${styles.btnDelete}`} title="Delete">
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default MyStories;