
import React, { useEffect, useState } from 'react';
import { api, getToken } from '../api/client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function CandidatePortal() {
  const [profile, setProfile] = useState({});
  const [profileForm, setProfileForm] = useState({});
  const [resume, setResume] = useState(null);
  const [jobId, setJobId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const excludedFields = [
    'id', 'userId', 'candidateId', 'email', 'role',
    'createdAt', 'updatedAt',
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError('');

      const data = await api.get('/candidates/me');
      const candidate = data.profile || data.candidate || data;

      setProfile(candidate);

      const editable = {};
      Object.entries(candidate).forEach(([key, value]) => {
        if (
          !excludedFields.includes(key) &&
          (typeof value === 'string' || typeof value === 'number' || value === null)
        ) {
          editable[key] = value ?? '';
        }
      });

      setProfileForm(editable);
    } catch (err) {
      setError(err.message || 'Unable to load candidate profile.');
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const data = await api.patch('/candidates/me', profileForm);
      const candidate = data.profile || data.candidate || data;

      setProfile(candidate);
      setMessage('Profile updated successfully.');
      await loadProfile();
    } catch (err) {
      setError(err.message || 'Unable to update profile.');
    } finally {
      setLoading(false);
    }
  }

  async function uploadResume(event) {
    event.preventDefault();

    if (!resume) {
      setError('Please select a resume file.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const formData = new FormData();
      formData.append('resume', resume);

      await api.post('/candidates/me/resume', formData);

      setMessage('Resume uploaded successfully.');
      setResume(null);
    } catch (err) {
      setError(err.message || 'Resume upload failed.');
    } finally {
      setLoading(false);
    }
  }

  async function downloadResume() {
    try {
      setError('');
      const response = await fetch(`${API_BASE_URL}/candidates/me/resume`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Unable to download resume.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'my-resume';
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Resume download failed.');
    }
  }

  async function submitApplication(event) {
    event.preventDefault();

    if (!jobId.trim()) {
      setError('Please enter a job ID.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      await api.post(`/jobs/${jobId}/applications`, {
        coverLetter,
      });

      setMessage('Application submitted successfully.');
      setJobId('');
      setCoverLetter('');
    } catch (err) {
      setError(err.message || 'Unable to submit application.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="hr-page">
      <div className="hr-page-heading">
        <div>
          <p className="eyebrow">CANDIDATE WORKSPACE</p>
          <h1>My Candidate Portal</h1>
          <p className="muted">
            Manage your profile, resume and job applications.
          </p>
        </div>
        <button className="primary-button" onClick={loadProfile}>
          Refresh profile
        </button>
      </div>

      {error && <div className="hr-alert error">{error}</div>}
      {message && <div className="hr-alert success">{message}</div>}

      <section className="panel hr-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">PERSONAL INFORMATION</p>
            <h2>My Profile</h2>
          </div>
        </div>

        {loading && !Object.keys(profile).length ? (
          <p className="muted">Loading profile...</p>
        ) : (
          <form className="candidate-profile-form" onSubmit={saveProfile}>
            {Object.entries(profileForm).map(([key, value]) => (
              <label key={key}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}
                <input
                  value={value}
                  onChange={(event) =>
                    setProfileForm((previous) => ({
                      ...previous,
                      [key]: event.target.value,
                    }))
                  }
                />
              </label>
            ))}

            {profile.email && (
              <p className="muted candidate-email">
                Email: {profile.email} (not editable)
              </p>
            )}

            <button className="primary-button" type="submit" disabled={loading}>
              Save profile
            </button>
          </form>
        )}
      </section>

      <section className="panel hr-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">RESUME MANAGEMENT</p>
            <h2>My Resume</h2>
          </div>
        </div>

        <form className="candidate-resume-form" onSubmit={uploadResume}>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(event) => setResume(event.target.files[0] || null)}
          />

          <div className="candidate-actions">
            <button className="primary-button" type="submit" disabled={loading}>
              Upload resume
            </button>
            <button
              className="small-action"
              type="button"
              onClick={downloadResume}
            >
              Download my resume
            </button>
          </div>
        </form>
      </section>

      <section className="panel hr-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">JOB APPLICATION</p>
            <h2>Apply for a Job</h2>
          </div>
        </div>

        <form className="candidate-application-form" onSubmit={submitApplication}>
          <label>
            Job ID
            <input
              type="number"
              min="1"
              value={jobId}
              onChange={(event) => setJobId(event.target.value)}
              placeholder="Enter the job ID"
              required
            />
          </label>

          <label>
            Cover letter
            <textarea
              rows="5"
              value={coverLetter}
              onChange={(event) => setCoverLetter(event.target.value)}
              placeholder="Write a short cover letter..."
            />
          </label>

          <button className="primary-button" type="submit" disabled={loading}>
            Submit application
          </button>
        </form>
      </section>
    </div>
  );
}

export default CandidatePortal;
