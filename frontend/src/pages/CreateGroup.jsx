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
  { value: 'DAILY',    label: 'Daily' },
  { value: 'WEEKLY',   label: 'Weekly' },
  { value: 'MONTHLY',  label: 'Monthly' },
];

const isNonMonetary = (type) => {
  if (!type) return false;
  const name = (type.name || '').toLowerCase();
  return name.includes('non') || name.includes('item');
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
      newErrors.name = 'Group name is required.';
      valid = false;
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Group name must be at most 100 characters.';
      valid = false;
    }

    const amount = parseFloat(formData.contributionAmount);
    if (!formData.contributionAmount || isNaN(amount) || amount <= 0) {
      newErrors.contributionAmount = 'Contribution amount must be greater than 0.';
      valid = false;
    }

    const count = parseInt(formData.memberCount);
    if (!formData.memberCount || isNaN(count) || count < 2) {
      newErrors.memberCount = 'Number of members must be at least 2.';
      valid = false;
    }

    if (!formData.cycleFrequency) {
      newErrors.cycleFrequency = 'Cycle frequency is required.';
      valid = false;
    }

    if (!formData.seettuTypeId) {
      newErrors.seettuTypeId = 'Seettu type is required.';
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
      setSubmitError(getErrorMessage(err, 'Failed to create group. Please check your form inputs.'));
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
      setShopError('Failed to register shop. Please try again.');
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
              {t('create_group_page.title', 'Create Group')}
            </h4>
            <p className="mb-0 text-white-50 mt-1" style={{ fontSize: '0.85rem' }}>
              {t('create_group_page.subtitle', 'Configure contribution terms, member capacity, and Seettu type')}
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
                  {t('create_group_page.group_name', 'Group Name')} <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="e.g. Gold Saver Circle Q4"
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
                  {t('create_group_page.description', 'Description')}
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Explain group rules, purpose, or terms…"
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
                    {t('create_group_page.contribution_amount', 'Contribution Amount (LKR)')} <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className={`form-control ${errors.contributionAmount ? 'is-invalid' : ''}`}
                    placeholder="e.g. 10000"
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
                    {t('create_group_page.member_count', 'Number of Members')} <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className={`form-control ${errors.memberCount ? 'is-invalid' : ''}`}
                    placeholder="e.g. 12"
                    value={formData.memberCount}
                    min="2"
                    onChange={e => handleChange('memberCount', e.target.value)}
                    style={{ borderRadius: '8px' }}
                  />
                  {errors.memberCount && <div className="invalid-feedback">{errors.memberCount}</div>}
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-medium text-secondary" style={{ fontSize: '0.875rem' }}>
                    {t('create_group_page.cycle_frequency', 'Cycle Frequency')} <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${errors.cycleFrequency ? 'is-invalid' : ''}`}
                    value={formData.cycleFrequency}
                    onChange={e => handleChange('cycleFrequency', e.target.value)}
                    style={{ borderRadius: '8px' }}
                  >
                    {CYCLE_FREQUENCIES.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                  {errors.cycleFrequency && <div className="invalid-feedback">{errors.cycleFrequency}</div>}
                </div>
              </div>

              {/* Seettu Type */}
              <div className="mb-3">
                <label className="form-label fw-medium text-secondary" style={{ fontSize: '0.875rem' }}>
                  {t('create_group_page.seettu_type', 'Seettu Type')} <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-select ${errors.seettuTypeId ? 'is-invalid' : ''}`}
                  value={formData.seettuTypeId}
                  onChange={e => handleChange('seettuTypeId', e.target.value)}
                  style={{ borderRadius: '8px' }}
                >
                  <option value="">-- Select Seettu Type --</option>
                  {seettuTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
                {errors.seettuTypeId && <div className="invalid-feedback">{errors.seettuTypeId}</div>}
                {selectedType?.description && (
                  <div className="form-text text-muted mt-1" style={{ fontSize: '0.8rem' }}>
                    {selectedType.description}
                  </div>
                )}
              </div>

              {/* Category (optional) */}
              <div className="mb-3">
                <label className="form-label fw-medium text-secondary" style={{ fontSize: '0.875rem' }}>
                  {t('create_group_page.group_category', 'Category')}
                  <span className="text-muted ms-1" style={{ fontSize: '0.78rem' }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Community, Business, Emergency…"
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
                      {t('create_group_page.associated_shop', 'Associated Shop')}
                      <span className="text-muted ms-1" style={{ fontSize: '0.78rem' }}>(Optional)</span>
                    </label>
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold"
                      style={{ fontSize: '0.8rem', color: '#235665' }}
                      onClick={() => setShowAddShopModal(true)}
                    >
                      + Register Shop
                    </button>
                  </div>
                  <select
                    className="form-select"
                    value={formData.shopId}
                    onChange={e => handleChange('shopId', e.target.value)}
                    style={{ borderRadius: '8px' }}
                  >
                    <option value="">None / Independent Group</option>
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
                  {t('common.cancel', 'Cancel')}
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
                      {t('create_group_page.creating', 'Creating…')}
                    </>
                  ) : (
                    t('create_group_page.submit', 'Create Group')
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
                  <h5 className="modal-title fw-bold mb-0">Register Partner Merchant Shop</h5>
                  <small className="text-white-50">Onboard a verified retail merchant for Non-Monetary Seettu</small>
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
                        Shop / Merchant Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Lalitha Jewellery (Pvt) Ltd"
                        value={newShopName}
                        onChange={e => setNewShopName(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-secondary fw-medium small mb-1">Shop Owner Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. M. K. Perera"
                        value={newShopOwnerName}
                        onChange={e => setNewShopOwnerName(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-secondary fw-medium small mb-1">
                        Shop Type <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={newShopType}
                        onChange={e => setNewShopType(e.target.value)}
                      >
                        <option value="GOLD_JEWELLERY">Gold &amp; Jewellery</option>
                        <option value="ELECTRONICS">Electronics &amp; Appliances</option>
                        <option value="VEHICLES_MOTORS">Vehicles &amp; Motorbikes</option>
                        <option value="GROCERY_PROVISIONS">Grocery &amp; Wholesale Provisions</option>
                        <option value="HARDWARE_CONSTRUCTION">Hardware &amp; Building Materials</option>
                        <option value="GENERAL_MERCHANT">General Partner Merchant</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-secondary fw-medium small mb-1">Business Registration No.</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. PV-123456"
                        value={newShopRegisterNumber}
                        onChange={e => setNewShopRegisterNumber(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-secondary fw-medium small mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="e.g. +94 11 234 5678"
                        value={newShopContact}
                        onChange={e => setNewShopContact(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-secondary fw-medium small mb-1">Official Email</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="e.g. orders@shop.lk"
                        value={newShopEmail}
                        onChange={e => setNewShopEmail(e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary fw-medium small mb-1">Store Address</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. No. 125, Sea Street, Colombo 11"
                        value={newShopAddress}
                        onChange={e => setNewShopAddress(e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary fw-medium small mb-1">Description / Notes</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="e.g. Authorized 22K gold coin dealer."
                        value={newShopDescription}
                        onChange={e => setNewShopDescription(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top p-3 bg-light">
                  <button type="button" className="btn btn-secondary px-3" onClick={() => setShowAddShopModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4 fw-bold"
                    style={{ backgroundColor: '#235665', borderColor: '#235665' }}
                    disabled={savingShop || !newShopName.trim()}
                  >
                    {savingShop ? 'Registering…' : 'Register Shop'}
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
