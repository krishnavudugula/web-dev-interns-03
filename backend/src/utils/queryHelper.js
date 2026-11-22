
const AppError = require('./AppError');
const { STAGES } = require('../validators/applicationValidators');
const { parsePagination } = require('./pagination');

function validateOptionalId(value, field) {
  if (value === undefined || value === '') return undefined;

  if (!/^\d+$/.test(String(value)) || Number(value) < 1) {
    throw AppError.badRequest('Validation failed', [
      { field, message: `${field} must be a positive integer` },
    ]);
  }

  return Number(value);
}

function validateDate(value, field) {
  if (value === undefined || value === '') return undefined;

  if (
    typeof value !== 'string'
    || !/^\d{4}-\d{2}-\d{2}$/.test(value)
    || Number.isNaN(Date.parse(`${value}T00:00:00.000Z`))
    || new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) !== value
  ) {
    throw AppError.badRequest('Validation failed', [
      { field, message: `${field} must be a valid date in YYYY-MM-DD format` },
    ]);
  }

  return value;
}

function parseSearchQuery(query = {}) {
  const { page, limit } = parsePagination(query);

  const jobId = validateOptionalId(query.jobId, 'jobId');

  let stage;
  if (query.stage !== undefined && query.stage !== '') {
    if (!STAGES.includes(query.stage)) {
      throw AppError.badRequest('Validation failed', [
        { field: 'stage', message: 'Invalid application stage' },
      ]);
    }
    stage = query.stage;
  }

  const fromDate = validateDate(query.fromDate, 'fromDate');
  const toDate = validateDate(query.toDate, 'toDate');

  if (fromDate && toDate && fromDate > toDate) {
    throw AppError.badRequest('Validation failed', [
      { field: 'toDate', message: 'toDate must be on or after fromDate' },
    ]);
  }

  const name = query.name === undefined ? undefined : String(query.name).trim();
  const email = query.email === undefined ? undefined : String(query.email).trim();

  if (name && name.length > 100) {
    throw AppError.badRequest('Validation failed', [
      { field: 'name', message: 'name must be 100 characters or fewer' },
    ]);
  }

  if (email && email.length > 254) {
    throw AppError.badRequest('Validation failed', [
      { field: 'email', message: 'email must be 254 characters or fewer' },
    ]);
  }

  return { page, limit, jobId, stage, fromDate, toDate, name, email };
}

module.exports = { parseSearchQuery };
