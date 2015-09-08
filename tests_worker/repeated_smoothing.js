var cluster = require('cluster');
var TerrainWorker = require('./../lib/TerrainWorker');
// var q = require('q');
// var util = require('util');
var path = require('path');
var SMOOTH_SCRIPT = path.resolve(__dirname, './../test_scripts/smooth');

var WIDTH = 500;
var HEIGHT = 500;
var REPS = 200;

function seed(i, j) {
    return (i + 1) * (j + 1);
}

if (cluster.isWorker) {
    var worker = new TerrainWorker();
} else {
    var tap = require('tap');
    var Terrain = require('./../lib/Terrain');
    var TerrainManager = require('./../lib/TerrainManager');

    var ter = new Terrain(WIDTH, HEIGHT, seed);
    var baseTerrain = new Terrain(WIDTH, HEIGHT, seed);
    var baselineTime = new Date().getTime();
    var baselineWorker = new TerrainWorker(baseTerrain);

    baselineWorker.updateTerrain({
        script: SMOOTH_SCRIPT,
        reps: REPS
    }).then(function () {
        console.log('================ TOTAL TIME FOR SINGLE WORKER: ', (new Date().getTime() - baselineTime) / 1000, 'secs');

        tap.test('integrated test - repeated smoothing', function (t) {

            var startTime = new Date().getTime();
            var manager = new TerrainManager(ter);
            manager.init()
              .then(function () {
                  manager.updateWorkers(SMOOTH_SCRIPT, true, REPS)
                    .then(function () {
                        var elapsed = (new Date().getTime() - startTime) / 1000;
                        console.log('=============== TOTAL TIME FOR WORKERS:', elapsed, 'secs');
                        t.ok(elapsed < REPS/5, 'took less than ' + (REPS / 5) + ' seconds');

                        return manager.closeWorkers();
                    }.bind(this))
                    .then(function () {
                        console.log('closed');
                        t.end();
                        resolve();
                    }, function (err) {
                        console.log('error on close: ', err);
                    });
              });
        });

    }, function (err) {
        console.log('error: ', err);
    });
}
