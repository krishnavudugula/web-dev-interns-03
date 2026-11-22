
const mockAuthenticate = (req, res, next) => {
  const role = req.headers['x-test-role'];

  if (role) {
    req.user = { id: 99, role };
    return next();
  }

  const error = new Error('Authentication required');
  error.statusCode = 401;
  error.code = 'UNAUTHORIZED';
  next(error);
};

mockAuthenticate.optional = (req, res, next) => {
  next();
};

jest.mock('../src/middleware/authenticate', () => {
  const mockAuthenticate = (req, res, next) => {
    const role = req.headers['x-test-role'];

    if (role) {
      req.user = {
        id: 99,
        role,
        companyId: role === 'HR' ? 7 : null,
        };
      return next();
    }

    const AppError = require('../src/utils/AppError');
    next(AppError.unauthorized('Authentication required'));
  };

  mockAuthenticate.optional = (req, res, next) => next();

  return mockAuthenticate;
});


const request = require('supertest');
const app = require('../src/app');

const applicationRepository = require('../src/repositories/applicationRepository');
const userRepository = require('../src/repositories/userRepository');
const jobRepository = require('../src/repositories/jobRepository');

describe('Application search API', () => {
  beforeEach(() => {
    jest.spyOn(applicationRepository, 'list').mockResolvedValue([
      {
        id: 1,
        jobId: 10,
        candidateId: 1,
        stage: 'SCREENING',
        appliedAt: '2026-11-10T10:00:00.000Z',
      },
      {
        id: 2,
        jobId: 10,
        candidateId: 2,
        stage: 'INTERVIEW',
        appliedAt: '2026-11-12T10:00:00.000Z',
      },
      {
        id: 3,
        jobId: 20,
        candidateId: 1,
        stage: 'APPLIED',
        appliedAt: '2026-11-15T10:00:00.000Z',
      },
    ]);

    jest.spyOn(userRepository, 'list').mockResolvedValue([
      { id: 1, name: 'Krithiha', email: 'krithiha@example.com' },
      { id: 2, name: 'Ananya', email: 'ananya@example.com' },
    ]);

    jest.spyOn(jobRepository, 'list').mockResolvedValue([
      { id: 10, title: 'Web Developer' },
      { id: 20, title: 'Frontend Developer' },
    ]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('HR can search applications', async () => {
    const response = await request(app)
      .get('/api/applications/search')
      .set('x-test-role', 'HR');

    expect(response.status).toBe(200);
    expect(response.body.applications).toHaveLength(3);
    expect(response.body.pagination.total).toBe(3);
    expect(applicationRepository.list).toHaveBeenCalledWith({ companyId: 7 });
  });

  test('filters applications by job, stage and candidate name', async () => {
    const response = await request(app)
      .get('/api/applications/search?jobId=10&stage=SCREENING&name=Krithiha')
      .set('x-test-role', 'HR');

    expect(response.status).toBe(200);
    expect(response.body.applications).toHaveLength(1);
    expect(response.body.applications[0].candidateName).toBe('Krithiha');
    expect(response.body.applications[0].jobTitle).toBe('Web Developer');
  });

  test('supports pagination', async () => {
    const response = await request(app)
      .get('/api/applications/search?page=1&limit=2')
      .set('x-test-role', 'ADMIN');

    expect(response.status).toBe(200);
    expect(response.body.applications).toHaveLength(2);
    expect(response.body.pagination).toEqual({
      page: 1,
      limit: 2,
      total: 3,
      totalPages: 2,
    });
  });

  test('returns an empty array when no applications match', async () => {
    const response = await request(app)
      .get('/api/applications/search?stage=OFFERED')
      .set('x-test-role', 'HR');

    expect(response.status).toBe(200);
    expect(response.body.applications).toEqual([]);
    expect(response.body.pagination.total).toBe(0);
    expect(response.body.pagination.totalPages).toBe(0);
  });

  test('rejects an invalid stage', async () => {
    const response = await request(app)
      .get('/api/applications/search?stage=SHORTLISTED')
      .set('x-test-role', 'HR');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('rejects invalid pagination', async () => {
    const response = await request(app)
      .get('/api/applications/search?page=0')
      .set('x-test-role', 'HR');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('does not allow candidates to search all applications', async () => {
    const response = await request(app)
      .get('/api/applications/search')
      .set('x-test-role', 'CANDIDATE');

    expect(response.status).toBe(403);
  });

  test('requires authentication', async () => {
    const response = await request(app)
      .get('/api/applications/search');

    expect(response.status).toBe(401);
  });
});
