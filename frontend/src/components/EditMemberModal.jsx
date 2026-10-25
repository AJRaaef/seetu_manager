import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Icon from './Icons';

const getScoreMeta = (scoreNum, t) => {
  const num = Number(scoreNum);
  if (num >= 90) return { label: t ? t('dashboard_page.badges.excellent', 'Excellent') : 'Excellent', color: '#188754' };
  if (num >= 75) return { label: t ? t('dashboard_page.badges.good', 'Good') : 'Good', color: '#0D6EFD' };
  if (num >= 60) return { label: t ? t('dashboard_page.badges.fair', 'Fair') : 'Fair', color: '#FFB020' };
  return { label: t ? t('dashboard_page.badges.poor', 'Poor') : 'Poor', color: '#DC3545' };
};

const EditMemberModal = ({ show, onHide, member, onSave, groups = [] }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [group, setGroup] = useState('');
  const [status, setStatus] = useState('Active');
  const [score, setScore] = useState(100);

  useEffect(() => {
    if (member) {
      setName(member.name || '');
      setEmail(member.email || '');
      setPhone(member.phone || '');
      setGroup(member.group || '');
      setStatus(member.status || 'Active');
      setScore(member.score !== undefined ? member.score : 100);
    }
  }, [member]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert(t('common.required', 'Please enter member name.'));
      return;
    }
    const scoreNum = Math.min(100, Math.max(0, Number(score) || 0));
    const { label: scoreLabel, color: scoreColor } = getScoreMeta(scoreNum, t);

    if (onSave) {
      onSave({
        ...member,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        group,
        status,
        score: scoreNum,
        scoreLabel,
        scoreColor
      });
    }
    onHide();
  };

  if (!member) return null;

  const scoreMeta = getScoreMeta(score, t);

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="custom-modal-content">
      <div className="custom-modal-header">
        <div className="d-flex align-items-center gap-2">
          <h5 className="fw-bold mb-0 text-dark">{t('modals.edit_member.title', 'Edit Member Details')}</h5>
          <span className="badge bg-light text-muted border small">
            #MBR-{member.id}
          </span>
        </div>
        <button className="btn btn-link text-muted p-0 border-0" onClick={onHide} type="button">
          <Icon name="x" size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="custom-modal-body">
          <div className="mb-3">
            <label className="form-label text-dark fw-semibold small">{t('modals.edit_member.full_name', 'Full Name')}</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <label className="form-label text-dark fw-semibold small">{t('modals.edit_member.email', 'Email Address')}</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label text-dark fw-semibold small">{t('modals.edit_member.phone', 'Phone Number')}</label>
              <input
                type="tel"
                className="form-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <label className="form-label text-dark fw-semibold small">{t('modals.edit_member.group', 'Assigned Group')}</label>
              <select
                className="form-select"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
              >
                <option value="">{t('modals.edit_member.select_group', '— Select Group —')}</option>
                {groups && groups.map((g) => {
                  const gName = typeof g === 'string' ? g : (g.groupName || g.name);
                  return (
                    <option key={g.id || gName} value={gName}>
                      {gName}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label text-dark fw-semibold small">{t('modals.edit_member.status', 'Member Status')}</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Active">{t('status.ACTIVE', 'Active')}</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mb-2">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label text-dark fw-semibold small mb-0">{t('modals.edit_member.score', 'Discipline Score')}</label>
              <span className="small fw-bold" style={{ color: scoreMeta.color }}>
                {score} ({scoreMeta.label})
              </span>
            </div>
            <input
              type="number"
              min="0"
              max="100"
              className="form-control"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="custom-modal-footer">
          <button type="button" className="btn btn-light px-4 border" onClick={onHide}>
            {t('modals.edit_member.cancel', 'Cancel')}
          </button>
          <button type="submit" className="btn btn-teal px-4">
            {t('modals.edit_member.save_changes', 'Save Changes')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditMemberModal;
