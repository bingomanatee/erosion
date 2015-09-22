var Terrain = require('./../lib/Terrain');
var TerrainWorker = require('./../lib/TerrainWorker');
var TerrainManager = require('./../lib/TerrainManager');
var Hub = require('cluster-hub');
var cluster = require('cluster');
var tap = require('tap');
var util = require('util');

if (cluster.isWorker) {

    var worker = new TerrainWorker();

} else {

    var terr = new Terrain(12, 10, function (i, j) {
        return i * j;
    });

    var manager = new TerrainManager(terr, 2);

    tap.test('#createDivision', function (t) {
        var oldBoundsFor = manager.boundsFor.bind(manager);

        manager.boundsFor = function (data) {
            console.log('SPY boundsFor request: ', data);
            return oldBoundsFor(data);
        };

        manager.init().then(function(){
            manager.triggerRequestBounds()
              .then(function () {
                  console.log('DONE requesting BOUNDS !!!!!!');
                  cluster.disconnect(function(){
                      t.end();
                  });
              });
        }, function(err){
            console.log('init error:', err);
            cluster.disconnect(function(){
                t.end();
            });
        });

    });

}