
import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

function CandidateDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    try {
      setLoading(true);
      setError('');
      const data = await api.get('/applications');
      setApplications(data.applications || []);
    } catch (err) {
      setError(err.message || 'Unable to load your applications.');
    } finally {
      setLoading(false);
    }
  }

  const stages = [
    'APPLIED',
    'SCREENING',
    'INTERVIEW',
    'SELECTED',
    'OFFERED',
    'REJECTED',
    'WITHDRAWN',
  ];

  const counts = stages.map((stage) => ({
    stage,
    count: applications.filter((application) => application.stage === stage).length,
  }));

  return (
    <div className="hr-page">
      <div className="hr-page-heading">
        <div>
          <p className="eyebrow">CANDIDATE WORKSPACE</p>
          <h1>My Dashboard</h1>
          <p className="muted">Track your recruitment progress and applications.</p>
        </div>
        <button className="primary-button" onClick={loadApplications}>
          Refresh
        </button>
      </div>

      {error && <div className="hr-alert error">{error}</div>}

      <div className="hr-stat-grid candidate-stat-grid">
        <article className="metric-card">
          <span className="muted">Total applications</span>
          <strong>{loading ? '...' : applications.length}</strong>
        </article>
        <article className="metric-card">
          <span className="muted">In screening</span>
          <strong>{loading ? '...' : counts.find((item) => item.stage === 'SCREENING').count}</strong>
        </article>
        <article className="metric-card">
          <span className="muted">Interviews</span>
          <strong>{loading ? '...' : counts.find((item) => item.stage === 'INTERVIEW').count}</strong>
        </article>
        <article className="metric-card">
          <span className="muted">Offers</span>
          <strong>{loading ? '...' : counts.find((item) => item.stage === 'OFFERED').count}</strong>
        </article>
      </div>

      <section className="panel hr-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">APPLICATION PROGRESS</p>
            <h2>My application stages</h2>
          </div>
        </div>

        {loading ? (
          <p className="muted">Loading application progress...</p>
        ) : (
          <div className="candidate-stage-grid">
            {counts.map((item) => (
              <div className="candidate-stage-card" key={item.stage}>
                <span className={`stage-badge ${item.stage.toLowerCase()}`}>
                  {item.stage}
                </span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel hr-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">RECENT ACTIVITY</p>
            <h2>My applications</h2>
          </div>
        </div>

        {loading ? (
          <p className="muted">Loading applications...</p>
        ) : applications.length === 0 ? (
          <p className="empty-state">You have not submitted any applications yet.</p>
        ) : (
          <div className="hr-table-wrap">
            <table className="hr-table">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Job ID</th>
                  <th>Applied on</th>
                  <th>Current stage</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td>#{application.id}</td>
                    <td>{application.jobId}</td>
                    <td>
                      {application.appliedAt
                        ? new Date(application.appliedAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td>
                      <span className={`stage-badge ${application.stage?.toLowerCase()}`}>
                        {application.stage}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default CandidateDashboard;
