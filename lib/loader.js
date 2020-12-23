'use strict';

const path = require('path');

module.exports = app => {
  let dirs = app.loader.getLoadUnits().map(unit => path.join(unit.path, 'app', 'io', 'middleware'));

  app.io.middleware = app.io.middleware || {};
  new app.loader.FileLoader({
    directory: dirs,
    target: app.io.middleware,
    inject: app,
  }).load();

  dirs = app.loader.getLoadUnits().map(unit => path.join(unit.path, 'app', 'io', 'controller'));
  app.io.controller = app.io.controller || {};
  app.loader.loadController({
    directory: dirs,
    target: app.io.controller,
  });
};
