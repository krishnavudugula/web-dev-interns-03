
import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';

const emptyForm = {
  title: '',
  description: '',
  requirements: '',
  location: '',
  employmentType: '',
  closesAt: '',
};

const statuses = ['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'];

function HRJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadJobs() {
    try {
      setLoading(true);
      setError('');
      const result = await api.get('/jobs');
      setJobs(result.jobs || []);
    } catch (err) {
      setError(err.message || 'Unable to load jobs.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        `${job.title || ''} ${job.location || ''} ${job.employmentType || ''}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  }

  function openEditForm(job) {
    setEditingId(job.id);
    setForm({
      title: job.title || '',
      description: job.description || '',
      requirements: job.requirements || '',
      location: job.location || '',
      employmentType: job.employmentType || '',
      closesAt: job.closesAt
        ? String(job.closesAt).slice(0, 10)
        : '',
    });
    setError('');
    setShowForm(true);
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');

      const payload = {
        ...form,
        closesAt: form.closesAt || null,
      };

      if (editingId) {
        await api.patch(`/jobs/${editingId}`, payload);
      } else {
        await api.post('/jobs', payload);
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      await loadJobs();
    } catch (err) {
      setError(err.message || 'Unable to save the job.');
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(job, status) {
    const confirmed = window.confirm(
      `Change "${job.title}" status to ${status}?`
    );

    if (!confirmed) return;

    try {
      setError('');
      await api.post(`/jobs/${job.id}/status`, { status });
      await loadJobs();
    } catch (err) {
      setError(err.message || 'Unable to update job status.');
    }
  }

  function formatDate(date) {
    if (!date) return 'Not specified';

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return 'Not specified';

    return parsed.toLocaleDateString();
  }

  const activeCount = jobs.filter(
    (job) => job.status === 'PUBLISHED'
  ).length;

  const draftCount = jobs.filter(
    (job) => job.status === 'DRAFT'
  ).length;

  const closedCount = jobs.filter(
    (job) => job.status === 'CLOSED'
  ).length;

  return (
    <div className="jobs-page">
      <div className="jobs-heading">
        <div>
          <p className="eyebrow">RECRUITMENT / JOB MANAGEMENT</p>
          <h1>Manage jobs</h1>
          <p className="muted">
            Create, update and manage your recruitment opportunities.
          </p>
        </div>

        <button className="primary-button" onClick={openCreateForm}>
          + Create new job
        </button>
      </div>

      <div className="jobs-stats">
        <article className="jobs-stat-card">
          <span>Total jobs</span>
          <strong>{jobs.length}</strong>
        </article>
        <article className="jobs-stat-card">
          <span>Published</span>
          <strong>{activeCount}</strong>
        </article>
        <article className="jobs-stat-card">
          <span>Drafts</span>
          <strong>{draftCount}</strong>
        </article>
        <article className="jobs-stat-card">
          <span>Closed</span>
          <strong>{closedCount}</strong>
        </article>
      </div>

      <section className="panel jobs-list-panel">
        <div className="jobs-toolbar">
          <div>
            <h2>All job positions</h2>
            <p className="muted">
              View and manage your company's job openings.
            </p>
          </div>

          <div className="jobs-filters">
            <input
              type="search"
              placeholder="Search jobs..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search jobs"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by job status"
            >
              <option value="ALL">All statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="jobs-error">{error}</div>}

        {loading ? (
          <p className="jobs-message">Loading jobs...</p>
        ) : filteredJobs.length === 0 ? (
          <div className="jobs-empty">
            <span>✦</span>
            <h3>No jobs found</h3>
            <p>
              {jobs.length === 0
                ? 'Create your first job position to get started.'
                : 'Try changing your search or status filter.'}
            </p>
            {jobs.length === 0 && (
              <button className="primary-button" onClick={openCreateForm}>
                Create a job
              </button>
            )}
          </div>
        ) : (
          <div className="jobs-table-wrapper">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Job position</th>
                  <th>Location</th>
                  <th>Employment type</th>
                  <th>Closing date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <strong>{job.title}</strong>
                      <small>Job ID: {job.id}</small>
                    </td>
                    <td>{job.location || 'Not specified'}</td>
                    <td>{job.employmentType || 'Not specified'}</td>
                    <td>{formatDate(job.closesAt)}</td>
                    <td>
                      <span
                        className={`job-status status-${(
                          job.status || 'draft'
                        ).toLowerCase()}`}
                      >
                        {job.status || 'DRAFT'}
                      </span>
                    </td>
                    <td>
                      <div className="job-actions">
                        <button
                          className="job-action-edit"
                          onClick={() => openEditForm(job)}
                        >
                          Edit
                        </button>

                        {job.status === 'DRAFT' && (
                          <button
                            onClick={() => changeStatus(job, 'PUBLISHED')}
                          >
                            Publish
                          </button>
                        )}

                        {job.status === 'PUBLISHED' && (
                          <button
                            onClick={() => changeStatus(job, 'CLOSED')}
                          >
                            Close
                          </button>
                        )}

                        {job.status === 'CLOSED' && (
                          <button
                            onClick={() => changeStatus(job, 'ARCHIVED')}
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && (
        <div
          className="job-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setShowForm(false);
            }
          }}
        >
          <section
            className="job-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-form-title"
          >
            <div className="job-modal-heading">
              <div>
                <p className="eyebrow">
                  QVETO / JOB MANAGEMENT
                </p>
                <h2 id="job-form-title">
                  {editingId ? 'Edit job position' : 'Create a new job'}
                </h2>
              </div>

              <button
                className="job-modal-close"
                onClick={() => setShowForm(false)}
                disabled={saving}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>
                Job title *
                <input
                  name="title"
                  value={form.title}
                  onChange={updateField}
                  maxLength={180}
                  required
                  placeholder="e.g. Frontend Developer"
                />
              </label>

              <label>
                Job description *
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  maxLength={10000}
                  required
                  rows={4}
                  placeholder="Describe the role and responsibilities..."
                />
              </label>

              <label>
                Requirements *
                <textarea
                  name="requirements"
                  value={form.requirements}
                  onChange={updateField}
                  maxLength={10000}
                  required
                  rows={4}
                  placeholder="List the required skills and qualifications..."
                />
              </label>

              <div className="job-form-grid">
                <label>
                  Location
                  <input
                    name="location"
                    value={form.location}
                    onChange={updateField}
                    maxLength={160}
                    placeholder="e.g. Chennai / Remote"
                  />
                </label>

                <label>
                  Employment type
                  <select
                    name="employmentType"
                    value={form.employmentType}
                    onChange={updateField}
                  >
                    <option value="">Select type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </label>
              </div>

              <label>
                Application closing date
                <input
                  type="date"
                  name="closesAt"
                  value={form.closesAt}
                  onChange={updateField}
                />
              </label>

              {error && <div className="jobs-error">{error}</div>}

              <div className="job-form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                    ? 'Save changes'
                    : 'Create job'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default HRJobs;
