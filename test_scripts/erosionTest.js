var cluster = require('cluster');
var util = require('util');
var path = require('path');
var Manager = require('./../lib/TerrainManager');

var erodeScript = path.resolve(__dirname, '../lib/erosion/erode.js');
var config = require('./erosionTestConfig.json');
config.script = erodeScript;
config.feedback = true;
config.reps = 1;

if (cluster.isMaster) {
    console.log('running shoreline');
    var ter = new Terrain(20, 10, function (i, j) {
        return (i + j) * 5;
    });
    var manager;

    manager = new Manager(ter);
    manager.init()
        .then(function () {
            console.log('updating workers');
            return manager.updateWorkers(config)
        }, function (err) {
            console.log('err initializing', err);
        }).then(function () {
            console.log('polling terrain');
            return manager.fullUpdate();
        }).then(function(){
            terr.erosionReport(100);
            manager.closeWorkers();
        });

} else {
    var Worker = new require('./../lib/TerrainWorker');
    var worker = new Worker();
    console.log('worker created');
}