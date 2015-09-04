var Terrain = require('./../lib/Terrain');
var TerrainWorker = require('./../lib/TerrainWorker');

var cluster = require('cluster');
var tap = require('tap');

if (cluster.isWorker) {

    var worker = new TerrainWorker();

} else {

    var terr = new Terrain(12, 10, function(i, j){ return i * j;});
    var divisions = terr.divide(2);
    var div1 = divisions[0];

    var Hub = require('cluster-hub');
    var hub = new Hub();
    var BOUNDS_STUB = 'foo';

    tap.test('#createDivision', function (t) {
        var worker = cluster.fork();

        hub.on('getBounds', function(data, sender, callback){
            t.similar(data, div1.toJSON(), 'getBounds is polled with the worker dimensions');
            callback(null, BOUNDS_STUB);
        });

        hub.requestWorker(worker, 'initDivision', div1.toData().toString('hex'), function (er, result) {
            t.similar(result, div1.toJSON(true), 'worker echoes terrain data');

            hub.requestWorker(worker, 'initBounds', {}, function(er, result){
                t.similar(result, BOUNDS_STUB, 'result is bounds stub');
                hub.requestWorker(worker, 'die', {}, function () {
                    t.end();
                });
            });
        });
    });

}