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
      setError('⚠️ Contribution Amount Guidance: Contribution amount must be greater than 0 LKR.');
      return;
    }

    if (parseInt(formData.memberCount) < 2) {
      setError('⚠️ Member Count Guidance: Seettu groups require at least 2 members.');
      return;
    }

    setLoading(true);
    const creatorId = user?.userId || user?.id;
    try {
      await createGroup({
        ...formData,
        contributionAmount: parseFloat(formData.contributionAmount),
        memberCount: parseInt(formData.memberCount),
        seettuTypeId: formData.seettuTypeId ? parseInt(formData.seettuTypeId) : null,
        shopId: formData.shopId ? parseInt(formData.shopId) : null
      }, creatorId);
      navigate('/groups');
    } catch (err) {
      const guidance = getErrorMessage(err, 'Failed to create group. Please check form parameters.');
      setError(`⚠️ Group Creation Error Guidance: ${guidance}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center py-3">
      <div className="col-md-8">
        <div className="card shadow-lg border-0">
          <div className="card-header bg-primary text-white p-4">
            <h4 className="mb-0 fw-bold">➕ {t('create_group') || 'Create New Seettu Group'}</h4>
            <p className="mb-0 text-white-50 small mt-1">Configure contribution terms, member capacity, Seettu type, and shop details</p>
          </div>
          <div className="card-body p-4 p-md-5">
            {error && (
              <div className="alert alert-danger shadow-sm border-0 mb-4 p-3">
                <div className="fw-bold">{error}</div>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label className="form-label">Group Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Gold Saver Circle Q4"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="GENERAL">General Monetary</option>
                    <option value="GOLD">Gold & Jewelry</option>
                    <option value="FURNITURE">Furniture & Home</option>
                    <option value="VEHICLE">Vehicle Savings</option>
                  </select>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label className="form-label">Seettu Type (Monetary / Non-Monetary)</label>
                  <select
                    className="form-select"
                    value={formData.seettuTypeId}
                    onChange={e => setFormData({...formData, seettuTypeId: e.target.value})}
                    required
                  >
                    {seettuTypes.map(st => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.description})
                      </option>
                    ))}
                    {seettuTypes.length === 0 && (
                      <>
                        <option value="1">Monetary (Traditional cash-based Seettu)</option>
                        <option value="2">Non-Monetary (Item-based Seettu)</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Associated Shop (Optional)</label>
                  <select
                    className="form-select"
                    value={formData.shopId}
                    onChange={e => setFormData({...formData, shopId: e.target.value})}
                  >
                    <option value="">None / Independent Group</option>
                    {shops.map(shop => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name} {shop.address ? `(${shop.address})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Explain group rules, auction conditions, or purpose..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              
              <div className="row mb-4">
                <div className="col-md-4 mb-3 mb-md-0">
                  <label className="form-label">Contribution Amount (LKR)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 10000"
                    value={formData.contributionAmount}
                    onChange={e => setFormData({...formData, contributionAmount: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3 mb-md-0">
                  <label className="form-label">Member Count</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 12"
                    value={formData.memberCount}
                    onChange={e => setFormData({...formData, memberCount: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Cycle Frequency</label>
                  <select className="form-select" value={formData.cycleFrequency} onChange={e => setFormData({...formData, cycleFrequency: e.target.value})}>
                    <option value="WEEKLY">Weekly</option>
                    <option value="BI_WEEKLY">Bi-Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold shadow-sm" disabled={loading}>
                {loading ? 'Creating Group...' : (t('submit') || 'Create Group')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
