import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Icon from '../components/Icons';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || 'Kamala Perera');
  const [phone, setPhone] = useState(user?.phone || '0771234567');

  const getInitials = (name) => {
    if (!name) return 'KP';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsEditing(false);
    alert('✓ Profile updated successfully!');
  };

  return (
    <div className="profile-page-container pb-4">
      {/* Title */}
      <h2 className="fw-bold mb-4" style={{ color: '#0F2F3D' }}>My Profile</h2>

      <div className="row g-4">
        {/* Left Column: User Profile Card */}
        <div className="col-12 col-lg-4">
          <div className="ui-card p-4 text-center shadow-sm h-100">
            {/* Avatar Circle with Initials */}
            <div
              className="rounded-circle text-white d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm"
              style={{
                width: '100px',
                height: '100px',
                backgroundColor: '#3E7B8E',
                fontSize: '2rem',
                fontWeight: 700
              }}
            >
              {getInitials(fullName)}
            </div>

            <h4 className="fw-bold text-dark mb-1">{fullName}</h4>
            <div className="text-muted small mb-3">{user?.role || 'Member'}</div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-teal px-4 py-2 w-100 mb-4 fw-semibold"
              style={{ backgroundColor: '#3E7B8E' }}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="text-start border-top pt-3">
                <div className="mb-3">
                  <label className="form-label small text-muted">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-success w-100 py-1 fw-semibold">
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="text-start border-top pt-3">
                <div className="d-flex align-items-center gap-3 py-2 text-dark small">
                  <span className="text-muted"><Icon name="mail" size={17} /></span>
                  <span>{user?.email || 'kamala@email.com'}</span>
                </div>

                <div className="d-flex align-items-center gap-3 py-2 text-dark small">
                  <span className="text-muted"><Icon name="phone" size={17} /></span>
                  <span>{phone}</span>
                </div>

                <div className="d-flex align-items-center gap-3 py-2 text-dark small">
                  <span className="text-muted"><Icon name="calendar" size={17} /></span>
                  <span>Member since Jan 15, 2024</span>
                </div>

                <div className="d-flex align-items-center gap-3 py-2 text-dark small">
                  <span className="text-muted"><Icon name="globe" size={17} /></span>
                  <span>Language: English</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Groups & Statistics */}
        <div className="col-12 col-lg-8">
          {/* My Groups Card */}
          <div className="ui-card p-4 shadow-sm mb-4">
            <h5 className="fw-bold text-dark mb-3">My Groups</h5>

            <div className="d-flex flex-column gap-3">
              {/* Group 1 */}
              <div className="p-3 border rounded-3 d-flex justify-content-between align-items-center bg-white">
                <div className="d-flex align-items-center gap-3">
                  <div className="text-dark opacity-75">
                    <Icon name="groups" size={24} color="#0F2F3D" />
                  </div>
                  <div>
                    <div className="fw-bold text-dark small">Village Women's Seettu</div>
                    <span className="badge-mint mt-1" style={{ fontSize: '0.7rem' }}>Active</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/groups/1')}
                  className="btn btn-link text-success text-decoration-none fw-semibold small p-0"
                >
                  View
                </button>
              </div>

              {/* Group 2 */}
              <div className="p-3 border rounded-3 d-flex justify-content-between align-items-center bg-white">
                <div className="d-flex align-items-center gap-3">
                  <div className="text-dark opacity-75">
                    <Icon name="groups" size={24} color="#0F2F3D" />
                  </div>
                  <div>
                    <div className="fw-bold text-dark small">Small Business Group</div>
                    <span className="badge bg-secondary-subtle text-secondary border mt-1" style={{ fontSize: '0.7rem' }}>Completed</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/groups/2')}
                  className="btn btn-link text-success text-decoration-none fw-semibold small p-0"
                >
                  View
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Card */}
          <div className="ui-card p-4 shadow-sm">
            <h5 className="fw-bold text-dark mb-3">Statistics</h5>

            <div className="row g-3">
              {/* Tile 1: Total Contributed */}
              <div className="col-6">
                <div className="p-3 rounded-3" style={{ backgroundColor: '#FDE8E8' }}>
                  <div className="small fw-semibold" style={{ color: '#9B1C1C', fontSize: '0.8rem' }}>
                    Total Contributed
                  </div>
                  <div className="fs-5 fw-bold mt-1" style={{ color: '#9B1C1C' }}>
                    24,000 LKR
                  </div>
                </div>
              </div>

              {/* Tile 2: Groups Participated */}
              <div className="col-6">
                <div className="p-3 rounded-3" style={{ backgroundColor: '#E1EFFE' }}>
                  <div className="small fw-semibold" style={{ color: '#1E429F', fontSize: '0.8rem' }}>
                    Groups Participated
                  </div>
                  <div className="fs-5 fw-bold mt-1" style={{ color: '#1E429F' }}>
                    2
                  </div>
                </div>
              </div>

              {/* Tile 3: Average Discipline Score */}
              <div className="col-6">
                <div className="p-3 rounded-3" style={{ backgroundColor: '#DEF7EC' }}>
                  <div className="small fw-semibold" style={{ color: '#03543F', fontSize: '0.8rem' }}>
                    Average Discipline Score
                  </div>
                  <div className="fs-5 fw-bold mt-1" style={{ color: '#03543F' }}>
                    85/100
                  </div>
                </div>
              </div>

              {/* Tile 4: Certificates Earned */}
              <div className="col-6">
                <div className="p-3 rounded-3" style={{ backgroundColor: '#FEF08A' }}>
                  <div className="small fw-semibold" style={{ color: '#723B13', fontSize: '0.8rem' }}>
                    Certificates Earned
                  </div>
                  <div className="fs-5 fw-bold mt-1" style={{ color: '#723B13' }}>
                    2
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
