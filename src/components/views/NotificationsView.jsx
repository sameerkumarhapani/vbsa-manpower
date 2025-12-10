import React, { useState, useMemo } from 'react';
import { Bell, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react';

const NotificationsView = () => {
  // Dummy notifications data for self-attendance reminders
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'attendance-reminder',
      title: 'Self Attendance Reminder - Session 1',
      message: 'Please complete your self-attendance before 8:30 AM for Session-1 of the exam',
      venue: 'Mumbai University Exam Centre',
      sessionTime: '8:30 AM - 11:30 AM',
      sessionNumber: 'Session-1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      priority: 'high',
    },
    {
      id: 2,
      type: 'attendance-reminder',
      title: 'Self Attendance Reminder - Session 2',
      message: 'Please complete your self-attendance before 1:00 PM for Session-2 of the exam',
      venue: 'Mumbai University Exam Centre',
      sessionTime: '1:00 PM - 4:00 PM',
      sessionNumber: 'Session-2',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      read: false,
      priority: 'high',
    },
    {
      id: 3,
      type: 'attendance-reminder',
      title: 'Self Attendance Reminder - Session 3',
      message: 'Please complete your self-attendance before 4:30 PM for Session-3 of the exam',
      venue: 'Mumbai University Exam Centre',
      sessionTime: '4:30 PM - 7:30 PM',
      sessionNumber: 'Session-3',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: true,
      priority: 'medium',
    },
    {
      id: 4,
      type: 'general',
      title: 'Device Check-in Reminder',
      message: 'Please ensure all devices are checked in at the end of your shift',
      venue: 'Mumbai University Exam Centre',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      priority: 'low',
    },
    {
      id: 5,
      type: 'attendance-reminder',
      title: 'Attendance Verification Pending',
      message: 'Your attendance for yesterday has not been verified. Please contact the venue manager.',
      venue: 'Mumbai University Exam Centre',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
      read: true,
      priority: 'medium',
    },
  ]);

  const [filterType, setFilterType] = useState('all'); // 'all', 'unread', 'read'

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    if (filterType === 'unread') {
      return notifications.filter(n => !n.read);
    }
    if (filterType === 'read') {
      return notifications.filter(n => n.read);
    }
    return notifications;
  }, [notifications, filterType]);

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Delete notification
  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Delete all
  const deleteAll = () => {
    if (window.confirm('Delete all notifications?')) {
      setNotifications([]);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' };
      case 'medium':
        return { bg: '#fef3c7', text: '#f59e0b', border: '#fcd34d' };
      case 'low':
        return { bg: '#dbeafe', text: '#0284c7', border: '#7dd3fc' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' };
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'attendance-reminder':
        return <Clock size={20} />;
      case 'general':
        return <Bell size={20} />;
      default:
        return <AlertCircle size={20} />;
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">Manage your notifications and reminders</p>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">
            All Notifications {unreadCount > 0 && <span style={{ fontSize: '12px', color: '#dc2626', marginLeft: '8px' }}>({unreadCount} unread)</span>}
          </h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  padding: '10px 16px',
                  border: '1px solid #e5e7eb',
                  background: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                }}
              >
                <CheckCircle size={16} style={{ marginRight: '6px', display: 'inline' }} />
                Mark All as Read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={deleteAll}
                style={{
                  padding: '10px 16px',
                  border: '1px solid #fca5a5',
                  background: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#dc2626',
                }}
              >
                <Trash2 size={16} style={{ marginRight: '6px', display: 'inline' }} />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
          <button
            onClick={() => setFilterType('all')}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: filterType === 'all' ? 'var(--color-primary)' : 'transparent',
              color: filterType === 'all' ? 'white' : '#6b7280',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilterType('unread')}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: filterType === 'unread' ? 'var(--color-primary)' : 'transparent',
              color: filterType === 'unread' ? 'white' : '#6b7280',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilterType('read')}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: filterType === 'read' ? 'var(--color-primary)' : 'transparent',
              color: filterType === 'read' ? 'white' : '#6b7280',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Read ({notifications.filter(n => n.read).length})
          </button>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}
          >
            <Bell size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} />
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0' }}>
              {filterType === 'unread' ? 'No unread notifications' : filterType === 'read' ? 'No read notifications' : 'No notifications'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredNotifications.map(notification => {
              const priorityColor = getPriorityColor(notification.priority);
              return (
                <div
                  key={notification.id}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: `1px solid ${notification.read ? '#e5e7eb' : '#bfdbfe'}`,
                    background: notification.read ? '#f9fafb' : '#eff6ff',
                    cursor: notification.read ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    if (!notification.read) {
                      e.currentTarget.style.background = '#dbeafe';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!notification.read) {
                      e.currentTarget.style.background = '#eff6ff';
                    }
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    {/* Icon */}
                    <div
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        background: priorityColor.bg,
                        color: priorityColor.text,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {getIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }} />
                        )}
                      </div>

                      <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#6b7280', lineHeight: '1.4' }}>
                        {notification.message}
                      </p>

                      {notification.venue && (
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                          <strong>Venue:</strong> {notification.venue}
                          {notification.sessionTime && ` | ${notification.sessionTime}`}
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>{formatTime(notification.timestamp)}</span>
                        <div
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: priorityColor.bg,
                            color: priorityColor.text,
                            border: `1px solid ${priorityColor.border}`,
                          }}
                        >
                          {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}
                        </div>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#d1d5db',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.color = '#dc2626';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = '#d1d5db';
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsView;
