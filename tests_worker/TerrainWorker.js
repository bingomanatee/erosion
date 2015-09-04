var Terrain = require('./../lib/Terrain');
var TerrainWorker = require('./../lib/TerrainWorker');

var cluster = require('cluster');
var tap = require('tap');

if (cluster.isWorker) {

    var worker = new TerrainWorker();

} else {

    var terr = new Terrain(12, 12, 5);
    var Hub = require('cluster-hub');
    var hub = new Hub();

    tap.test('#createDivision', function (t) {
        var worker = cluster.fork();
        hub.requestWorker(worker, 'initDivision', terr.toData().toString(), function (er, result) {
            t.similar(result, terr.toJSON(), 'worker echoes terrain data');
            hub.requestWorker(worker, 'die', {}, function () {
                t.end();
            });
        });
    });

}