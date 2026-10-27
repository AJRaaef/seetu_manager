import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import Icon from '../components/Icons';
import { getUserProfileStats, updateUserProfile, uploadProfilePicture, deleteProfilePicture } from '../api/userApi';
import { changePassword } from '../api/authApi';
import { getErrorMessage } from '../utils/errorHandler';
import OrganizerApplicationModal from '../components/OrganizerApplicationModal';

const Profile = () => {
  const { t } = useTranslation();
  const { user, updateUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [showOrgModal, setShowOrgModal] = useState(false);
  const [orgSuccess, setOrgSuccess] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [uploadingPic, setUploadingPic] = useState(false);
  const [failedProfilePictureUrl, setFailedProfilePictureUrl] = useState('');
  const fileInputRef = useRef(null);

  const currentUserId = user?.id || user?.userId;

  // Change Password state (for all 3 roles: Admin, Organizer, Member)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!passwordForm.currentPassword) {
      setPassError('Please enter your current password.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPassError('New password and confirm password do not match.');
      return;
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPassError('New password cannot be the same as your current password.');
      return;
    }

    setPassLoading(true);
    try {
      await changePassword(currentUserId, passwordForm.currentPassword, passwordForm.newPassword);
      setPassSuccess('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Password change failed:', err);
      setPassError(getErrorMessage(err, 'Failed to change password. Please verify your current password.'));
    } finally {
      setPassLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await getUserProfileStats(currentUserId);
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
    if (currentUserId) {
      setFullName(user?.fullName || '');
      setPhone(user?.phone || '');
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [currentUserId]);

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
      await updateUserProfile(currentUserId, {
        fullName: fullName.trim(),
        phone: phone.trim()
      });

      if (updateUser) {
        updateUser({
          fullName: fullName.trim(),
          phone: phone.trim()
        });
      }

      setActionMsg('Profile updated successfully!');
      setIsEditing(false);
      await fetchProfile();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Failed to update profile.'));
    } finally {
      setSaving(false);
    }
  };

  const handlePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    // Validate file size: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Profile picture must be smaller than 5MB.');
      return;
    }

    try {
      setUploadingPic(true);
      setErrorMsg('');
      const res = await uploadProfilePicture(currentUserId, file);
      const updatedUser = res?.data || res;
      const newPicUrl = updatedUser?.profilePictureUrl;

      if (updateUser) {
        updateUser({ profilePictureUrl: newPicUrl });
      }

      setProfileData((prev) => prev ? {
        ...prev,
        user: { ...prev.user, profilePictureUrl: newPicUrl }
      } : prev);

      setActionMsg('Profile picture updated successfully!');
      await fetchProfile();
    } catch (err) {
      console.error('Failed to upload profile picture:', err);
      setErrorMsg(getErrorMessage(err, 'Failed to upload profile picture.'));
    } finally {
      setUploadingPic(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePicture = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    try {
      setUploadingPic(true);
      setErrorMsg('');
      await deleteProfilePicture(currentUserId);

      if (updateUser) {
        updateUser({ profilePictureUrl: null });
      }

      setProfileData((prev) => prev ? {
        ...prev,
        user: { ...prev.user, profilePictureUrl: null }
      } : prev);

      setActionMsg('Profile picture removed successfully.');
      await fetchProfile();
    } catch (err) {
      console.error('Failed to remove profile picture:', err);
      setErrorMsg(getErrorMessage(err, 'Failed to remove profile picture.'));
    } finally {
      setUploadingPic(false);
    }
  };

  const groups = profileData?.groups || [];
  const totalContributed = Number(profileData?.totalContributed || 0);
  const groupsParticipated = profileData?.groupsParticipated ?? groups.length;
  const averageDisciplineScore = profileData?.averageDisciplineScore ?? 100;
  const certificatesEarned = profileData?.certificatesEarned ?? 0;
  const userInfo = profileData?.user || user;
  const profilePictureUrl = userInfo?.profilePictureUrl || user?.profilePictureUrl;

  return (
    <div className="profile-page-container pb-4">
      {/* Title */}
      <h2 className="fw-bold mb-4" style={{ color: '#0F2F3D' }}>{t('profile_page.title', 'Profile Settings')}</h2>

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
        <div className="col-12 col-lg-4 d-flex flex-column gap-4">
          <div className="ui-card p-4 text-center shadow-sm">
            {/* Avatar Circle with Initials or Profile Picture + Camera Upload Badge */}
            <div className="position-relative d-inline-block mx-auto mb-3">
              <div
                className="rounded-circle text-white d-flex align-items-center justify-content-center overflow-hidden position-relative shadow-sm"
                style={{
                  width: '104px',
                  height: '104px',
                  backgroundColor: '#3E7B8E',
                  fontSize: '2rem',
                  fontWeight: 700,
                  border: '3px solid #E2E8F0'
                }}
              >
                {profilePictureUrl && failedProfilePictureUrl !== profilePictureUrl ? (
                  <img
                    src={`http://localhost:8081${profilePictureUrl}`}
                    alt={fullName || userInfo?.fullName || 'User'}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover', display: 'block' }}
                    onError={() => setFailedProfilePictureUrl(profilePictureUrl)}
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center w-100 h-100">
                    {getInitials(fullName || userInfo?.fullName)}
                  </div>
                )}

                {uploadingPic && (
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{ backgroundColor: 'rgba(15, 47, 61, 0.72)', zIndex: 3 }}
                  >
                    <div className="spinner-border spinner-border-sm text-white" role="status"></div>
                  </div>
                )}
              </div>

              {/* Camera Icon Overlay Trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPic}
                className="btn btn-sm position-absolute bottom-0 end-0 rounded-circle p-0 d-flex align-items-center justify-content-center shadow"
                style={{
                  width: '34px',
                  height: '34px',
                  backgroundColor: '#0097B2',
                  color: '#ffffff',
                  border: '2px solid #ffffff',
                  cursor: 'pointer',
                  zIndex: 4,
                  transition: 'all 0.2s ease'
                }}
                title="Change Profile Picture"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.backgroundColor = '#007A90';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.backgroundColor = '#0097B2';
                }}
              >
                <Icon name="camera" size={16} color="#ffffff" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handlePictureChange}
              />
            </div>

            {/* Quick Remove Photo Option if Photo is Set */}
            {(userInfo?.profilePictureUrl || user?.profilePictureUrl) && !uploadingPic && (
              <div className="mb-2">
                <button
                  type="button"
                  onClick={handleDeletePicture}
                  className="btn btn-link btn-sm text-danger text-decoration-none p-0 d-inline-flex align-items-center gap-1"
                  style={{ fontSize: '0.78rem' }}
                >
                  <Icon name="trash" size={12} color="#DC2626" />
                  <span>{t('profile_page.remove_photo')}</span>
                </button>
              </div>
            )}

            <h4 className="fw-bold text-dark mb-1">{fullName || userInfo?.fullName || 'User'}</h4>
            <div className="text-muted small mb-3 text-uppercase">{userInfo?.role || 'MEMBER'}</div>

            {/* Become an Organizer / Pending Badge (MEMBER only, VERIFIED) */}
            {user?.role === 'MEMBER' && user?.kycStatus === 'VERIFIED' && (
              <div className="mb-3">
                {user?.requestedRole === 'ORGANIZER' ? (
                  <div
                    className="d-flex align-items-center justify-content-center gap-2 py-2 px-3 rounded-3"
                    style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', fontSize: '0.82rem' }}
                  >
                    ⏳ <span className="fw-semibold">Organizer Application Pending Admin Review</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #0F2F3D, #0097B2)', color: '#fff', borderRadius: '10px' }}
                    onClick={() => setShowOrgModal(true)}
                  >
                    <Icon name="award" size={16} color="#fff" />
                    Become an Organizer
                  </button>
                )}
              </div>
            )}

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-teal px-4 py-2 w-100 mb-4 fw-semibold"
              style={{ backgroundColor: '#3E7B8E' }}
            >
              {isEditing ? t('common.cancel') : t('common.edit')}
            </button>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="text-start border-top pt-3">
                {/* Photo Change Controls inside Edit Form */}
                <div className="mb-3 p-2 rounded-2" style={{ backgroundColor: '#F8FAFC', border: '1px dashed #CBD5E1' }}>
                  <label className="form-label small text-muted d-block mb-1 fw-semibold">{t('profile_page.upload_photo')}</label>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPic}
                      className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5"
                      style={{ fontSize: '0.8rem' }}
                    >
                      <Icon name="upload" size={13} />
                      <span>{(userInfo?.profilePictureUrl || user?.profilePictureUrl) ? t('profile_page.upload_photo') : t('profile_page.upload_photo')}</span>
                    </button>
                    {(userInfo?.profilePictureUrl || user?.profilePictureUrl) && (
                      <button
                        type="button"
                        onClick={handleDeletePicture}
                        disabled={uploadingPic}
                        className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1.5"
                        style={{ fontSize: '0.8rem' }}
                      >
                        <Icon name="trash" size={13} />
                        <span>{t('common.delete')}</span>
                      </button>
                    )}
                  </div>
                  <div className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                    Supported: JPG, PNG, WEBP (Max 5MB)
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small text-muted">{t('profile_page.full_name')}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted">{t('profile_page.phone')}</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-teal w-100 py-2 fw-semibold" disabled={saving || uploadingPic}>
                  {saving ? t('profile_page.saving') : t('profile_page.save_changes')}
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
            <h5 className="fw-bold text-dark mb-3">
              {isAdmin ? 'System Group Oversight' : 'My Groups'}
            </h5>

            {isAdmin ? (
              <div className="text-center py-4 text-muted small">
                <Icon name="shield" size={32} color="#235665" className="mb-2 d-block mx-auto" />
                <div className="fw-semibold text-dark mb-1">Platform Administrative Role</div>
                <div style={{ maxWidth: '520px', margin: '0 auto' }}>
                  As a System Administrator, you manage platform-wide groups, oversee member transactions, and resolve disputes instead of participating in personal contribution circles.
                </div>
              </div>
            ) : loading ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-teal" role="status" style={{ color: '#1A5265' }}></div>
                <span className="ms-2 text-muted small">Loading groups...</span>
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                <div>You are not enrolled in any Seettu groups yet.</div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {groups.map((g) => {
                  const isActive = g.status === 'ACTIVE' || !g.status;
                  return (
                    <div key={g.id} className="p-3 border rounded-3 d-flex justify-content-between align-items-center bg-white">
                      <div className="d-flex align-items-center gap-3">
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
            <h5 className="fw-bold text-dark mb-3">
              {isAdmin ? 'Administrative Overview' : 'Statistics'}
            </h5>

            {isAdmin ? (
              <div>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-3 rounded-3" style={{ backgroundColor: '#EFF6FF' }}>
                      <div className="small fw-semibold" style={{ color: '#1E429F', fontSize: '0.8rem' }}>
                        System Role
                      </div>
                      <div className="fs-6 fw-bold mt-1 text-truncate" style={{ color: '#1E429F' }}>
                        Platform Administrator
                      </div>
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="p-3 rounded-3" style={{ backgroundColor: '#DEF7EC' }}>
                      <div className="small fw-semibold" style={{ color: '#03543F', fontSize: '0.8rem' }}>
                        Arbitration Standing
                      </div>
                      <div className="fs-6 fw-bold mt-1" style={{ color: '#03543F' }}>
                        Chief Arbitrator
                      </div>
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="p-3 rounded-3" style={{ backgroundColor: '#F3F4F6' }}>
                      <div className="small fw-semibold" style={{ color: '#4B5563', fontSize: '0.8rem' }}>
                        Discipline Rating
                      </div>
                      <div className="fs-6 fw-bold mt-1" style={{ color: '#4B5563' }}>
                        N/A (Platform Oversight)
                      </div>
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="p-3 rounded-3" style={{ backgroundColor: '#FEF08A' }}>
                      <div className="small fw-semibold" style={{ color: '#723B13', fontSize: '0.8rem' }}>
                        Privilege Scope
                      </div>
                      <div className="fs-6 fw-bold mt-1" style={{ color: '#723B13' }}>
                        Full System Governance
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-light rounded-3 border d-flex align-items-center gap-2">
                  <Icon name="shield" size={18} color="#235665" className="flex-shrink-0" />
                  <div className="small text-muted" style={{ fontSize: '0.8rem' }}>
                    As Platform Administrator, you govern dispute settlements, monitor financial audits, and enforce platform regulations. You do not participate in contribution draws or hold personal discipline ratings.
                  </div>
                </div>
              </div>
            ) : (
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
            )}

            {/* Security & Password Change Card (Accessible to All Roles: Admin, Organizer, Member) */}
            <div className="ui-card p-4 shadow-sm border-0 mt-4 bg-white rounded-3">
              <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle p-2 d-flex align-items-center justify-content-center bg-teal-subtle text-teal" style={{ width: '38px', height: '38px' }}>
                    <Icon name="lock" size={18} color="#0097B2" />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.05rem' }}>Security & Change Password</h5>
                    <small className="text-muted">Update your login password to safeguard your account and Seettu funds</small>
                  </div>
                </div>
                <span className="badge bg-light text-secondary border px-2.5 py-1 small fw-semibold">
                  All Roles Protected
                </span>
              </div>

              {passSuccess && (
                <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 mb-3 small rounded-3 border-0">
                  <Icon name="check-circle" size={16} color="#059669" />
                  <span className="fw-semibold">{passSuccess}</span>
                </div>
              )}

              {passError && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3 small rounded-3 border-0">
                  <Icon name="alert-circle" size={16} color="#DC2626" />
                  <span>{passError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordChange}>
                <div className="row g-3">
                  {/* Current Password */}
                  <div className="col-12 col-md-4">
                    <label className="form-label text-secondary fw-medium small mb-1">
                      Current Password <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Current password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        title={showCurrentPass ? "Hide password" : "Show password"}
                      >
                        <Icon name={showCurrentPass ? 'eye-off' : 'eye'} size={15} />
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="col-12 col-md-4">
                    <label className="form-label text-secondary fw-medium small mb-1">
                      New Password <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Min. 6 characters"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowNewPass(!showNewPass)}
                        title={showNewPass ? "Hide password" : "Show password"}
                      >
                        <Icon name={showNewPass ? 'eye-off' : 'eye'} size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="col-12 col-md-4">
                    <label className="form-label text-secondary fw-medium small mb-1">
                      Confirm New Password <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Re-type new password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        title={showConfirmPass ? "Hide password" : "Show password"}
                      >
                        <Icon name={showConfirmPass ? 'eye-off' : 'eye'} size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-3">
                  <button
                    type="submit"
                    className="btn btn-teal px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
                    disabled={passLoading}
                  >
                    {passLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="check" size={16} />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Organizer Application Modal */}
      <OrganizerApplicationModal
        show={showOrgModal}
        onClose={() => setShowOrgModal(false)}
        onSuccess={() => {
          setOrgSuccess(true);
          setActionMsg('Your organizer application has been submitted. Admin will review shortly.');
          setTimeout(() => setOrgSuccess(false), 4000);
        }}
      />
    </div>
  );
};

export default Profile;
