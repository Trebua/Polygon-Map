const spaceRoutes = require('./routes');

module.exports = function(app, db) {
  spaceRoutes(app, db);
};
