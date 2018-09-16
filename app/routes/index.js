const spaceRoutes = require('./routes');

module.exports = function(app, db) {
  spaceRoutes(app, db);
  // Other route groups could go here, in the future
};
