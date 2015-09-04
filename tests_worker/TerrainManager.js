var Terrain = require('./../lib/Terrain');
var TerrainManager = require('./../lib/TerrainManager');
var cluster = require('cluster');
var tap = require('tap');

if (cluster.isWorker){
    var Hub = require('cluster-hub');
    var hub = new Hub();

    hub.on('initDivision',  function(data, sender, callback){
        callback(null, true);
    });

    hub.on('die', process.exit.bind(process));

} else {
    var terr = new Terrain(12, 12, 5);

    var mgr = new TerrainManager(terr);

    tap.test('manager init', function(t){
       mgr.init().
         then(function(){
             mgr.divisions.forEach(function(div){
                tap.ok(div.worker, 'manager assigned worker');
                 mgr.hub.sendToWorkers('die');
                 t.end();
             });
         });
    });
}