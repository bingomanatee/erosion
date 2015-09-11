var cluster = require('cluster');
var util = require('util');
if (cluster.isMaster) {
    var Manager = require('./../lib/TerrainManager');
    var path = require('path');
    var shoreline = require('./../lib/worker_scripts/shorelineTerrain');
    console.log('running shoreline');
    shoreline(512, 512)
      .then(function (ter) {
          var erodeScript = path.resolve(__dirname, '../lib/worker_scripts/erode.js');
          console.log('executing script', erodeScript);

          var manager = new Manager(ter);
          manager.init().then(function () {
              console.log('updating workers');
              return manager.updateWorkers({
                  script: erodeScript,
                  reps: 200,
                  feedback: true
              })
                .then(function () {
                    console.log('writing terrain');
                    ter.toPng(path.resolve(__dirname, 'shorelineEroded.png'))
                      .then(function(){
                          manager.closeWorkers();
                      }, function(err){
                          console.log('error on toPng:', err);
                          manager.closeWorkers();
                      });
                });
          }, function (err) {
              console.log('err initalizing', err);
          });
      });

} else {
    var Worker = new require('./../lib/TerrainWorker');
    var worker = new Worker();
    console.log('worker created');
}