import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Icon from '../components/Icons';
import { getUserProfileStats, updateUserProfile } from '../api/userApi';
import { getErrorMessage } from '../utils/errorHandler';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await getUserProfileStats(user.id);
      const data = res?.data || res || {};
      setProfileData(data);
      if (data.user) {
        setFullName(data.user.fullName || '');
        setPhone(data.user.phone || '');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setErrorMsg(getErrorMessage(err, 'Failed to fetch profile details from database.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      fetchProfile();
    }
  }, [user]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const formatJoinDate = (dateStr) => {
    if (!dateStr) return 'Member since 2024';
    try {
      const d = new Date(dateStr);
      return `Member since ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } catch {
      return `Member since ${dateStr.split('T')[0]}`;
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Please enter your full name.');
      return;
    }

    setSaving(true);
    setActionMsg('');
    setErrorMsg('');

    try {
      await updateUserProfile(user.id, {
        fullName: fullName.trim(),
        phone: phone.trim()
      });

      if (updateUser) {
        updateUser({
          fullName: fullName.trim(),
          phone: phone.trim()
        });
      }

      setActionMsg('✓ Profile updated successfully in database!');
      setIsEditing(false);
      await fetchProfile();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Failed to update profile.'));
    } finally {
      setSaving(false);
    }
  };

  const groups = profileData?.groups || [];
  const totalContributed = Number(profileData?.totalContributed || 0);
  const groupsParticipated = profileData?.groupsParticipated ?? groups.length;
  const averageDisciplineScore = profileData?.averageDisciplineScore ?? 85;
  const certificatesEarned = profileData?.certificatesEarned ?? 0;
  const userInfo = profileData?.user || user;

  return (
    <div className="profile-page-container pb-4">
      {/* Title */}
      <h2 className="fw-bold mb-4" style={{ color: '#0F2F3D' }}>My Profile</h2>

      {actionMsg && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
          <Icon name="check" size={18} />
          <div>{actionMsg}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setActionMsg('')} aria-label="Close"></button>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
          <Icon name="alert-circle" size={18} />
          <div>{errorMsg}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setErrorMsg('')} aria-label="Close"></button>
        </div>
      )}

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
              {getInitials(fullName || userInfo?.fullName)}
            </div>

            <h4 className="fw-bold text-dark mb-1">{fullName || userInfo?.fullName || 'User'}</h4>
            <div className="text-muted small mb-3 text-uppercase">{userInfo?.role || 'MEMBER'}</div>

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
                <button type="submit" className="btn btn-teal w-100 py-2 fw-semibold" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            ) : (
              <div className="text-start border-top pt-3">
                <div className="d-flex align-items-center gap-3 py-2 text-dark small">
                  <span className="text-muted"><Icon name="mail" size={17} /></span>
                  <span className="text-truncate">{userInfo?.email || '-'}</span>
                </div>

                <div className="d-flex align-items-center gap-3 py-2 text-dark small">
                  <span className="text-muted"><Icon name="phone" size={17} /></span>
                  <span>{phone || userInfo?.phone || 'Not provided'}</span>
                </div>

                <div className="d-flex align-items-center gap-3 py-2 text-dark small">
                  <span className="text-muted"><Icon name="calendar" size={17} /></span>
                  <span>{formatJoinDate(userInfo?.createdAt)}</span>
                </div>

                <div className="d-flex align-items-center gap-3 py-2 text-dark small">
                  <span className="text-muted"><Icon name="globe" size={17} /></span>
                  <span>Language: {userInfo?.preferredLanguage === 'SI' ? 'Sinhala' : userInfo?.preferredLanguage === 'TA' ? 'Tamil' : 'English'}</span>
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

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-teal" role="status" style={{ color: '#1A5265' }}></div>
                <span className="ms-2 text-muted small">Loading groups...</span>
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                <Icon name="groups" size={32} color="#94A3B8" className="mb-2" />
                <div>You are not enrolled in any Seettu groups yet.</div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {groups.map((g) => {
                  const isActive = g.status === 'ACTIVE' || !g.status;
                  return (
                    <div key={g.id} className="p-3 border rounded-3 d-flex justify-content-between align-items-center bg-white">
                      <div className="d-flex align-items-center gap-3">
                        <div className="text-dark opacity-75">
                          <Icon name="groups" size={24} color="#0F2F3D" />
                        </div>
                        <div>
                          <div className="fw-bold text-dark small">{g.name}</div>
                          <span
                            className={isActive ? 'badge-mint mt-1' : 'badge bg-secondary-subtle text-secondary border mt-1'}
                            style={{ fontSize: '0.7rem' }}
                          >
                            {isActive ? 'Active' : g.status}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/groups/${g.id}`)}
                        className="btn btn-link text-success text-decoration-none fw-semibold small p-0"
                      >
                        View
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
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
                    {totalContributed.toLocaleString()} LKR
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
                    {groupsParticipated}
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
                    {averageDisciplineScore}/100
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
                    {certificatesEarned}
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
