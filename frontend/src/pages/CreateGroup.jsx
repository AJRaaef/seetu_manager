import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { createGroup } from '../api/groupApi';
import { getSeettuTypes } from '../api/seettuTypeApi';
import { getAllShops } from '../api/shopApi';
import api from '../api/axios';
import { getErrorMessage } from '../utils/errorHandler';

const CYCLE_FREQUENCIES = [
  { value: 'DAILY',    label: 'groups_page.create_group.daily' },
  { value: 'WEEKLY',   label: 'groups_page.create_group.weekly' },
  { value: 'MONTHLY',  label: 'groups_page.create_group.monthly' },
];

const isNonMonetary = (type) => {
  if (!type) return false;
  const name = (type.name || '').toLowerCase();
  return name.includes('non') || name.includes('item');
};

const getSeettuTypeTranslationKey = (name) => {
  const normalizedName = name?.trim().toLowerCase();
  if (normalizedName === 'monetary') return 'monetary';
  if (normalizedName === 'non-monetary') return 'non_monetary';
  return null;
};

const INITIAL_FORM = {
  name: '',
  description: '',
  contributionAmount: '',
  memberCount: '',
  cycleFrequency: 'MONTHLY',
  seettuTypeId: '',
  category: '',
  shopId: '',
};

const INITIAL_ERRORS = {
  name: '',
  contributionAmount: '',
  memberCount: '',
  cycleFrequency: '',
  seettuTypeId: '',
};

