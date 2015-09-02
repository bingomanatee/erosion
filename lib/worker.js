var cluster = require('cluster');
var Terrain = require('./Terrain');

module.exports = function() {
    if (cluster.isMaster) {

        var TerrainManager = require('./TerrainManager');
        var masterTerrain = new Terrain(100, 100, function() {
            return Math.random() * 100 + 100;
        });

        var manager = new TerrainManager(cluster, masterTerrain);
        manager.init();

    } else {
        console.log('creating TerrainWorker on ', process.pid);
        var TerrainWorker = require('./TerrainWorker');
        var terrainWorker = new TerrainWorker(cluster);
        terrainWorker.init();
    }
}