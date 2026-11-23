
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

function HRSearch() {
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    jobId: '',
    stage: '',
    fromDate: '',
    toDate: '',
  });
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function searchApplications(page = 1) {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value.trim()) params.set(key, value.trim());
      });
      params.set('page', String(page));
      params.set('limit', '10');

      const data = await api.get(`/applications/search?${params.toString()}`);
      setApplications(data.applications || []);
      setPagination(data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    } catch (err) {
      setError(err.message || 'Unable to search applications.');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    searchApplications(1);
  }, []);

  function updateFilter(event) {
    setFilters((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  }

  function clearFilters() {
    setFilters({
      name: '',
      email: '',
      jobId: '',
      stage: '',
      fromDate: '',
      toDate: '',
    });
  }

  function handleSearch(event) {
    event.preventDefault();
    searchApplications(1);
  }

  function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  }

  return (
    <div className="hr-page">
      <div className="hr-page-heading">
        <div>
          <p className="eyebrow">RECRUITMENT / SEARCH</p>
          <h1>Find Applications</h1>
          <p className="muted">
            Search and filter candidates across your recruitment pipeline.
          </p>
        </div>
        <button
          className="primary-button"
          onClick={() => searchApplications(pagination.page)}
        >
          Refresh results
        </button>
      </div>

      {error && <div className="hr-alert error">{error}</div>}

      <section className="panel hr-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">ADVANCED FILTERS</p>
            <h2>Search criteria</h2>
          </div>
        </div>

        <form className="hr-search-form" onSubmit={handleSearch}>
          <label>
            Candidate name
            <input
              name="name"
              value={filters.name}
              onChange={updateFilter}
              placeholder="Enter candidate name"
            />
          </label>

          <label>
            Email address
            <input
              name="email"
              type="email"
              value={filters.email}
              onChange={updateFilter}
              placeholder="Enter email address"
            />
          </label>

          <label>
            Job ID
            <input
              name="jobId"
              type="number"
              min="1"
              value={filters.jobId}
              onChange={updateFilter}
              placeholder="Enter job ID"
            />
          </label>

          <label>
            Application stage
            <select name="stage" value={filters.stage} onChange={updateFilter}>
              <option value="">All stages</option>
              {stages.map((stage) => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </label>

          <label>
            Applied from
            <input
              name="fromDate"
              type="date"
              value={filters.fromDate}
              onChange={updateFilter}
            />
          </label>

          <label>
            Applied until
            <input
              name="toDate"
              type="date"
              value={filters.toDate}
              onChange={updateFilter}
            />
          </label>

          <div className="hr-search-actions">
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'Search applications'}
            </button>
            <button
              className="small-action"
              type="button"
              onClick={() => {
                clearFilters();
                setTimeout(() => searchApplications(1), 0);
              }}
            >
              Clear filters
            </button>
          </div>
        </form>
      </section>

      <section className="panel hr-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">SEARCH RESULTS</p>
            <h2>Matching applications</h2>
          </div>
          <span className="activity-count">
            {pagination.total} results
          </span>
        </div>

        {loading ? (
          <p className="muted">Searching applications...</p>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            No matching applications found. Try changing your filters.
          </div>
        ) : (
          <>
            <div className="hr-table-wrap">
              <table className="hr-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Email</th>
                    <th>Job ID</th>
                    <th>Applied on</th>
                    <th>Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td>
                        <strong>{application.candidateName}</strong>
                        <small className="search-app-id">
                          Application #{application.id}
                        </small>
                      </td>
                      <td>{application.candidateEmail}</td>
                      <td>{application.jobId}</td>
                      <td>{formatDate(application.appliedAt)}</td>
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

            <div className="hr-pagination">
              <span className="muted">
                Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
                {' · '}{pagination.total} applications
              </span>
              <div>
                <button
                  className="small-action"
                  disabled={pagination.page <= 1 || loading}
                  onClick={() => searchApplications(pagination.page - 1)}
                >
                  Previous
                </button>
                <button
                  className="small-action"
                  disabled={
                    pagination.page >= pagination.totalPages || loading
                  }
                  onClick={() => searchApplications(pagination.page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default HRSearch;
