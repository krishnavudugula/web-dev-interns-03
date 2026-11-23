
import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import HRJobs from './pages/HRJobs';
import HRApplications from './pages/HRApplications';
import HRSearch from './pages/HRSearch';
import PublicJobs from './pages/PublicJobs';
import CandidatePortal from './pages/CandidatePortal';
import CandidateDashboard from './pages/CandidateDashboard';

const roleContent = {
  ADMIN: {
    label: 'Administrator',
    greeting: 'Welcome back, Admin',
    summary: 'Here is what is happening across your recruitment workspace.',
    metrics: [
      ['Open positions', '12', '+3 this month', '◈'],
      ['Active candidates', '86', '+14 this week', '♙'],
      ['Offers accepted', '18', '+8.2% this month', '✓'],
      ['Average time to hire', '24d', '4 days faster', '◷'],
    ],
    actions: ['Manage users', 'Configure workspace', 'View activity log'],
  },
  HR: {
    label: 'HR Manager',
    greeting: 'Welcome back, Morgan',
    summary: 'Your recruitment workspace is looking productive today.',
    metrics: [
      ['Active jobs', '8', '+2 this month', '◈'],
      ['Applications', '143', '+21 this week', '♙'],
      ['Interviews', '16', '5 scheduled today', '▣'],
      ['Pending offers', '4', '2 need follow-up', '✓'],
    ],
    actions: ['Create a job', 'Review applications', 'Explore candidates'],
  },
  CANDIDATE: {
    label: 'Candidate',
    greeting: 'Welcome back, Casey',
    summary: 'Keep track of your applications and career opportunities.',
    metrics: [
      ['Applications', '3', '1 updated today', '◈'],
      ['In screening', '1', 'Awaiting review', '◷'],
      ['Interviews', '1', 'Upcoming interview', '▣'],
      ['Offers', '0', 'No active offers', '✓'],
    ],
    actions: ['Browse jobs', 'Update profile', 'Upload resume'],
  },
};

const navigation = [
  ['Overview', '⌂'],
  ['Jobs', '▤'],
  ['Applications', '▣'],
  ['Candidates', '♙'],
  ['Interviews', '◷'],
  ['Analytics', '▥'],
  ['Public Jobs',''],
  ['Candidate Portal', '']
  ['Candidate Dashboard', '']
];

const activities = [
  {
    title: 'New application received',
    detail: 'Junior Full-Stack Developer',
    time: '10 minutes ago',
    type: 'New application',
  },
  {
    title: 'Candidate moved to interview',
    detail: 'Senior UI/UX Designer',
    time: '1 hour ago',
    type: 'Interview',
  },
  {
    title: 'New job position published',
    detail: 'Frontend Developer',
    time: 'Yesterday',
    type: 'Published',
  },
];

