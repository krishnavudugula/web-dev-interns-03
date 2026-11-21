const applicationRepository = require('../repositories/applicationRepository');
const { can } = require('../config/permissions');
const applicationService = require('../services/applicationService');
const {
  validateApplication,
  validateId,
  validateStage,
} = require('../validators/applicationValidators');

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const submit = wrap(async (req, res) => {
  const application = await applicationService.submit(
    validateId(req.params.jobId, 'jobId'),
    req.user.id,
    validateApplication(req.body),
  );
  res.status(201).json({ application });
});

const list = wrap(async (req, res) => {
  const companyId = can(req.user.role, 'application:view-all') ? req.user.companyId : undefined;
  res.json({ applications: await applicationRepository.list({ companyId }) });
});

const get = wrap(async (req, res) => {
  const application = await applicationService.getVisible(validateId(req.params.id), req.user);
  res.json({ application });
});

const changeStage = wrap(async (req, res) => {
  const application = await applicationService.changeStage(
    validateId(req.params.id),
    validateStage(req.body),
    req.user,
  );
  res.json({ application });
});

const history = wrap(async (req, res) => {
  const entries = await applicationService.getHistory(validateId(req.params.id), req.user);
  res.json({ history: entries });
});

module.exports = { changeStage, get, history, list, submit };
