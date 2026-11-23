
import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

const stages = [
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'SELECTED',
  'OFFERED',
  'REJECTED',
  'WITHDRAWN',
];

function HRApplications() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [updating, setUpdating] = useState(false);

  async function loadApplications() {
    try {
      setLoading(true);
      setError('');
      const data = await api.get('/applications');
      setApplications(data.applications || []);
    } catch (err) {
      setError(err.message || 'Unable to load applications.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  async function openHistory(application) {
    setSelected(application);
    setHistory([]);
    setMessage('');
    try {
      const data = await api.get(`/applications/${application.id}/history`);
      setHistory(data.history || []);
    } catch (err) {
      setError(err.message || 'Unable to load application history.');
    }
  }

  async function updateStage(applicationId, newStage) {
    try {
      setUpdating(true);
      setError('');
      setMessage('');
      await api.patch(`/applications/${applicationId}/stage`, {
        stage: newStage,
        note: `Stage updated to ${newStage}`,
      });
      setMessage('Application stage updated successfully.');
      await loadApplications();

      if (selected?.id === applicationId) {
        const updated = await api.get(`/applications/${applicationId}`);
        const application = updated.application;
        setSelected(application);
        const historyData = await api.get(`/applications/${applicationId}/history`);
        setHistory(historyData.history || []);
      }
    } catch (err) {
      setError(err.message || 'Unable to update application stage.');
    } finally {
      setUpdating(false);
    }
  }

  const filteredApplications =
    filter === 'ALL'
      ? applications
      : applications.filter((application) => application.stage === filter);

  const counts = stages.reduce((result, stage) => {
    result[stage] = applications.filter((app) => app.stage === stage).length;
    return result;
  }, {});

  function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  }

  return (
    <div className="hr-page">
      <div className="hr-page-heading">
        <div>
          <p className="eyebrow">RECRUITMENT / APPLICATIONS</p>
          <h1>Application Pipeline</h1>
          <p className="muted">Review applicants and track their recruitment progress.</p>
        </div>
        <button className="primary-button" onClick={loadApplications}>
          Refresh
        </button>
      </div>

      {error && <div className="hr-alert error">{error}</div>}
      {message && <div className="hr-alert success">{message}</div>}

      <div className="hr-stat-grid">
        <article className="metric-card">
          <span className="muted">Total applications</span>
          <strong>{applications.length}</strong>
        </article>
        <article className="metric-card">
          <span className="muted">In screening</span>
          <strong>{counts.SCREENING || 0}</strong>
        </article>
        <article className="metric-card">
          <span className="muted">Interviews</span>
          <strong>{counts.INTERVIEW || 0}</strong>
        </article>
        <article className="metric-card">
          <span className="muted">Selected</span>
          <strong>{counts.SELECTED || 0}</strong>
        </article>
      </div>

      <section className="panel hr-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">CANDIDATE TRACKING</p>
            <h2>Applications</h2>
          </div>
          <select
            className="hr-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter applications by stage"
          >
            <option value="ALL">All stages</option>
            {stages.map((stage) => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="muted">Loading applications...</p>
        ) : filteredApplications.length === 0 ? (
          <div className="empty-state">
            No applications found for this stage.
          </div>
        ) : (
          <div className="hr-table-wrap">
            <table className="hr-table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Candidate ID</th>
                  <th>Job ID</th>
                  <th>Applied on</th>
                  <th>Current stage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((application) => (
                  <tr key={application.id}>
                    <td>#{application.id}</td>
                    <td>{application.candidateId}</td>
                    <td>{application.jobId}</td>
                    <td>{formatDate(application.appliedAt)}</td>
                    <td>
                      <span className={`stage-badge ${application.stage?.toLowerCase()}`}>
                        {application.stage}
                      </span>
                    </td>
                    <td>
                      <div className="hr-row-actions">
                        <button
                          className="small-action"
                          onClick={() => openHistory(application)}
                        >
                          History
                        </button>
                        <select
                          className="hr-stage-select"
                          value={application.stage}
                          disabled={updating}
                          aria-label={`Change stage for application ${application.id}`}
                          onChange={(event) =>
                            updateStage(application.id, event.target.value)
                          }
                        >
                          {stages.map((stage) => (
                            <option key={stage} value={stage}>{stage}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <section className="panel hr-panel history-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">APPLICATION DETAILS</p>
              <h2>Application #{selected.id} history</h2>
            </div>
            <button className="small-action" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>

          <div className="application-detail-grid">
            <div>
              <span className="muted">Candidate ID</span>
              <strong>{selected.candidateId}</strong>
            </div>
            <div>
              <span className="muted">Job ID</span>
              <strong>{selected.jobId}</strong>
            </div>
            <div>
              <span className="muted">Current stage</span>
              <strong>{selected.stage}</strong>
            </div>
          </div>

          <h3>Cover letter</h3>
          <p className="cover-letter">
            {selected.coverLetter || 'No cover letter provided.'}
          </p>

          <h3>Stage history</h3>
          {history.length === 0 ? (
            <p className="muted">No history entries available.</p>
          ) : (
            <div className="history-list">
              {history.map((entry) => (
                <div className="history-item" key={entry.id}>
                  <span className="history-marker" />
                  <div>
                    <strong>
                      {entry.previousStage || 'START'} → {entry.newStage}
                    </strong>
                    <p className="muted">{entry.note || 'Stage updated'}</p>
                    <small>{formatDate(entry.changedAt)}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default HRApplications;
