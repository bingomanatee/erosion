var cluster = require('cluster');
var Terrain = require('./Terrain');

if (cluster.isMaster) {

    var masterTerrain = new Terrain(100, function(){
        return Math.random() * 100 + 100;
    });

    var manager = new TerrainManager(cluster);
    TerrainManager.init();

} else {

    console.log('cluster online: ', cluster.worker.id);
    process.send({msgFromWorker: 'foo from' + process.pid});
    process.on('message', function(msg) {
        console.log('Worker ' + process.pid + ' received message from master.', msg);
    });

}
