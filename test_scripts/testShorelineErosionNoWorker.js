var cluster = require('cluster');
var util = require('util');
var Worker = new require('./../lib/TerrainWorker');
var path = require('path');
var shoreline = require('./../lib/worker_scripts/shorelineTerrain');
var config = require('./erosionConfig.json');
var erodeScript = path.resolve(__dirname, '../lib/erosion/erode.js');
config.script = erodeScript;

shoreline(300, 300)
  .then(function (ter) {
      var worker = new Worker(ter);
      var smoothScript = path.resolve(__dirname, 'smooth.js');
      return worker.updateTerrain({
          script: smoothScript,
          reps: 2,
          noBounds: true
      })
        .then(function () {
            return ter.toPng(path.resolve(__dirname, 'shorelinePreEroded.png'))
        })
        .then(function () {
            return worker.updateTerrain(config)
        }).then(function () {
            console.log('writing terrain');
            return ter.toPng(path.resolve(__dirname, 'shorelineEroded.png'))
        }).then(function () {
            console.log('done');
        }, function (err) {
            console.log('error on toPng:', err);
        });

  });
