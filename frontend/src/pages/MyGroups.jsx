import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { getGroupsByUser } from '../api/groupApi';

const MyGroups = () => {
  const { t } = useTranslation();
  const { user, isOrganizer, isAdmin } = useAuth();
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const userId = user?.userId || user?.id;

  useEffect(() => {
    const fetchGroups = async () => {
      if (!userId) return;
      try {
        const res = await getGroupsByUser(userId);
        setGroups(res.data || []);
      } catch (error) {
        console.error('Failed to load groups', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [userId]);

  const filteredGroups = groups.filter(g =>
    g.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Loading your Seettu groups...</p>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">{t('my_groups') || 'My Seettu Groups'}</h2>
          <p className="text-muted mb-0">View, join, and manage active financial contribution pools</p>
        </div>
        {(isOrganizer || isAdmin) && (
          <Link to="/groups/create" className="btn btn-primary shadow-sm">
            ➕ {t('create_group') || 'Create New Group'}
          </Link>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="card shadow-sm border-0 mb-4 p-3 bg-white">
        <div className="row align-items-center">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Search groups by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {filteredGroups.length === 0 ? (
        <div className="card text-center p-5 shadow-sm border-0">
          <div style={{ fontSize: '3rem' }}>👥</div>
          <h5 className="fw-bold mt-3">No Groups Found</h5>
          <p className="text-muted">You are currently not enrolled in any Seettu group matching your query.</p>
          {(isOrganizer || isAdmin) && (
            <div>
              <Link to="/groups/create" className="btn btn-primary">
                Create First Group
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="row g-4">
          {filteredGroups.map(group => {
            const memberCount = group.members?.length || 0;
            const targetCount = group.memberCount || 10;
            const progressPercent = Math.min(100, Math.round((memberCount / targetCount) * 100));

            return (
              <div key={group.id} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-header bg-white border-bottom-0 pb-0 pt-4 d-flex justify-content-between align-items-start">
                    <span className="badge bg-primary-subtle text-primary border fw-bold">
                      {group.category || 'GENERAL'}
                    </span>
                    <span className={`badge ${group.status === 'ACTIVE' ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {group.status || 'ACTIVE'}
                    </span>
                  </div>
                  <div className="card-body">
                    <h5 className="card-title fw-bold text-dark mb-2">{group.name}</h5>
                    <p className="card-text text-muted small mb-3">{group.description || 'No description provided.'}</p>
                    
                    <div className="p-3 bg-light rounded-3 mb-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small">Contribution:</span>
                        <strong className="text-primary fw-bold">LKR {(group.contributionAmount || 0).toLocaleString()}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small">Frequency:</span>
                        <strong className="text-dark">{group.cycleFrequency || 'MONTHLY'}</strong>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small">Members:</span>
                        <span className="fw-bold text-dark small">{memberCount} / {targetCount}</span>
                      </div>
                      <div className="progress mt-2" style={{ height: '6px' }}>
                        <div
                          className="progress-bar bg-primary"
                          role="progressbar"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    <Link to={`/groups/${group.id}`} className="btn btn-outline-primary w-100 fw-bold">
                      View Group Details →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyGroups;
