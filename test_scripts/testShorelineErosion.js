var cluster = require('cluster');
var util = require('util');
var config = require('./erosionConfig.json');
var path = require('path');
var erodeScript = path.resolve(__dirname, '../lib/erosion/erode.js');
var shoreline = require('./../lib/worker_scripts/shorelineTerrain');
var Manager = require('./../lib/TerrainManager');
config.script = erodeScript;

if (cluster.isMaster) {
    console.log('running shoreline');
    var ter;
    var manager;
    shoreline(config.size, config.size)
        .then(function(terrain) {
            ter = terrain;
            return ter.toPng(path.resolve(__dirname, 'shorelinePreEroded.png'))
        })
        .then(function() {
            manager = new Manager(ter);
            return manager.init();
        }).then(function() {
            console.log('updating workers');
            config.initBounds = true;
            config.feedback = true;
            return manager.updateWorkers(config)
        }, function(err) {
            console.log('err initalizing', err);
        }).then(function() {
            console.log('writing terrain');
            ter.toPng(path.resolve(__dirname, 'shorelineEroded.png'))
                .then(function() {
                    manager.closeWorkers();
                }, function(err) {
                    console.log('error on toPng:', err);
                    manager.closeWorkers();
                });
        }, function(err){
            console.log('error updating workers: ');
            console.log(util.inspect(err).substr(0, 500));
        });

} else {
    var Worker = new require('./../lib/TerrainWorker');
    var worker = new Worker();
    console.log('worker created');
}