
const searchRepository = require('../repositories/searchRepository');
const { parseSearchQuery } = require('../utils/queryHelper');
const AppError = require('../utils/AppError');

async function searchApplications(query = {}, user = {}) {
  const filters = parseSearchQuery(query);

  if (
    user.role === 'HR'
    && (user.companyId === undefined || user.companyId === null)
  ) {
    throw AppError.forbidden('HR account is not associated with a company');
  }

  const companyId = user.role === 'HR' ? user.companyId : undefined;
  const records = await searchRepository.listSearchRecords({ companyId });

  let results = records.filter((application) => {
    if (filters.jobId !== undefined && Number(application.jobId) !== filters.jobId) {
      return false;
    }

    if (filters.stage && application.stage !== filters.stage) {
      return false;
    }

    if (
      filters.name
      && !application.candidateName.toLowerCase().includes(filters.name.toLowerCase())
    ) {
      return false;
    }

    if (
      filters.email
      && !application.candidateEmail.toLowerCase().includes(filters.email.toLowerCase())
    ) {
      return false;
    }

    const appliedAt = new Date(application.appliedAt);

    if (filters.fromDate) {
      const start = new Date(`${filters.fromDate}T00:00:00.000Z`);
      if (Number.isNaN(appliedAt.getTime()) || appliedAt < start) return false;
    }

    if (filters.toDate) {
      const end = new Date(`${filters.toDate}T23:59:59.999Z`);
      if (Number.isNaN(appliedAt.getTime()) || appliedAt > end) return false;
    }

    return true;
  });

  results.sort((a, b) => {
    return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
  });

  const total = results.length;
  const startIndex = (filters.page - 1) * filters.limit;
  const applications = results.slice(startIndex, startIndex + filters.limit);

  return {
    applications,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
}

module.exports = { searchApplications };
