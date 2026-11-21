const request = require('supertest');
const app = require('../src/app');
const authService = require('../src/services/authService');
const applicationRepository = require('../src/repositories/applicationRepository');
const jobRepository = require('../src/repositories/jobRepository');
const userRepository = require('../src/repositories/userRepository');

const PASSWORD = 'Passw0rdOK';

beforeEach(() => {
  userRepository._reset();
  jobRepository._reset();
  applicationRepository._reset();
});

async function login(role, email, companyId) {
  if (role === 'CANDIDATE') {
    const registered = await authService.registerCandidate({ name: 'Candidate', email, password: PASSWORD });
    return { token: registered.token, id: registered.user.id };
  }
  await authService.createStaff({ name: role, email, password: PASSWORD, role, companyId });
  const response = await request(app).post('/api/auth/login').send({ email, password: PASSWORD });
  return { token: response.body.token };
}

async function createPublishedJob(token) {
  const created = await request(app)
    .post('/api/jobs')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Pipeline Engineer', description: 'Pipeline testing', requirements: 'Node.js' });
  await request(app)
    .post(`/api/jobs/${created.body.job.id}/status`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status: 'PUBLISHED' });
  return created.body.job.id;
}

describe('pipeline transition and audit hardening', () => {
  test('final stages reject further transitions and successful changes write history', async () => {
    const hr = await login('HR', 'pipeline-hr@example.com', 1);
    const candidate = await login('CANDIDATE', 'pipeline-candidate@example.com', null);
    const jobId = await createPublishedJob(hr.token);

    const submitted = await request(app)
      .post(`/api/jobs/${jobId}/applications`)
      .set('Authorization', `Bearer ${candidate.token}`)
      .send({});

    const stages = ['SCREENING', 'INTERVIEW', 'SELECTED', 'OFFERED'];
    for (const stage of stages) {
      const response = await request(app)
        .patch(`/api/applications/${submitted.body.application.id}/stage`)
        .set('Authorization', `Bearer ${hr.token}`)
        .send({ stage });
      expect(response.status).toBe(200);
    }

    const invalid = await request(app)
      .patch(`/api/applications/${submitted.body.application.id}/stage`)
      .set('Authorization', `Bearer ${hr.token}`)
      .send({ stage: 'REJECTED' });
    expect(invalid.status).toBe(422);

    const history = await request(app)
      .get(`/api/applications/${submitted.body.application.id}/history`)
      .set('Authorization', `Bearer ${hr.token}`);
    expect(history.status).toBe(200);
    expect(history.body.history).toHaveLength(5);
  });

  test('cross-company staff cannot change or list applications', async () => {
    const companyOne = await login('HR', 'pipeline-company-one@example.com', 1);
    const companyTwo = await login('HR', 'pipeline-company-two@example.com', 2);
    const candidate = await login('CANDIDATE', 'pipeline-cross-candidate@example.com', null);
    const jobId = await createPublishedJob(companyOne.token);

    const submitted = await request(app)
      .post(`/api/jobs/${jobId}/applications`)
      .set('Authorization', `Bearer ${candidate.token}`)
      .send({});

    const denied = await request(app)
      .patch(`/api/applications/${submitted.body.application.id}/stage`)
      .set('Authorization', `Bearer ${companyTwo.token}`)
      .send({ stage: 'SCREENING' });
    expect(denied.status).toBe(404);

    const companyOneList = await request(app)
      .get('/api/applications')
      .set('Authorization', `Bearer ${companyOne.token}`);
    expect(companyOneList.status).toBe(200);
    expect(companyOneList.body.applications).toHaveLength(1);

    const companyTwoList = await request(app)
      .get('/api/applications')
      .set('Authorization', `Bearer ${companyTwo.token}`);
    expect(companyTwoList.status).toBe(200);
    expect(companyTwoList.body.applications).toHaveLength(0);
  });

  test('candidates cannot change stages or view pipeline history', async () => {
    const hr = await login('HR', 'pipeline-role-hr@example.com', 1);
    const candidate = await login('CANDIDATE', 'pipeline-role-candidate@example.com', null);
    const jobId = await createPublishedJob(hr.token);
    const submitted = await request(app)
      .post(`/api/jobs/${jobId}/applications`)
      .set('Authorization', `Bearer ${candidate.token}`)
      .send({});

    const change = await request(app)
      .patch(`/api/applications/${submitted.body.application.id}/stage`)
      .set('Authorization', `Bearer ${candidate.token}`)
      .send({ stage: 'SCREENING' });
    expect(change.status).toBe(403);

    const history = await request(app)
      .get(`/api/applications/${submitted.body.application.id}/history`)
      .set('Authorization', `Bearer ${candidate.token}`);
    expect(history.status).toBe(403);
  });
});
