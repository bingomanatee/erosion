var cluster = require('cluster');
var util = require('util');
if (cluster.isMaster) {
    var Manager = require('./../lib/TerrainManager');
    var path = require('path');
    var shoreline = require('./../lib/worker_scripts/shorelineTerrain');
    console.log('running shoreline');
    shoreline(512, 512)
      .then(function (ter) {
          var erodeScript = path.resolve(__dirname, '../lib/erosion/erode.js');
          console.log('executing script', erodeScript);

          return ter.toPng(path.resolve(__dirname, 'shorelinePreEroded.png'))
      })
      .then(function () {
          var manager = new Manager(ter);
          return manager.init();
      }).then(function () {
          console.log('updating workers');
          return manager.updateWorkers({
              script: erodeScript,
              sedDissolve: 0.05,
              maxSaturation: 0.5,
              waterAmount: 1 / 5,
              neighborWaterAmount: 0.5,
              waterFreq: 1 / 8,
              evapRate: 0.75,
              reps: 200,
              distance: 1,
              feedback: true,
              noisy: true
          })
      }, function (err) {
          console.log('err initalizing', err);
      }).then(function () {
          console.log('writing terrain');
          ter.toPng(path.resolve(__dirname, 'shorelineEroded.png'))
            .then(function () {
                manager.closeWorkers();
            }, function (err) {
                console.log('error on toPng:', err);
                manager.closeWorkers();
            });
      });

} else {
    var Worker = new require('./../lib/TerrainWorker');
    var worker = new Worker();
    console.log('worker created');
}