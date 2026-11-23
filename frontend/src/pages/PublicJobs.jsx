
import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

function PublicJobs() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      setLoading(true);
      setError('');
      const data = await api.get('/jobs');
      setJobs(data.jobs || data || []);
    } catch (err) {
      setError(err.message || 'Unable to load jobs.');
    } finally {
      setLoading(false);
    }
  }

  async function viewJob(id) {
    try {
      setError('');
      const data = await api.get(`/jobs/${id}`);
      setSelectedJob(data.job || data);
    } catch (err) {
      setError(err.message || 'Unable to load job details.');
    }
  }

  const filteredJobs = jobs.filter((job) => {
    const searchText = search.toLowerCase();
    return (
      job.title?.toLowerCase().includes(searchText) ||
      job.location?.toLowerCase().includes(searchText) ||
      job.employmentType?.toLowerCase().includes(searchText)
    );
  });

  function formatDate(value) {
    if (!value) return 'Not specified';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  }

  if (selectedJob) {
    return (
      <div className="public-jobs-page">
        <button className="small-action" onClick={() => setSelectedJob(null)}>
          ← Back to jobs
        </button>

        <section className="panel public-job-detail">
          <p className="eyebrow">JOB DETAILS</p>
          <h1>{selectedJob.title}</h1>

          <div className="public-job-meta">
            <span>{selectedJob.location || 'Location not specified'}</span>
            <span>{selectedJob.employmentType || 'Employment type not specified'}</span>
            <span>Job ID: {selectedJob.id}</span>
          </div>

          <div className="public-job-section">
            <h2>About this role</h2>
            <p>{selectedJob.description || 'No description provided.'}</p>
          </div>

          <div className="public-job-section">
            <h2>Requirements</h2>
            <p>{selectedJob.requirements || 'No specific requirements provided.'}</p>
          </div>

          <div className="public-job-section">
            <h2>Application deadline</h2>
            <p>{formatDate(selectedJob.closesAt)}</p>
          </div>

          <p className="muted">
            Application submission will be available in the candidate application section.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="public-jobs-page">
      <div className="public-jobs-heading">
        <div>
          <p className="eyebrow">CAREER OPPORTUNITIES</p>
          <h1>Explore Jobs</h1>
          <p className="muted">Find an opportunity that matches your skills.</p>
        </div>
        <button className="primary-button" onClick={loadJobs}>
          Refresh jobs
        </button>
      </div>

      <section className="public-job-search panel">
        <input
          type="search"
          placeholder="Search by job title, location or employment type..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </section>

      {error && <div className="hr-alert error">{error}</div>}

      {loading ? (
        <p className="muted">Loading available jobs...</p>
      ) : filteredJobs.length === 0 ? (
        <section className="panel empty-state">
          No published jobs found.
        </section>
      ) : (
        <div className="public-job-grid">
          {filteredJobs.map((job) => (
            <article className="panel public-job-card" key={job.id}>
              <p className="eyebrow">{job.employmentType || 'JOB OPENING'}</p>
              <h2>{job.title}</h2>
              <p className="public-job-location">
                <span>Location:</span> {job.location || 'Not specified'}
              </p>
              <p className="public-job-description">
                {job.description || 'No description provided.'}
              </p>
              <p className="muted">
                Deadline: {formatDate(job.closesAt)}
              </p>
              <button
                className="primary-button"
                onClick={() => viewJob(job.id)}
              >
                View details
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default PublicJobs;
