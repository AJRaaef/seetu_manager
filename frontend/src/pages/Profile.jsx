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
  const { user, updateUser, isAdmin, isOrganizer, isMember } = useAuth();
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

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }

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

  const currentRole = (userInfo?.role || user?.role || 'MEMBER').toUpperCase();

  const renderRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span
            className="badge px-3 py-1.5 rounded-pill d-inline-flex align-items-center gap-1.5"
            style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.4px' }}
          >
            <Icon name="shield" size={13} color="#1E40AF" />
            <span>PLATFORM ADMINISTRATOR</span>
          </span>
        );
      case 'ORGANIZER':
        return (
          <span
            className="badge px-3 py-1.5 rounded-pill d-inline-flex align-items-center gap-1.5"
            style={{ backgroundColor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.4px' }}
          >
            <Icon name="award" size={13} color="#065F46" />
            <span>SEETTU ORGANIZER</span>
          </span>
        );
      default:
        return (
          <span
            className="badge px-3 py-1.5 rounded-pill d-inline-flex align-items-center gap-1.5"
            style={{ backgroundColor: '#F8FAFC', color: '#334155', border: '1px solid #E2E8F0', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.4px' }}
          >
            <Icon name="user" size={13} color="#334155" />
            <span>COMMUNITY MEMBER</span>
          </span>
        );
    }
  };

  return (
    <div className="profile-page-container pb-4">
      {/* Page Header */}
      <div className="profile-page-header mb-4">
        <div>
          <h2 className="profile-page-title mb-1">
            {t('profile_page.title', 'Profile Settings')}
          </h2>
          <p className="profile-page-subtitle mb-0">
            {isAdmin
              ? 'Manage system administrator credentials, security access, and platform oversight.'
              : isOrganizer
              ? 'Manage your organizer profile, circle settings, and security credentials.'
              : 'Manage your personal profile details, enrolled circles, and security settings.'}
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {renderRoleBadge(currentRole)}
          {userInfo?.kycStatus === 'VERIFIED' ? (
            <span
              className="badge px-3 py-1.5 rounded-pill d-inline-flex align-items-center gap-1.5"
              style={{ backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0', fontSize: '0.78rem', fontWeight: 600 }}
            >
              <Icon name="check-circle" size={13} color="#15803D" />
              <span>KYC Verified</span>
            </span>
          ) : userInfo?.kycStatus === 'IN_REVIEW' ? (
            <span
              className="badge px-3 py-1.5 rounded-pill d-inline-flex align-items-center gap-1.5"
              style={{ backgroundColor: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', fontSize: '0.78rem', fontWeight: 600 }}
            >
              <Icon name="clock" size={13} color="#B45309" />
              <span>KYC Under Review</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* Action Notifications */}
      {actionMsg && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2 mb-4 shadow-sm" role="alert">
          <Icon name="check-circle" size={18} color="#059669" />
          <div className="fw-medium">{actionMsg}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setActionMsg('')} aria-label="Close"></button>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-4 shadow-sm" role="alert">
          <Icon name="alert-circle" size={18} color="#DC2626" />
          <div className="fw-medium">{errorMsg}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setErrorMsg('')} aria-label="Close"></button>
        </div>
      )}

      {/* Main Grid: Balanced Two-Column Architecture */}
      <div className="row g-4 align-items-start">
        {/* Left Column: User Profile Card & Role Privileges Card */}
        <div className="col-12 col-lg-5 col-xl-4 d-flex flex-column gap-4">
          {/* Card 1: User Identity Card */}
          <div className="ui-card p-4 text-center shadow-sm position-relative">
            {/* Avatar Circle with Initials or Picture + Camera Button */}
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar-circle">
                {profilePictureUrl && failedProfilePictureUrl !== profilePictureUrl ? (
                  <img
                    src={`http://localhost:8081${profilePictureUrl}`}
                    alt={fullName || userInfo?.fullName || 'User'}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover', display: 'block' }}
                    onError={() => setFailedProfilePictureUrl(profilePictureUrl)}
                  />
                ) : (
                  <span>{getInitials(fullName || userInfo?.fullName)}</span>
                )}

                {uploadingPic && (
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{ backgroundColor: 'rgba(15, 47, 61, 0.72)', zIndex: 4 }}
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
                className="profile-camera-btn"
                title="Change Profile Picture"
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

            {/* Quick Remove Photo Option */}
            {(userInfo?.profilePictureUrl || user?.profilePictureUrl) && !uploadingPic && (
              <div className="mb-2">
                <button
                  type="button"
                  onClick={handleDeletePicture}
                  className="btn btn-link btn-sm text-danger text-decoration-none p-0 d-inline-flex align-items-center gap-1"
                  style={{ fontSize: '0.78rem' }}
                >
                  <Icon name="trash" size={13} color="#DC2626" />
                  <span>{t('profile_page.remove_photo', 'Remove Photo')}</span>
                </button>
              </div>
            )}

            <h4 className="fw-bold text-dark mb-1">{fullName || userInfo?.fullName || 'User'}</h4>
            <div className="mb-3">{renderRoleBadge(currentRole)}</div>

            {/* Become an Organizer Banner (MEMBER only, VERIFIED) */}
            {user?.role === 'MEMBER' && user?.kycStatus === 'VERIFIED' && (
              <div className="mb-3">
                {user?.requestedRole === 'ORGANIZER' ? (
                  <div
                    className="d-flex align-items-center justify-content-center gap-2 py-2 px-3 rounded-3"
                    style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', fontSize: '0.82rem' }}
                  >
                    <Icon name="clock" size={15} color="#92400E" />
                    <span className="fw-semibold">Organizer Application Under Review</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                    style={{ background: '#134A5A', color: '#fff', borderRadius: '10px' }}
                    onClick={() => setShowOrgModal(true)}
                  >
                    <Icon name="award" size={16} color="#fff" />
                    Become an Organizer
                  </button>
                )}
              </div>
            )}

            {/* Edit / Cancel Toggle Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-teal w-100 py-2 fw-semibold d-inline-flex align-items-center justify-content-center gap-2 mb-3"
            >
              <Icon name={isEditing ? 'x' : 'edit'} size={15} />
              <span>{isEditing ? t('common.cancel', 'Cancel Edit') : t('common.edit', 'Edit Profile')}</span>
            </button>

            {/* Viewing vs Editing States */}
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="text-start border-top pt-3">
                <div className="mb-3">
                  <label className="form-label small text-muted fw-semibold mb-1">
                    {t('profile_page.full_name', 'Full Name')} <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small text-muted fw-semibold mb-1">
                    {t('profile_page.phone', 'Phone Number')} <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0771234567"
                    required
                  />
                </div>

                <div className="mb-3 p-2.5 rounded-3 bg-light border text-start">
                  <div className="small fw-semibold text-dark mb-1 d-flex align-items-center gap-1.5">
                    <Icon name="upload" size={14} color="#0097B2" />
                    <span>Upload New Photo</span>
                  </div>
                  <p className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>
                    JPG, PNG, or WEBP up to 5MB supported.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPic}
                    className="btn btn-sm btn-outline-secondary w-100 d-inline-flex align-items-center justify-content-center gap-1.5"
                  >
                    <Icon name="camera" size={14} />
                    <span>Select Photo from Device</span>
                  </button>
                </div>

                <button
                  type="submit"
                  className="btn btn-teal w-100 py-2 fw-semibold d-inline-flex align-items-center justify-content-center gap-2"
                  disabled={saving || uploadingPic}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      <span>{t('profile_page.saving', 'Saving...')}</span>
                    </>
                  ) : (
                    <>
                      <Icon name="check" size={16} />
                      <span>{t('profile_page.save_changes', 'Save Changes')}</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-start border-top pt-3">
                {/* Email Item */}
                <div className="profile-info-tile">
                  <div className="profile-info-tile-label">
                    <Icon name="mail" size={15} color="#0097B2" />
                    <span>Email</span>
                  </div>
                  <div className="profile-info-tile-val" title={userInfo?.email || '-'}>
                    {userInfo?.email || '-'}
                  </div>
                </div>

                {/* Phone Item */}
                <div className="profile-info-tile">
                  <div className="profile-info-tile-label">
                    <Icon name="phone" size={15} color="#0097B2" />
                    <span>Phone</span>
                  </div>
                  <div className="profile-info-tile-val">
                    {phone || userInfo?.phone || 'Not provided'}
                  </div>
                </div>

                {/* Member Since Item */}
                <div className="profile-info-tile">
                  <div className="profile-info-tile-label">
                    <Icon name="calendar" size={15} color="#0097B2" />
                    <span>Joined</span>
                  </div>
                  <div className="profile-info-tile-val">
                    {formatJoinDate(userInfo?.createdAt)}
                  </div>
                </div>

                {/* Language Item */}
                <div className="profile-info-tile">
                  <div className="profile-info-tile-label">
                    <Icon name="globe" size={15} color="#0097B2" />
                    <span>Language</span>
                  </div>
                  <div className="profile-info-tile-val">
                    {userInfo?.preferredLanguage === 'SI' ? 'Sinhala' : userInfo?.preferredLanguage === 'TA' ? 'Tamil' : 'English'}
                  </div>
                </div>

                {/* Account Standing */}
                <div className="profile-info-tile mb-0">
                  <div className="profile-info-tile-label">
                    <Icon name="shield" size={15} color="#15803D" />
                    <span>Account Standing</span>
                  </div>
                  <div className="profile-info-tile-val text-success">
                    Active & Compliant
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Role Privileges & Workspace Card */}
          <div className="ui-card p-4 shadow-sm text-start">
            {isAdmin ? (
              <div>
                <div className="d-flex align-items-center gap-2.5 mb-3 pb-2 border-bottom">
                  <div className="rounded-circle p-2 bg-teal-subtle text-teal d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                    <Icon name="shield" size={18} color="#0097B2" />
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-0">Platform Administration</h6>
                    <small className="text-muted">System Governance Scope</small>
                  </div>
                </div>

                <p className="small text-muted mb-3 leading-relaxed">
                  You possess full supervisory authority over Seettu transaction flows, dispute mediation, and member compliance across Sri Lanka.
                </p>

                <div className="d-flex flex-column gap-2 mb-3">
                  <div className="d-flex align-items-center gap-2 small text-dark">
                    <Icon name="check" size={14} color="#15803D" />
                    <span>Financial audit reconciliation ledger</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 small text-dark">
                    <Icon name="check" size={14} color="#15803D" />
                    <span>Chief arbitrator for member disputes</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 small text-dark">
                    <Icon name="check" size={14} color="#15803D" />
                    <span>NIC & Grama Niladhari KYC verification</span>
                  </div>
                </div>

                <div className="d-flex flex-column gap-2 pt-2">
                  <button
                    onClick={() => navigate('/reports')}
                    className="btn btn-sm btn-outline-teal w-100 d-inline-flex align-items-center justify-content-center gap-2"
                  >
                    <Icon name="file-text" size={14} />
                    <span>Audit Reports Ledger</span>
                  </button>
                  <button
                    onClick={() => navigate('/disputes')}
                    className="btn btn-sm btn-outline-secondary w-100 d-inline-flex align-items-center justify-content-center gap-2"
                  >
                    <Icon name="scale" size={14} />
                    <span>Dispute Settlement Desk</span>
                  </button>
                </div>
              </div>
            ) : isOrganizer ? (
              <div>
                <div className="d-flex align-items-center gap-2.5 mb-3 pb-2 border-bottom">
                  <div className="rounded-circle p-2 bg-teal-subtle text-teal d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                    <Icon name="award" size={18} color="#0097B2" />
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-0">Organizer Workspace</h6>
                    <small className="text-muted">Circle Coordinator Privileges</small>
                  </div>
                </div>

                <p className="small text-muted mb-3 leading-relaxed">
                  You are licensed to organize rotating Seettu circles, oversee monthly collection cycles, and disburse rotation vouchers.
                </p>

                <div className="d-flex flex-column gap-2 mb-3">
                  <div className="d-flex align-items-center gap-2 small text-dark">
                    <Icon name="check" size={14} color="#15803D" />
                    <span>Collect & track monthly member pot fees</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 small text-dark">
                    <Icon name="check" size={14} color="#15803D" />
                    <span>Approve disbursement vouchers</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 small text-dark">
                    <Icon name="check" size={14} color="#15803D" />
                    <span>Evaluate member emergency draw requests</span>
                  </div>
                </div>

                <div className="d-flex flex-column gap-2 pt-2">
                  <button
                    onClick={() => navigate('/groups')}
                    className="btn btn-sm btn-teal w-100 d-inline-flex align-items-center justify-content-center gap-2"
                  >
                    <Icon name="plus" size={14} />
                    <span>Manage / Create Circles</span>
                  </button>
                  <button
                    onClick={() => navigate('/payments')}
                    className="btn btn-sm btn-outline-secondary w-100 d-inline-flex align-items-center justify-content-center gap-2"
                  >
                    <Icon name="credit-card" size={14} />
                    <span>Payment Tracking Desk</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="d-flex align-items-center gap-2.5 mb-3 pb-2 border-bottom">
                  <div className="rounded-circle p-2 bg-teal-subtle text-teal d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                    <Icon name="handshake" size={18} color="#0097B2" />
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-0">Member Participation Desk</h6>
                    <small className="text-muted">Community Savings Standing</small>
                  </div>
                </div>

                <p className="small text-muted mb-3 leading-relaxed">
                  Maintain an on-time contribution streak to safeguard your 90+ discipline rating and qualify for emergency relief loans.
                </p>

                <div className="d-flex flex-column gap-2 mb-3">
                  <div className="d-flex align-items-center gap-2 small text-dark">
                    <Icon name="check" size={14} color="#15803D" />
                    <span>Zero-interest rotating community pot</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 small text-dark">
                    <Icon name="check" size={14} color="#15803D" />
                    <span>Eligible for advance emergency payouts</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 small text-dark">
                    <Icon name="check" size={14} color="#15803D" />
                    <span>Official completion certificates on payout</span>
                  </div>
                </div>

                <div className="d-flex flex-column gap-2 pt-2">
                  <button
                    onClick={() => navigate('/groups')}
                    className="btn btn-sm btn-teal w-100 d-inline-flex align-items-center justify-content-center gap-2"
                  >
                    <Icon name="users" size={14} />
                    <span>Explore Seettu Circles</span>
                  </button>
                  <button
                    onClick={() => navigate('/emergency')}
                    className="btn btn-sm btn-outline-secondary w-100 d-inline-flex align-items-center justify-content-center gap-2"
                  >
                    <Icon name="emergency" size={14} />
                    <span>Emergency Aid Desk</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Groups Oversight, Statistics, and Security Cards */}
        <div className="col-12 col-lg-7 col-xl-8 d-flex flex-column gap-4">
          {/* Card 1: My Groups Card / System Oversight Card */}
          <div className="ui-card p-4 shadow-sm text-start">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <div>
                <h5 className="fw-bold text-dark mb-0">
                  {isAdmin ? 'System Group Oversight' : 'My Seettu Circles'}
                </h5>
                <small className="text-muted">
                  {isAdmin
                    ? 'Platform-wide group governance and monitoring'
                    : 'Active participation and circle memberships'}
                </small>
              </div>

              {isAdmin ? (
                <span className="badge bg-info-subtle text-info border px-2.5 py-1 fw-bold">
                  Platform Oversight
                </span>
              ) : (
                <span className="badge bg-teal-subtle text-teal px-2.5 py-1 fw-bold">
                  {groups.length} {groups.length === 1 ? 'Circle' : 'Circles'}
                </span>
              )}
            </div>

            {isAdmin ? (
              <div className="text-center py-4 px-2">
                <div
                  className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
                  style={{ width: '56px', height: '56px', backgroundColor: '#EFF6FF', color: '#1E40AF' }}
                >
                  <Icon name="shield" size={28} color="#1E40AF" />
                </div>
                <h6 className="fw-bold text-dark mb-1">Administrative Governance Scope</h6>
                <p className="text-muted small mx-auto mb-3" style={{ maxWidth: '500px' }}>
                  As a System Administrator, you supervise all registered Seettu circles, verify organizer credentials, and audit financial flows instead of contributing personal pot shares.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <button onClick={() => navigate('/groups')} className="btn btn-sm btn-teal d-inline-flex align-items-center gap-1.5">
                    <Icon name="users" size={14} />
                    <span>Inspect Platform Circles</span>
                  </button>
                  <button onClick={() => navigate('/verification')} className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5">
                    <Icon name="check-circle" size={14} />
                    <span>KYC Approvals</span>
                  </button>
                </div>
              </div>
            ) : loading ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-teal" role="status" style={{ color: '#0097B2' }}></div>
                <span className="ms-2 text-muted small">Loading circle memberships...</span>
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <Icon name="users" size={32} color="#94A3B8" className="mb-2 d-block mx-auto" />
                <div className="fw-semibold text-dark mb-1">No Active Seettu Groups</div>
                <div className="small mb-3">You are not currently enrolled in any community circles.</div>
                <button onClick={() => navigate('/groups')} className="btn btn-sm btn-teal d-inline-flex align-items-center gap-1.5">
                  <Icon name="plus" size={14} />
                  <span>Browse & Join Circles</span>
                </button>
              </div>
            ) : (
              <div className="profile-groups-scroll d-flex flex-column gap-2.5">
                {groups.map((g) => {
                  const isActive = g.status === 'ACTIVE' || !g.status;
                  const isPending = g.status === 'PENDING';
                  return (
                    <div key={g.id} className="profile-group-row">
                      <div className="d-flex align-items-center gap-3 min-w-0">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: '40px', height: '40px', backgroundColor: '#E8F0F3', color: '#235665' }}
                        >
                          <Icon name="users" size={18} color="#235665" />
                        </div>
                        <div className="min-w-0">
                          <div className="fw-bold text-dark small text-truncate mb-1">{g.name}</div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span
                              className={
                                isActive
                                  ? 'badge bg-success-subtle text-success border border-success-subtle'
                                  : isPending
                                  ? 'badge bg-warning-subtle text-dark border border-warning-subtle'
                                  : 'badge bg-secondary-subtle text-secondary border'
                              }
                              style={{ fontSize: '0.7rem' }}
                            >
                              {isActive ? 'Active Circle' : isPending ? 'Pending Cycle' : g.status}
                            </span>
                            {g.contributionAmount && (
                              <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                                • LKR {Number(g.contributionAmount).toLocaleString()} / pot
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/groups/${g.id}`)}
                        className="btn btn-sm btn-outline-teal d-inline-flex align-items-center gap-1 flex-shrink-0"
                      >
                        <span>View</span>
                        <Icon name="chevron-right" size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 2: Performance & Statistics Card */}
          <div className="ui-card p-4 shadow-sm text-start">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <div>
                <h5 className="fw-bold text-dark mb-0">
                  {isAdmin ? 'Administrative Governance Overview' : 'Savings & Performance Statistics'}
                </h5>
                <small className="text-muted">
                  {isAdmin
                    ? 'Supervisory authority and compliance metrics'
                    : 'Your contributions, trust score, and circle achievements'}
                </small>
              </div>
            </div>

            {isAdmin ? (
              <div>
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <div className="profile-stat-tile" style={{ backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }}>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="small fw-semibold" style={{ color: '#1E40AF', fontSize: '0.8rem' }}>
                          System Role
                        </span>
                        <Icon name="shield" size={18} color="#2563EB" />
                      </div>
                      <div className="fs-6 fw-bold text-truncate" style={{ color: '#1E40AF' }}>
                        Platform Administrator
                      </div>
                      <small className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                        Supervisory governance authority
                      </small>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6">
                    <div className="profile-stat-tile" style={{ backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' }}>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="small fw-semibold" style={{ color: '#065F46', fontSize: '0.8rem' }}>
                          Arbitration Standing
                        </span>
                        <Icon name="scale" size={18} color="#059669" />
                      </div>
                      <div className="fs-6 fw-bold" style={{ color: '#065F46' }}>
                        Chief Arbitrator
                      </div>
                      <small className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                        Final dispute appeals authority
                      </small>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6">
                    <div className="profile-stat-tile" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="small fw-semibold" style={{ color: '#475569', fontSize: '0.8rem' }}>
                          Discipline Rating
                        </span>
                        <Icon name="check-circle" size={18} color="#64748B" />
                      </div>
                      <div className="fs-6 fw-bold" style={{ color: '#475569' }}>
                        Exempt (Platform Oversight)
                      </div>
                      <small className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                        Non-participating supervisory account
                      </small>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6">
                    <div className="profile-stat-tile" style={{ backgroundColor: '#FFFBEB', borderColor: '#FEF3C7' }}>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="small fw-semibold" style={{ color: '#92400E', fontSize: '0.8rem' }}>
                          Privilege Scope
                        </span>
                        <Icon name="lock" size={18} color="#D97706" />
                      </div>
                      <div className="fs-6 fw-bold" style={{ color: '#92400E' }}>
                        Full System Governance
                      </div>
                      <small className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                        Full ledger, dispute & user access
                      </small>
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-light rounded-3 border d-flex align-items-center gap-2.5">
                  <Icon name="info" size={18} color="#0097B2" className="flex-shrink-0" />
                  <div className="small text-muted" style={{ fontSize: '0.8rem' }}>
                    As Platform Administrator, you govern dispute settlements, monitor financial audits, and enforce platform regulations. You do not participate in contribution draws or hold personal discipline ratings.
                  </div>
                </div>
              </div>
            ) : (
              <div className="row g-3">
                {/* Tile 1: Total Contributed */}
                <div className="col-12 col-sm-6">
                  <div className="profile-stat-tile" style={{ backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' }}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small fw-semibold" style={{ color: '#991B1B', fontSize: '0.8rem' }}>
                        Total Contributed
                      </span>
                      <Icon name="credit-card" size={18} color="#DC2626" />
                    </div>
                    <div className="fs-5 fw-bold" style={{ color: '#991B1B' }}>
                      {totalContributed.toLocaleString()} LKR
                    </div>
                    <small className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                      Verified circle payments deposited
                    </small>
                  </div>
                </div>

                {/* Tile 2: Groups Participated */}
                <div className="col-12 col-sm-6">
                  <div className="profile-stat-tile" style={{ backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small fw-semibold" style={{ color: '#1E40AF', fontSize: '0.8rem' }}>
                        Groups Participated
                      </span>
                      <Icon name="users" size={18} color="#2563EB" />
                    </div>
                    <div className="fs-5 fw-bold" style={{ color: '#1E40AF' }}>
                      {groupsParticipated} {groupsParticipated === 1 ? 'Circle' : 'Circles'}
                    </div>
                    <small className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                      Enrolled and completed circles
                    </small>
                  </div>
                </div>

                {/* Tile 3: Average Discipline Score */}
                <div className="col-12 col-sm-6">
                  <div className="profile-stat-tile" style={{ backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' }}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small fw-semibold" style={{ color: '#065F46', fontSize: '0.8rem' }}>
                        Discipline Score
                      </span>
                      <Icon name="award" size={18} color="#059669" />
                    </div>
                    <div className="fs-5 fw-bold d-flex align-items-center gap-2" style={{ color: '#065F46' }}>
                      <span>{averageDisciplineScore}/100</span>
                      <span
                        className="badge rounded-pill bg-success-subtle text-success border border-success-subtle"
                        style={{ fontSize: '0.68rem', fontWeight: 600 }}
                      >
                        {averageDisciplineScore >= 90 ? 'Excellent' : averageDisciplineScore >= 75 ? 'Good' : 'Fair'}
                      </span>
                    </div>
                    <small className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                      Platform reliability & trust rating
                    </small>
                  </div>
                </div>

                {/* Tile 4: Certificates Earned */}
                <div className="col-12 col-sm-6">
                  <div className="profile-stat-tile" style={{ backgroundColor: '#FFFBEB', borderColor: '#FEF3C7' }}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small fw-semibold" style={{ color: '#92400E', fontSize: '0.8rem' }}>
                        Certificates Earned
                      </span>
                      <Icon name="graduation-cap" size={18} color="#D97706" />
                    </div>
                    <div className="fs-5 fw-bold" style={{ color: '#92400E' }}>
                      {certificatesEarned} {certificatesEarned === 1 ? 'Award' : 'Awards'}
                    </div>
                    <small className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                      Verified cycle payout completions
                    </small>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Security & Password Management Card */}
          <div className="ui-card profile-security-card p-4 shadow-sm text-start">
            <div className="profile-security-header d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
              <div className="d-flex align-items-center gap-2.5">
                <div className="rounded-circle p-2 bg-teal-subtle text-teal d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }}>
                  <Icon name="lock" size={18} color="#0097B2" />
                </div>
                <div>
                  <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.05rem' }}>
                    Security & Change Password
                  </h5>
                  <small className="text-muted">
                    Update your account credentials to safeguard access and circle funds
                  </small>
                </div>
              </div>

              <span className="badge bg-light text-secondary border px-2.5 py-1 small fw-semibold">
                All Roles Protected
              </span>
            </div>

            {passSuccess && (
              <div className="alert alert-success d-flex align-items-center gap-2 py-2.5 px-3 mb-3 small rounded-3 border-0 shadow-sm">
                <Icon name="check-circle" size={16} color="#059669" />
                <span className="fw-semibold">{passSuccess}</span>
              </div>
            )}

            {passError && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2.5 px-3 mb-3 small rounded-3 border-0 shadow-sm">
                <Icon name="alert-circle" size={16} color="#DC2626" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange}>
              <div className="row g-3">
                {/* Current Password */}
                <div className="col-12 col-md-4">
                  <label className="form-label text-secondary fw-semibold small mb-1">
                    Current Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Enter current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      title={showCurrentPass ? 'Hide password' : 'Show password'}
                    >
                      <Icon name={showCurrentPass ? 'eye-off' : 'eye'} size={15} />
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="col-12 col-md-4">
                  <label className="form-label text-secondary fw-semibold small mb-1">
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
                      title={showNewPass ? 'Hide password' : 'Show password'}
                    >
                      <Icon name={showNewPass ? 'eye-off' : 'eye'} size={15} />
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="col-12 col-md-4">
                  <label className="form-label text-secondary fw-semibold small mb-1">
                    Confirm Password <span className="text-danger">*</span>
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
                      title={showConfirmPass ? 'Hide password' : 'Show password'}
                    >
                      <Icon name={showConfirmPass ? 'eye-off' : 'eye'} size={15} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-3 pt-2">
                <small className="text-muted" style={{ fontSize: '0.78rem' }}>
                  Must be at least 6 characters and different from your current password.
                </small>

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
