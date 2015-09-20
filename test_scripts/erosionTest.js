var cluster = require('cluster');
var util = require('util');
var path = require('path');
var Manager = require('./../lib/TerrainManager');
var Terrain = require('./../lib/Terrain');

var erodeScript = path.resolve(__dirname, '../lib/erosion/erode.js');
var config = require('./erosionTestConfig.json');
config.script = erodeScript;
config.feedback = true;
config.reps = 1;

if (cluster.isMaster) {
    console.log('running shoreline');
    var ter = new Terrain(16, 8, function (i, j) {
        return Math.max(i, j) * 5;
    });
    var manager;

    manager = new Manager(ter);
    manager.init()
        .then(function(){
            return manager.initBounds();
        })
        .then(function () {
            console.log('updating workers');
            return manager.updateWorkers(config)
        }, function (err) {
            console.log('err initializing', err);
            manager.closeWorkers();
        }).then(function () {
            console.log('get feedback');
            return manager.getFeedback(true);
        }, function(err){
            console.log('updateWorkers error:', err);
            manager.closeWorkers();
        }).then(function () {
            ter.erosionReport(100);
            return ter.toMultiPng(__dirname + '/erosionTest.png', 8, 3);
        }, function (err) {
            console.log('getFeedback error: ', err);
        }).then(function () {
            console.log('done with' ,ter.toString());
            manager.closeWorkers();
        }, function (err) {
            console.log('draw error: ', err);
        });

} else {
    var Worker = new require('./../lib/TerrainWorker');
    var worker = new Worker();
    console.log('worker created');
}