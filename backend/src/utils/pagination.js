
const AppError = require('./AppError');

function parsePagination(query = {}) {
  const pageValue = query.page ?? '1';
  const limitValue = query.limit ?? '10';

  if (!/^\d+$/.test(String(pageValue)) || Number(pageValue) < 1) {
    throw AppError.badRequest('Validation failed', [
      { field: 'page', message: 'page must be a positive integer' },
    ]);
  }

  if (!/^\d+$/.test(String(limitValue)) || Number(limitValue) < 1) {
    throw AppError.badRequest('Validation failed', [
      { field: 'limit', message: 'limit must be a positive integer' },
    ]);
  }

  const page = Number(pageValue);
  const limit = Number(limitValue);

  if (limit > 100) {
    throw AppError.badRequest('Validation failed', [
      { field: 'limit', message: 'limit must not exceed 100' },
    ]);
  }

  return { page, limit };
}

module.exports = { parsePagination };