const CreateGroup = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [seettuTypes, setSeettuTypes] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Shop registration modal state
  const [showAddShopModal, setShowAddShopModal] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [newShopOwnerName, setNewShopOwnerName] = useState('');
  const [newShopType, setNewShopType] = useState('GOLD_JEWELLERY');
  const [newShopRegisterNumber, setNewShopRegisterNumber] = useState('');
  const [newShopContact, setNewShopContact] = useState('');
  const [newShopEmail, setNewShopEmail] = useState('');
  const [newShopAddress, setNewShopAddress] = useState('');
  const [newShopDescription, setNewShopDescription] = useState('');
  const [savingShop, setSavingShop] = useState(false);
  const [shopError, setShopError] = useState('');

  // Derived: selected type object
  const selectedType = seettuTypes.find(t => String(t.id) === String(formData.seettuTypeId));
  const selectedTypeTranslationKey = getSeettuTypeTranslationKey(selectedType?.name);
  const showShop = isNonMonetary(selectedType);

  // Fetch seettu types and shops on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typeRes, shopRes] = await Promise.all([
          getSeettuTypes(),
          getAllShops(),
        ]);
        const types = typeRes?.data || typeRes || [];
        const shopList = shopRes?.data || shopRes || [];
        setSeettuTypes(Array.isArray(types) ? types : []);
        setShops(Array.isArray(shopList) ? shopList : []);
        // Default to first type (Monetary, id=1)
        if (Array.isArray(types) && types.length > 0) {
          setFormData(prev => ({ ...prev, seettuTypeId: String(types[0].id) }));
        }
      } catch (err) {
        console.error('Failed to load types/shops', err);
      }
    };
    fetchData();
  }, []);

  // Clear shopId when switching from Non-Monetary to Monetary
  useEffect(() => {
    if (!showShop) {
      setFormData(prev => ({ ...prev, shopId: '' }));
    }
  }, [showShop]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = { ...INITIAL_ERRORS };
    let valid = true;

    if (!formData.name.trim()) {
      newErrors.name = t('groups_page.create_group.name_required');
      valid = false;
    } else if (formData.name.trim().length > 100) {
      newErrors.name = t('groups_page.create_group.name_max_length');
      valid = false;
    }

    const amount = parseFloat(formData.contributionAmount);
    if (!formData.contributionAmount || isNaN(amount) || amount <= 0) {
      newErrors.contributionAmount = t('groups_page.create_group.amount_required');
      valid = false;
    }

    const count = parseInt(formData.memberCount);
    if (!formData.memberCount || isNaN(count) || count < 2) {
      newErrors.memberCount = t('groups_page.create_group.member_count_minimum');
      valid = false;
    }

    if (!formData.cycleFrequency) {
      newErrors.cycleFrequency = t('groups_page.create_group.frequency_required');
      valid = false;
    }

    if (!formData.seettuTypeId) {
      newErrors.seettuTypeId = t('groups_page.create_group.type_required');
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    setLoading(true);
    const creatorId = user?.userId || user?.id;

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        contributionAmount: parseFloat(formData.contributionAmount),
        memberCount: parseInt(formData.memberCount),
        cycleFrequency: formData.cycleFrequency,
        seettuTypeId: parseInt(formData.seettuTypeId),
        category: formData.category.trim() || null,
        shopId: (showShop && formData.shopId) ? parseInt(formData.shopId) : null,
      };

      await createGroup(payload, creatorId);
      navigate('/groups');
    } catch (err) {
      setSubmitError(getErrorMessage(err, t('groups_page.create_group.create_error')));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShop = async (e) => {
    e.preventDefault();
    if (!newShopName.trim()) return;
    setSavingShop(true);
    setShopError('');
    try {
      const ownerId = user?.userId || user?.id || 2;
      const payload = {
        name: newShopName.trim(),
        shopName: newShopName.trim(),
        shopOwnerName: newShopOwnerName.trim() || undefined,
        shopType: newShopType,
        shopRegisterNumber: newShopRegisterNumber.trim() || undefined,
        contactNumber: newShopContact.trim() || undefined,
        shopEmail: newShopEmail.trim() || undefined,
        shopAddress: newShopAddress.trim() || undefined,
        address: newShopAddress.trim() || undefined,
        description: newShopDescription.trim() || undefined,
        status: 'ACTIVE',
      };
      const res = await api.post(`/shops?ownerId=${ownerId}`, payload);
      const created = res.data?.data || res.data;
      if (created && (created.id || created.shopId)) {
        const newShop = { ...created, id: created.id || created.shopId };
        setShops(prev => [...prev, newShop]);
        setFormData(prev => ({ ...prev, shopId: String(newShop.id) }));
        setShowAddShopModal(false);
        setNewShopName(''); setNewShopOwnerName(''); setNewShopType('GOLD_JEWELLERY');
        setNewShopRegisterNumber(''); setNewShopContact(''); setNewShopEmail('');
        setNewShopAddress(''); setNewShopDescription('');
      }
    } catch (err) {
      setShopError(t('groups_page.create_group.shop_registration_error'));
    } finally {
      setSavingShop(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-8 col-xl-7">
        <div className="card shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          {/* Header */}
          <div className="p-4" style={{ backgroundColor: '#235665', color: '#FFFFFF' }}>
            <h4 className="mb-0 fw-bold text-white" style={{ fontSize: '1.25rem' }}>
              {t('groups_page.create_group.title')}
            </h4>
            <p className="mb-0 text-white-50 mt-1" style={{ fontSize: '0.85rem' }}>
              {t('groups_page.create_group.subtitle')}
            </p>
          </div>

          <div className="card-body p-4">
            {/* Global error */}
            {submitError && (
              <div className="alert alert-danger border-0 mb-4 rounded-3">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Group Name */}
              <div className="mb-3">
                <label className="form-label fw-medium text-secondary" style={{ fontSize: '0.875rem' }}>
                  {t('groups_page.create_group.group_name')} <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  placeholder={t('groups_page.create_group.group_name_placeholder')}
                  value={formData.name}
                  maxLength={100}
                  onChange={e => handleChange('name', e.target.value)}
                  style={{ borderRadius: '8px' }}
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label fw-medium text-secondary" style={{ fontSize: '0.875rem' }}>
                  {t('groups_page.create_group.description')}
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder={t('groups_page.create_group.description_placeholder')}
                  value={formData.description}
                  maxLength={500}
                  onChange={e => handleChange('description', e.target.value)}
                  style={{ borderRadius: '8px' }}
                />
              </div>

              {/* Contribution Amount / Member Count / Cycle Frequency */}
              <div className="row mb-3 g-3">
                <div className="col-md-4">
                  <label className="form-label fw-medium text-secondary" style={{ fontSize: '0.875rem' }}>
                    {t('groups_page.create_group.contribution_amount')} <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className={`form-control ${errors.contributionAmount ? 'is-invalid' : ''}`}
                    placeholder={t('groups_page.create_group.contribution_placeholder')}
                    value={formData.contributionAmount}
                    min="1"
                    step="any"
                    onChange={e => handleChange('contributionAmount', e.target.value)}
                    style={{ borderRadius: '8px' }}
                  />
                  {errors.contributionAmount && <div className="invalid-feedback">{errors.contributionAmount}</div>}
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-medium text-secondary" style={{ fontSize: '0.875rem' }}>
                    {t('groups_page.create_group.member_count')} <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className={`form-control ${errors.memberCount ? 'is-invalid' : ''}`}
                    placeholder={t('groups_page.create_group.member_count_placeholder')}
                    value={formData.memberCount}
                    min="2"
                    onChange={e => handleChange('memberCount', e.target.value)}
                    style={{ borderRadius: '8px' }}
                  />
                  {errors.memberCount && <div className="invalid-feedback">{errors.memberCount}</div>}
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-medium text-secondary" style={{ fontSize: '0.875rem' }}>
                    {t('groups_page.create_group.cycle_frequency')} <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${errors.cycleFrequency ? 'is-invalid' : ''}`}
                    value={formData.cycleFrequency}
                    onChange={e => handleChange('cycleFrequency', e.target.value)}
                    style={{ borderRadius: '8px' }}
                  >
                    {CYCLE_FREQUENCIES.map(f => (
                      <option key={f.value} value={f.value}>{t(f.label)}</option>
                    ))}
                  </select>
                  {errors.cycleFrequency && <div className="invalid-feedback">{errors.cycleFrequency}</div>}
                </div>
              </div>

              {/* Seettu Type */}
              <div className="mb-3">
                <label className="form-label fw-medium text-secondary" style={{ fontSize: '0.875rem' }}>
                  {t('groups_page.create_group.seettu_type')} <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-select ${errors.seettuTypeId ? 'is-invalid' : ''}`}
                  value={formData.seettuTypeId}
                  onChange={e => handleChange('seettuTypeId', e.target.value)}
                  style={{ borderRadius: '8px' }}
                >
                  <option value="">{t('groups_page.create_group.select_type')}</option>
                  {seettuTypes.map(type => {
                    const translationKey = getSeettuTypeTranslationKey(type.name);
                    return (
                      <option key={type.id} value={type.id}>
                        {translationKey ? t(`groups_page.create_group.type_${translationKey}`) : type.name}
                      </option>
                    );
                  })}
                </select>
                {errors.seettuTypeId && <div className="invalid-feedback">{errors.seettuTypeId}</div>}
                {selectedType?.description && (
                  <div className="form-text text-muted mt-1" style={{ fontSize: '0.8rem' }}>
                    {selectedTypeTranslationKey
                      ? t(`groups_page.create_group.type_${selectedTypeTranslationKey}_description`)
                      : selectedType.description}
                  </div>
                )}
              </div>

              {/* Category (optional) */}
              <div className="mb-3">
                <label className="form-label fw-medium text-secondary" style={{ fontSize: '0.875rem' }}>
                  {t('groups_page.create_group.category')}
                  <span className="text-muted ms-1" style={{ fontSize: '0.78rem' }}>{t('groups_page.create_group.optional')}</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={t('groups_page.create_group.category_placeholder')}
                  value={formData.category}
                  onChange={e => handleChange('category', e.target.value)}
                  style={{ borderRadius: '8px' }}
                />
              </div>

              {/* Shop — only shown for Non-Monetary type */}
              {showShop && (
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label fw-medium text-secondary mb-0" style={{ fontSize: '0.875rem' }}>
                      {t('groups_page.create_group.associated_shop')}
                      <span className="text-muted ms-1" style={{ fontSize: '0.78rem' }}>{t('groups_page.create_group.optional')}</span>
                    </label>
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold"
                      style={{ fontSize: '0.8rem', color: '#235665' }}
                      onClick={() => setShowAddShopModal(true)}
                    >
                      + {t('groups_page.create_group.register_shop')}
                    </button>
                  </div>
                  <select
                    className="form-select"
                    value={formData.shopId}
                    onChange={e => handleChange('shopId', e.target.value)}
                    style={{ borderRadius: '8px' }}
                  >
                    <option value="">{t('groups_page.create_group.no_associated_shop')}</option>
                    {shops.map(shop => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name}{shop.address ? ` (${shop.address})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Actions */}
              <div className="d-flex gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary flex-grow-1"
                  style={{ borderRadius: '8px' }}
                  onClick={() => navigate('/groups')}
                  disabled={loading}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn text-white fw-bold flex-grow-1"
                  style={{ backgroundColor: '#235665', borderColor: '#235665', borderRadius: '8px' }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                      {t('groups_page.create_group.creating')}
                    </>
                  ) : (
                    t('groups_page.create_group.submit')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Register Shop Modal */}
      {showAddShopModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div className="modal-header text-white" style={{ backgroundColor: '#235665' }}>
                <div>
                  <h5 className="modal-title fw-bold mb-0">{t('groups_page.create_group.register_shop_title')}</h5>
                  <small className="text-white-50">{t('groups_page.create_group.register_shop_subtitle')}</small>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddShopModal(false)} />
              </div>
              <form onSubmit={handleCreateShop}>
                <div className="modal-body p-4">
                  {shopError && (
                    <div className="alert alert-danger py-2 px-3 mb-3 small border-0 rounded-3">{shopError}</div>
                  )}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-secondary fw-medium small mb-1">
                        {t('groups_page.create_group.shop_name')} <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={t('groups_page.create_group.shop_name_placeholder')}
                        value={newShopName}
                        onChange={e => setNewShopName(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-secondary fw-medium small mb-1">{t('groups_page.create_group.shop_owner_name')}</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={t('groups_page.create_group.shop_owner_placeholder')}
                        value={newShopOwnerName}
                        onChange={e => setNewShopOwnerName(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-secondary fw-medium small mb-1">
                        {t('groups_page.create_group.shop_type')} <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={newShopType}
                        onChange={e => setNewShopType(e.target.value)}
                      >
                        <option value="GOLD_JEWELLERY">{t('groups_page.create_group.shop_type_gold')}</option>
                        <option value="ELECTRONICS">{t('groups_page.create_group.shop_type_electronics')}</option>
                        <option value="VEHICLES_MOTORS">{t('groups_page.create_group.shop_type_vehicles')}</option>
                        <option value="GROCERY_PROVISIONS">{t('groups_page.create_group.shop_type_grocery')}</option>
                        <option value="HARDWARE_CONSTRUCTION">{t('groups_page.create_group.shop_type_hardware')}</option>
                        <option value="GENERAL_MERCHANT">{t('groups_page.create_group.shop_type_general')}</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-secondary fw-medium small mb-1">{t('groups_page.create_group.business_registration')}</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={t('groups_page.create_group.business_registration_placeholder')}
                        value={newShopRegisterNumber}
                        onChange={e => setNewShopRegisterNumber(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-secondary fw-medium small mb-1">{t('groups_page.create_group.contact_phone')}</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder={t('groups_page.create_group.contact_phone_placeholder')}
                        value={newShopContact}
                        onChange={e => setNewShopContact(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-secondary fw-medium small mb-1">{t('groups_page.create_group.official_email')}</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder={t('groups_page.create_group.official_email_placeholder')}
                        value={newShopEmail}
                        onChange={e => setNewShopEmail(e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary fw-medium small mb-1">{t('groups_page.create_group.store_address')}</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={t('groups_page.create_group.store_address_placeholder')}
                        value={newShopAddress}
                        onChange={e => setNewShopAddress(e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary fw-medium small mb-1">{t('groups_page.create_group.shop_description')}</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder={t('groups_page.create_group.shop_description_placeholder')}
                        value={newShopDescription}
                        onChange={e => setNewShopDescription(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top p-3 bg-light">
                  <button type="button" className="btn btn-secondary px-3" onClick={() => setShowAddShopModal(false)}>
                    {t('common.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4 fw-bold"
                    style={{ backgroundColor: '#235665', borderColor: '#235665' }}
                    disabled={savingShop || !newShopName.trim()}
                  >
                    {savingShop ? t('groups_page.create_group.registering') : t('groups_page.create_group.register_shop')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateGroup;
