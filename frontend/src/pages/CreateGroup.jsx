import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { createGroup } from '../api/groupApi';
import api from '../api/axios';
import { getErrorMessage } from '../utils/errorHandler';

const CreateGroup = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    groupModel: 'FIXED_ROTATION',
    contributionAmount: '',
    memberCount: '',
    cycleFrequency: 'MONTHLY',
    category: 'GENERAL',
    seettuTypeId: '1',
    shopId: ''
  });
  
  const [seettuTypes, setSeettuTypes] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showAddShopModal, setShowAddShopModal] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [newShopAddress, setNewShopAddress] = useState('');
  const [savingShop, setSavingShop] = useState(false);
  const [shopError, setShopError] = useState('');

  const handleModelChange = (model) => {
    const isNonMonetary = model === 'NON_MONETARY';
    setFormData(prev => ({
      ...prev,
      groupModel: model,
      category: isNonMonetary ? 'GOLD' : 'GENERAL',
      seettuTypeId: isNonMonetary ? '2' : '1',
      shopId: isNonMonetary ? prev.shopId : ''
    }));
  };

  const handleCreateShop = async (e) => {
    e.preventDefault();
    if (!newShopName.trim()) return;
    setSavingShop(true);
    setShopError('');
    try {
      const ownerId = user?.userId || user?.id || 2;
      const res = await api.post(`/shops?name=${encodeURIComponent(newShopName.trim())}&address=${encodeURIComponent(newShopAddress.trim())}&ownerId=${ownerId}`);
      const created = res.data?.data || res.data;
      if (created && created.id) {
        setShops(prev => [...prev, created]);
        setFormData(prev => ({ ...prev, shopId: String(created.id) }));
        setShowAddShopModal(false);
        setNewShopName('');
        setNewShopAddress('');
      }
    } catch (err) {
      setShopError('Failed to register partner merchant shop. Please try again.');
    } finally {
      setSavingShop(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typeRes, shopRes] = await Promise.all([
          api.get('/seettu-types'),
          api.get('/shops')
        ]);
        setSeettuTypes(typeRes.data.data || []);
        setShops(shopRes.data.data || []);
      } catch (err) {
        console.error('Failed to load types/shops', err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (parseFloat(formData.contributionAmount) <= 0) {
      setError('Contribution amount must be greater than 0 LKR.');
      return;
    }

    if (parseInt(formData.memberCount) < 2) {
      setError('Seettu groups require at least 2 members.');
      return;
    }

    setLoading(true);
    const creatorId = user?.userId || user?.id;
    try {
      const modelPrefix = {
        FIXED_ROTATION: '[Fixed Rotation] ',
        AUCTION: '[Auction / Bidding] ',
        RANDOM_DRAW: '[Random Draw] ',
        NON_MONETARY: '[Non-Monetary Asset] '
      }[formData.groupModel] || '';

      const finalDescription = formData.description 
        ? `${modelPrefix}${formData.description}` 
        : modelPrefix.trim();

      await createGroup({
        name: formData.name,
        description: finalDescription,
        category: formData.groupModel,
        contributionAmount: parseFloat(formData.contributionAmount),
        memberCount: parseInt(formData.memberCount),
        cycleFrequency: formData.cycleFrequency,
        seettuTypeId: formData.groupModel === 'NON_MONETARY' ? 2 : 1,
        shopId: formData.shopId ? parseInt(formData.shopId) : null
      }, creatorId);
      navigate('/groups');
    } catch (err) {
      const guidance = getErrorMessage(err, 'Failed to create group. Please check form parameters.');
      setError(`Group Creation Error: ${guidance}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center py-4">
      <div className="col-12 col-lg-8 col-xl-7">
        <div className="card shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          {/* Header Banner matching theme color pattern */}
          <div className="p-4" style={{ backgroundColor: '#235665', color: '#FFFFFF' }}>
            <div className="d-flex align-items-center mb-1">
              <h4 className="mb-0 fw-bold text-white" style={{ fontSize: '1.25rem' }}>Create Group</h4>
            </div>
            <p className="mb-0 text-white-50" style={{ fontSize: '0.85rem' }}>
              Configure contribution terms, member capacity, Seettu type, and shop details
            </p>
          </div>

          <div className="card-body p-4 p-md-4">
            {error && (
              <div className="alert alert-danger shadow-sm border-0 mb-4 p-3 rounded-3">
                <div className="fw-bold">{error}</div>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Group Name & Seettu Model */}
              <div className="row mb-3">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>Group Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Gold Saver Circle Q4"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    style={{ borderRadius: '8px', border: '1px solid #D1D5DB' }}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>
                    Seettu Model <span className="text-danger">*</span>
                  </label>
                  <select 
                    className="form-select fw-semibold" 
                    value={formData.groupModel} 
                    onChange={e => handleModelChange(e.target.value)}
                    style={{ borderRadius: '8px', border: '1px solid #235665', backgroundColor: '#F0F9FA' }}
                  >
                    <option value="FIXED_ROTATION">Fixed Rotation Seettu (Predetermined queue)</option>
                    <option value="AUCTION">Auction / Bidding Seettu (Discount bidding & dividends)</option>
                    <option value="RANDOM_DRAW">Random Draw / Lottery (Algorithmic lot selection)</option>
                    <option value="NON_MONETARY">Non-Monetary Asset Seettu (Physical goods & shops)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Model Guidance Banner */}
              <div className="alert alert-info py-2 px-3 mb-3 small border-0 bg-info-subtle text-info-emphasis rounded-3">
                {formData.groupModel === 'FIXED_ROTATION' && (
                  <span><strong>Fixed Rotation Seettu:</strong> Members take turns in a predetermined rotational order to receive the standard pooled lump-sum.</span>
                )}
                {formData.groupModel === 'AUCTION' && (
                  <span><strong>Auction / Bidding Seettu:</strong> Members submit competitive discount bids for early pot access. The discount is redistributed as monthly dividends to reduce other subscribers' installments.</span>
                )}
                {formData.groupModel === 'RANDOM_DRAW' && (
                  <span><strong>Random Draw / Lottery:</strong> Neutral algorithmic lot selection chooses the winning payout recipient fairly each cycle from eligible non-prizewinners.</span>
                )}
                {formData.groupModel === 'NON_MONETARY' && (
                  <span><strong>Non-Monetary Asset Seettu:</strong> Rotating savings pool for tangible high-value physical goods (jewelry, electronics, machinery) backed by a registered partner merchant shop.</span>
                )}
              </div>

              {/* Category & Shop Configuration */}
              <div className="row mb-3">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>
                    {formData.groupModel === 'NON_MONETARY' ? 'Physical Asset Category' : 'Group Category'}
                  </label>
                  <select 
                    className="form-select" 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    style={{ borderRadius: '8px', border: '1px solid #D1D5DB' }}
                  >
                    {formData.groupModel === 'NON_MONETARY' ? (
                      <>
                        <option value="GOLD">Gold & Jewelry (Sovereign)</option>
                        <option value="FURNITURE">Furniture & Home Goods</option>
                        <option value="VEHICLE">Vehicle & Auto Equipment</option>
                        <option value="APPLIANCES">Electronics & Appliances</option>
                      </>
                    ) : (
                      <>
                        <option value="GENERAL">General Monetary</option>
                        <option value="EMERGENCY">Emergency Liquidity Pool</option>
                        <option value="BUSINESS">Business Working Capital</option>
                        <option value="COMMUNITY">Community Self-Help Circle</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="col-md-6">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label text-secondary fw-medium mb-0" style={{ fontSize: '0.875rem' }}>
                      {formData.groupModel === 'NON_MONETARY' ? 'Partner Merchant Shop (Mandatory)' : 'Associated Shop (Optional)'}
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
                    onChange={e => setFormData({...formData, shopId: e.target.value})}
                    style={{ borderRadius: '8px', border: '1px solid #D1D5DB' }}
                    required={formData.groupModel === 'NON_MONETARY'}
                  >
                    <option value="">{formData.groupModel === 'NON_MONETARY' ? '-- Select Partner Merchant Shop --' : 'None / Independent Group'}</option>
                    {shops.map(shop => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name} {shop.address ? `(${shop.address})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Explain group rules, auction conditions, or purpose..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  style={{ borderRadius: '8px', border: '1px solid #D1D5DB' }}
                ></textarea>
              </div>
              
              <div className="row mb-4">
                <div className="col-md-4 mb-3 mb-md-0">
                  <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>Contribution Amount (LKR)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 10000"
                    value={formData.contributionAmount}
                    onChange={e => setFormData({...formData, contributionAmount: e.target.value})}
                    style={{ borderRadius: '8px', border: '1px solid #D1D5DB' }}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3 mb-md-0">
                  <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>Member Count</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 12"
                    value={formData.memberCount}
                    onChange={e => setFormData({...formData, memberCount: e.target.value})}
                    style={{ borderRadius: '8px', border: '1px solid #D1D5DB' }}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-secondary fw-medium" style={{ fontSize: '0.875rem' }}>Cycle Frequency</label>
                  <select 
                    className="form-select" 
                    value={formData.cycleFrequency} 
                    onChange={e => setFormData({...formData, cycleFrequency: e.target.value})}
                    style={{ borderRadius: '8px', border: '1px solid #D1D5DB' }}
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="BI_WEEKLY">Bi-Weekly</option>
                  </select>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-teal w-100 fw-bold shadow-sm py-2 text-white" 
                disabled={loading}
                style={{ backgroundColor: '#235665', borderRadius: '8px', fontSize: '1rem' }}
              >
                {loading ? 'Creating Group...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Register Partner Merchant Shop Modal */}
      {showAddShopModal && (
        <div className="modal show d-block tab-index-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div className="modal-header text-white" style={{ backgroundColor: '#235665' }}>
                <div>
                  <h5 className="modal-title fw-bold mb-0">Register Partner Merchant Shop</h5>
                  <small className="text-white-50">Onboard verified retail merchant for Non-Monetary Asset Seettu</small>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddShopModal(false)}></button>
              </div>
              <form onSubmit={handleCreateShop}>
                <div className="modal-body p-4">
                  {shopError && (
                    <div className="alert alert-danger py-2 px-3 mb-3 small border-0 rounded-3">
                      {shopError}
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium small">Shop / Merchant Showroom Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Lalitha Jewellery (Pvt) Ltd, Singer Mega"
                      value={newShopName}
                      onChange={e => setNewShopName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-medium small">Showroom / Branch Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. No. 125, Sea Street, Colombo 11"
                      value={newShopAddress}
                      onChange={e => setNewShopAddress(e.target.value)}
                    />
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>Members collect physical assets and official commercial warranties at this address.</small>
                  </div>
                </div>
                <div className="modal-footer border-top p-3 bg-light">
                  <button type="button" className="btn btn-secondary px-3" onClick={() => setShowAddShopModal(false)}>Cancel</button>
                  <button 
                    type="submit" 
                    className="btn btn-primary px-4 fw-bold shadow-sm"
                    style={{ backgroundColor: '#235665', borderColor: '#235665' }}
                    disabled={savingShop || !newShopName.trim()}
                  >
                    {savingShop ? 'Registering...' : 'Register Shop'}
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
