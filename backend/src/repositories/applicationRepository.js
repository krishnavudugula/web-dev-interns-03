const database = require('../config/database');
const jobRepository = require('./jobRepository');

const applications = new Map();
const stageHistory = new Map();
let nextApplicationId = 1;
let nextHistoryId = 1;

function toApplication(row) {
  return row && {
    id: Number(row.id),
    jobId: Number(row.job_id),
    candidateId: Number(row.candidate_id),
    coverLetter: row.cover_letter,
    stage: row.stage,
    appliedAt: row.applied_at,
    updatedAt: row.updated_at,
  };
}

function toHistory(row) {
  return row && {
    id: Number(row.id),
    applicationId: Number(row.application_id),
    changedBy: Number(row.changed_by),
    previousStage: row.previous_stage,
    newStage: row.new_stage,
    note: row.note,
    changedAt: row.changed_at,
  };
}

async function create({ jobId, candidateId, coverLetter }) {
  if (database.isDatabaseConfigured()) {
    const { insertId } = await database.query(
      `INSERT INTO applications (job_id, candidate_id, cover_letter)
       VALUES (?, ?, ?)`,
      [jobId, candidateId, coverLetter],
    );
    const { rows: created } = await database.query(
      'SELECT * FROM applications WHERE id = ?', [insertId],
    );
    const application = toApplication(created[0]);
    await addHistory(application.id, candidateId, null, 'APPLIED', 'Application submitted.');
    return application;
  }
  const now = new Date().toISOString();
  const application = {
    id: nextApplicationId++,
    jobId,
    candidateId,
    coverLetter,
    stage: 'APPLIED',
    appliedAt: now,
    updatedAt: now,
  };
  applications.set(application.id, application);
  await addHistory(application.id, candidateId, null, 'APPLIED', 'Application submitted.');
  return { ...application };
}

async function findById(id) {
  if (database.isDatabaseConfigured()) {
    const { rows } = await database.query('SELECT * FROM applications WHERE id = ?', [id]);
    return toApplication(rows[0]);
  }
  return applications.has(Number(id)) ? { ...applications.get(Number(id)) } : null;
}

async function findByJobAndCandidate(jobId, candidateId) {
  if (database.isDatabaseConfigured()) {
    const { rows } = await database.query(
      'SELECT * FROM applications WHERE job_id = ? AND candidate_id = ?',
      [jobId, candidateId],
    );
    return toApplication(rows[0]);
  }
  return [...applications.values()].find(
    (application) => application.jobId === Number(jobId) && application.candidateId === Number(candidateId),
  ) || null;
}

async function list({ companyId } = {}) {
  if (database.isDatabaseConfigured()) {
    if (companyId !== undefined && companyId !== null) {
      const { rows } = await database.query(
        `SELECT a.* FROM applications a
         JOIN jobs j ON j.id = a.job_id
         WHERE j.company_id = ?
         ORDER BY a.applied_at DESC`,
        [companyId],
      );
      return rows.map(toApplication);
    }
    const { rows } = await database.query('SELECT * FROM applications ORDER BY applied_at DESC');
    return rows.map(toApplication);
  }

  const visible = [];
  for (const application of applications.values()) {
    if (companyId === undefined || companyId === null) {
      visible.push(application);
      continue;
    }
    const job = await jobRepository.findById(application.jobId);
    if (job && job.companyId === companyId) visible.push(application);
  }
  return visible.sort((a, b) => b.id - a.id).map((application) => ({ ...application }));
}

async function updateStage(id, stage) {
  if (database.isDatabaseConfigured()) {
    const { rows } = await database.query(
      `UPDATE applications SET stage = ?, updated_at = NOW()
       WHERE id = ?`,
      [stage, id],
    );
    return findById(id);
  }
  const application = applications.get(Number(id));
  if (!application) return null;
  const previousStage = application.stage;
  application.stage = stage;
  application.updatedAt = new Date().toISOString();
  return { ...application, previousStage };
}

async function addHistory(applicationId, changedBy, previousStage, newStage, note) {
  if (database.isDatabaseConfigured()) {
    const { insertId } = await database.query(
      `INSERT INTO application_stage_history
        (application_id, changed_by, previous_stage, new_stage, note)
       VALUES (?, ?, ?, ?, ?)`,
      [applicationId, changedBy, previousStage, newStage, note],
    );
    const { rows: created } = await database.query(
      'SELECT * FROM application_stage_history WHERE id = ?', [insertId],
    );
    return toHistory(created[0]);
  }
  const history = {
    id: nextHistoryId++,
    applicationId,
    changedBy,
    previousStage,
    newStage,
    note,
    changedAt: new Date().toISOString(),
  };
  const entries = stageHistory.get(Number(applicationId)) || [];
  entries.push(history);
  stageHistory.set(Number(applicationId), entries);
  return { ...history };
}

async function getHistory(applicationId) {
  if (database.isDatabaseConfigured()) {
    const { rows } = await database.query(
      `SELECT * FROM application_stage_history
       WHERE application_id = ? ORDER BY changed_at`,
      [applicationId],
    );
    return rows.map(toHistory);
  }
  return (stageHistory.get(Number(applicationId)) || []).map((entry) => ({ ...entry }));
}

function _reset() {
  if (database.isDatabaseConfigured()) return;
  applications.clear();
  stageHistory.clear();
  nextApplicationId = 1;
  nextHistoryId = 1;
}

module.exports = {
  addHistory,
  create,
  findById,
  findByJobAndCandidate,
  getHistory,
  list,
  updateStage,
  _reset,
};