function App() {
  const [role, setRole] = useState('HR');
  const [activePage, setActivePage] = useState('Overview');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const content = roleContent[role];

  const filteredActivities = useMemo(
    () =>
      activities.filter((activity) =>
        `${activity.title} ${activity.detail} ${activity.type}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [search]
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">Q</span>
          <span>Qveto <small>RECRUITMENT</small></span>
        </div>

        <p className="sidebar-label">WORKSPACE</p>

        <nav aria-label="Main navigation">
          {navigation.map(([label, icon]) => (
            <button
              key={label}
              className={`nav-item ${activePage === label ? 'active' : ''}`}
              onClick={() => setActivePage(label)}
            >
              <span className="nav-icon">{icon}</span>
              {label}
              {label === 'Applications' && (
                <span className="nav-count">12</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <p className="sidebar-label">PREFERENCES</p>
          <button
            className={`nav-item ${activePage === 'Settings' ? 'active' : ''}`}
            onClick={() => setActivePage('Settings')}
          >
            <span className="nav-icon">⚙</span>
            Settings
          </button>

          <div className="account">
            <span className="avatar">MC</span>
            <span>
              <strong>My account</strong>
              <small>{content.label}</small>
            </span>
            <span className="account-menu">•••</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> {activePage}
          </div>

          <div className="topbar-actions">
            <label className="top-search">
              <span>⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search activity..."
                aria-label="Search activity"
              />
            </label>

            <div className="notification-wrapper">
              <button
                className="icon-button notification-button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Toggle notifications"
              >
                ♧
                <span className="notification-dot" />
              </button>

              {notificationsOpen && (
                <div className="notification-panel">
                  <strong>Notifications</strong>
                  <p>You have 3 recent workspace updates.</p>
                  <p>New candidate applications are waiting for review.</p>
                  <button onClick={() => setNotificationsOpen(false)}>
                    Close
                  </button>
                </div>
              )}
            </div>

            <button className="avatar avatar-large" aria-label="Account">
              MC
            </button>
          </div>
        </header>

        <section className="content">
          {activePage === 'Overview' ? (
            <>
              <div className="welcome-row">
                <div>
                  <p className="eyebrow">YOUR WORKSPACE / OVERVIEW</p>
                  <h1>{content.greeting} <span className="wave">✦</span></h1>
                  <p className="muted">{content.summary}</p>
                </div>

                <label className="role-picker">
                  Preview workspace as
                  <select
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                  >
                    <option value="ADMIN">Administrator</option>
                    <option value="HR">HR Manager</option>
                    <option value="CANDIDATE">Candidate</option>
                  </select>
                </label>
              </div>

              <div className="dashboard-banner">
                <div>
                  <span className="banner-label">QVETO WORKSPACE</span>
                  <h2>Find the right people.<br />Build the right future.</h2>
                  <p>Manage your recruitment journey, all in one place.</p>
                </div>
                <div className="banner-art">
                  <span className="art-circle art-one">Q</span>
                  <span className="art-circle art-two">✦</span>
                  <span className="art-circle art-three">↗</span>
                </div>
              </div>

              <div className="section-heading">
                <div>
                  <p className="eyebrow">AT A GLANCE</p>
                  <h2>Workspace overview</h2>
                </div>
                <span className="updated-label">Demo data · Updated just now</span>
              </div>

              <div className="metrics-grid">
                {content.metrics.map(([label, value, change, icon]) => (
                  <article className="metric-card" key={label}>
                    <div className="metric-top">
                      <span className="metric-icon">{icon}</span>
                      <span className="metric-menu">•••</span>
                    </div>
                    <span className="muted">{label}</span>
                    <strong>{value}</strong>
                    <span className="positive">↗ {change}</span>
                  </article>
                ))}
              </div>

              <div className="dashboard-grid">
                <section className="panel pipeline-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">RECRUITMENT OVERVIEW</p>
                      <h2>Application pipeline</h2>
                    </div>
                    <button
                      className="text-action"
                      onClick={() => setActivePage('Applications')}
                    >
                      View applications →
                    </button>
                  </div>

                  <div className="pipeline">
                    {[
                      ['Applied', 42],
                      ['Screening', 27],
                      ['Interview', 16],
                      ['Selected', 8],
                      ['Offered', 4],
                    ].map(([stage, count], index) => (
                      <div className="stage" key={stage}>
                        <span className={`stage-icon stage-${index}`}>
                          {index + 1}
                        </span>
                        <strong>{count}</strong>
                        <span className="muted">{stage}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pipeline-footer">
                    <span>Candidate progress across all active jobs</span>
                    <span className="pipeline-status">● Live overview</span>
                  </div>
                </section>

                <section className="panel actions-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">QUICK ACCESS</p>
                      <h2>Quick actions</h2>
                    </div>
                  </div>
                  <div className="action-list">
                    {content.actions.map((action) => (
                      <button
                        key={action}
                        onClick={() =>
                          setActivePage(
                            action.includes('job') || action.includes('Job')
                              ? 'Jobs'
                              : action.includes('application') ||
                                action.includes('Review')
                              ? 'Applications'
                              : 'Candidates'
                          )
                        }
                      >
                        {action}<span>↗</span>
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              <section className="panel activity-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">STAY UP TO DATE</p>
                    <h2>Recent activity</h2>
                  </div>
                  <span className="activity-count">
                    {filteredActivities.length} updates
                  </span>
                </div>

                {filteredActivities.length ? (
                  filteredActivities.map((activity, index) => (
                    <div className="activity-row" key={activity.title}>
                      <span className={`activity-dot ${index % 2 ? 'green' : 'blue'}`} />
                      <div>
                        <strong>{activity.title}</strong>
                        <p className="muted">{activity.detail} · {activity.time}</p>
                      </div>
                      <span className="tag">{activity.type}</span>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No activities match your search.</p>
                )}
              </section>
            </>
              ) : activePage === 'Jobs' ? (
                <HRJobs />
              ) : activePage === 'Applications' ? (
                <HRApplications />
                ) : activePage === 'Candidates' ? (
                <HRSearch />
                ) : activePage === 'Public Jobs' ? (
                <PublicJobs />
              ) : activePage === 'Candidate Portal' ? (
                <CandidatePortal />
              ) : activePage === 'Candidate Dashboard' ? (
                <CandidateDashboard />
              ) : (
              <section className="page-placeholder panel">
              <span className="placeholder-icon">✦</span>
              <p className="eyebrow">QVETO WORKSPACE</p>
              <h1>{activePage}</h1>
              <p className="muted">
                This section is ready for development. We will connect it to
                your backend and build its interactive features next.
              </p>
              <button
                className="primary-button"
                onClick={() => setActivePage('Overview')}
              >
                ← Back to overview
              </button>
            </section>
          )}
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
