
const applicationRepository = require('./applicationRepository');
const userRepository = require('./userRepository');
const jobRepository = require('./jobRepository');

async function listSearchRecords({ companyId } = {}) {
  const [applications, users, jobs] = await Promise.all([
    applicationRepository.list({ companyId }),
    userRepository.list(),
    jobRepository.list({ includeUnpublished: true, companyId }),
  ]);

  const usersById = new Map(users.map((user) => [Number(user.id), user]));
  const jobsById = new Map(jobs.map((job) => [Number(job.id), job]));

  return applications.map((application) => {
    const candidate = usersById.get(Number(application.candidateId));
    const job = jobsById.get(Number(application.jobId));

    return {
      ...application,
      candidateName: candidate?.name || '',
      candidateEmail: candidate?.email || '',
      jobTitle: job?.title || '',
    };
  });
}

module.exports = { listSearchRecords };
