var cluster = require('cluster');
var util = require('util');
var Worker = new require('./../lib/TerrainWorker');
var path = require('path');
var shoreline = require('./../lib/worker_scripts/shorelineTerrain');

shoreline(600, 600)
  .then(function (ter) {
      var worker = new Worker(ter);
      var erodeScript = path.resolve(__dirname, '../lib/erosion2/erode.js');
      var smoothScript = path.resolve(__dirname, 'smooth.js');

      console.log('executing script', erodeScript);
      console.log(ter.dataSummary());
      return worker.updateTerrain({
          script: smoothScript,
          reps: 2,
          noBounds: true
      })
        .then(function () {
            return ter.toPng(path.resolve(__dirname, 'shorelinePreEroded.png'))
        })
        .then(function () {
            return worker.updateTerrain({
                script: erodeScript,
                sedDissolve: 0.1,
                maxSaturation: 0.25,
                waterAmount: 1,
                neighborWaterAmount: 0.5,
                waterFreq: 1/8,
                evapRate: 0.9,
                reps: 300,
                distance: 1,
                noisy: true
            })
        }).then(function () {
            console.log('writing terrain');
            return ter.toPng(path.resolve(__dirname, 'shorelineEroded.png'))
        }).then(function () {
            console.log('done');
        }, function (err) {
            console.log('error on toPng:', err);
        });

  });
