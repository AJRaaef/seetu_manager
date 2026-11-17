import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Icon from './Icons';
import { getAllGroups } from '../api/groupApi';

const InviteMemberModal = ({ show, onHide, onAddMember, groups = [] }) => {
  const { t } = useTranslation();
  const [groupId, setGroupId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [activeGroups, setActiveGroups] = useState(Array.isArray(groups) ? groups : []);

  useEffect(() => {
    if (Array.isArray(groups) && groups.length > 0) {
      setActiveGroups(groups);
      if (!groupId || !groups.some(g => String(g.id) === String(groupId))) {
        setGroupId(groups[0].id);
      }
    } else if (show) {
      setLoadingGroups(true);
      getAllGroups()
        .then((res) => {
          const raw = res?.data ?? res;
          const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
          setActiveGroups(list);
          if (list.length > 0) {
            setGroupId(list[0].id);
          }
        })
        .catch((err) => console.error(t('members_page.invite_modal.load_groups_error'), err))
        .finally(() => setLoadingGroups(false));
    }
  }, [show, groups]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupId) {
      alert(t('members_page.invite_modal.select_group_error'));
      return;
    }
    setLoading(true);
    try {
      if (onAddMember) {
        await onAddMember({ groupId, fullName, email, phone });
      }
      setFullName('');
      setEmail('');
      setPhone('');
      onHide();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedGroup = activeGroups.find(g => String(g.id) === String(groupId));
  const frequencyLabels = {
    DAILY: t('members_page.invite_modal.daily'),
    WEEKLY: t('members_page.invite_modal.weekly'),
    BI_WEEKLY: t('members_page.invite_modal.biweekly'),
    MONTHLY: t('members_page.invite_modal.monthly')
  };

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="custom-modal-content">
      <div className="custom-modal-header">
        <h5 className="fw-bold mb-0 text-dark">{t('members_page.invite_modal.title')}</h5>
        <button className="btn btn-link text-muted p-0 border-0" onClick={onHide}>
          <Icon name="x" size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="custom-modal-body">
          <div className="mb-3">
            <label className="form-label text-dark fw-semibold small">
              {t('members_page.invite_modal.select_group')} <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              required
              disabled={loadingGroups}
            >
              {loadingGroups ? (
                <option value="">{t('members_page.invite_modal.loading_groups')}</option>
              ) : activeGroups.length === 0 ? (
                <option value="">{t('members_page.invite_modal.no_groups')}</option>
              ) : (
                <>
                  <option value="">{t('members_page.invite_modal.choose_group')}</option>
                  {activeGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} (LKR {Number(g.contributionAmount || 0).toLocaleString()} • {frequencyLabels[String(g.cycleFrequency || 'MONTHLY').toUpperCase()] || g.cycleFrequency})
                    </option>
                  ))}
                </>
              )}
            </select>
            {selectedGroup && (
              <small className="text-muted d-block mt-1">
                {t('members_page.invite_modal.selected_group')}: <strong>{selectedGroup.name}</strong> • {t('members_page.invite_modal.contribution')}: LKR {Number(selectedGroup.contributionAmount || 0).toLocaleString()}
              </small>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label text-dark fw-semibold small">{t('members_page.invite_modal.full_name')}</label>
            <input
              type="text"
              className="form-control"
              placeholder={t('members_page.invite_modal.full_name_placeholder')}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-dark fw-semibold small">{t('members_page.invite_modal.email')}</label>
            <input
              type="email"
              className="form-control"
              placeholder={t('members_page.invite_modal.email_placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label text-dark fw-semibold small">{t('members_page.invite_modal.phone')}</label>
            <input
              type="tel"
              className="form-control"
              placeholder={t('members_page.invite_modal.phone_placeholder')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="custom-modal-footer">
          <button type="button" className="btn btn-link text-muted text-decoration-none px-4" onClick={onHide} disabled={loading}>
            {t('members_page.cancel')}
          </button>
          <button type="submit" className="btn btn-teal px-4" disabled={loading}>
            {loading ? t('members_page.invite_modal.adding') : t('members_page.invite_modal.add_member')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default InviteMemberModal;
