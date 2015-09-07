var cluster = require('cluster');
var TerrainWorker = require('./../lib/TerrainWorker');

if (cluster.isWorker) {
    var worker = new TerrainWorker();
} else {
    var tap = require('tap');
    var Terrain = require('./../lib/Terrain');

    var TerrainManager = require('./../lib/TerrainManager');

    var n = 0;
    var ter = new Terrain(12, 10, function (i, j) {
        return Math.pow(++n, 2);
    });

    console.log('terrain: ', ter.toJSON());
    console.log('terrain cells:');
    console.log(ter.to2Darray());
    console.log('ter data: ', ter.toData('hex'));

    var manager = new TerrainManager(ter);
    manager.init(2)
      .then(function () {
          console.log('initialized');
          var path = require('path');
          var smoothScript = path.resolve(__dirname, './../test_scripts/smooth');

          console.log('updating workers');
          manager.updateWorkers(smoothScript).then(function () {
              setTimeout(function () {
                  console.log('close workers');
                  manager.closeWorkers().then(function () {
                      console.log('closed');
                      process.exit();
                  })
              }, 4000);
          });
      });

}
