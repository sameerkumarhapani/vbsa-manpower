import React from 'react';
import { X } from 'lucide-react';

const ProfileModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1200,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90%',
          maxWidth: '480px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #eef2f7' }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>My Profile</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }} aria-label="Close profile">
            <X />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ width: 64, height: 64, borderRadius: 12, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700 }}>
              {user.fullName ? user.fullName.charAt(0) : user.username?.charAt(0) || 'U'}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{user.fullName || user.username}</div>
              <div style={{ color: '#6b7280', fontSize: 13 }}>{user.email}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: 8, background: '#fafafc' }}>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Role</div>
              <div style={{ fontWeight: 600 }}>{user.role || '-'}</div>
            </div>
            <div style={{ padding: '12px', borderRadius: 8, background: '#fafafc' }}>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Username</div>
              <div style={{ fontWeight: 600 }}>{user.username || '-'}</div>
            </div>
            <div style={{ padding: '12px', borderRadius: 8, background: '#fafafc' }}>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Email</div>
              <div style={{ fontWeight: 600 }}>{user.email || '-'}</div>
            </div>
            <div style={{ padding: '12px', borderRadius: 8, background: '#fafafc' }}>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Mobile</div>
              <div style={{ fontWeight: 600 }}>{user.mobile ? `+91-${user.mobile}` : (user.phone || '-')}</div>
            </div>
          </div>

          <div style={{ marginTop: 18, color: '#6b7280', fontSize: 13 }}>
            This view shows your account information. Contact your administrator to change any details.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
