
const searchService = require('../services/searchService');

const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const search = wrap(async (req, res) => {
  const result = await searchService.searchApplications(req.query, req.user);
  res.json(result);
});

module.exports = { search };
