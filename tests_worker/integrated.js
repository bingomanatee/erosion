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

    //console.log('terrain: ', ter.toJSON());
    // console.log('terrain cells:');
    // console.log(ter.to2Darray());
    // console.log('ter data: ', ter.toData());

    tap.test('integrated test of updating worker and master terrain', function (t) {

        var manager = new TerrainManager(ter);
        manager.init(2)
          .then(function () {
              //  console.log('initialized');
              var startTime = new Date().getTime();
              var path = require('path');
              var smoothScript = path.resolve(__dirname, './../test_scripts/smooth');
              //  console.log('updating workers');

              manager.updateWorkers(smoothScript, true).then(function () {
                  var data = manager.masterTerrain.to2Darray();

                 //  console.log('final data: ', data);
                  t.match(data, [ [ 89, 88, 105, 124, 145, 168, 193, 220, 249, 280 ],
                        [ 214, 219, 244, 271, 300, 331, 364, 399, 436, 456 ],
                        [ 546, 559, 604, 651, 700, 751, 804, 859, 916, 944 ],
                        [ 1078, 1099, 1164, 1231, 1300, 1371, 1444, 1519, 1596, 1632 ],
                        [ 1810, 1839, 1924, 2011, 2100, 2191, 2284, 2379, 2476, 2520 ],
                        [ 2742, 2779, 2884, 2991, 3100, 3211, 3324, 3439, 3556, 3608 ],
                        [ 3874, 3919, 4044, 4171, 4300, 4431, 4564, 4699, 4836, 4896 ],
                        [ 5206, 5259, 5404, 5551, 5700, 5851, 6004, 6159, 6316, 6384 ],
                        [ 6738, 6799, 6964, 7131, 7300, 7471, 7644, 7819, 7996, 8072 ],
                        [ 8470, 8539, 8724, 8911, 9100, 9291, 9484, 9679, 9876, 9960 ],
                        [ 10402, 10479, 10684, 10891, 11100, 11311, 11524, 11739, 11956, 12048 ],
                        [ 11049, 11260, 11473, 11688, 11905, 12124, 12345, 12568, 12793, 12714 ] ],
                    'smoothed workers changed terrain');

                  var elapsed = (new Date().getTime() - startTime) / 1000;
                  t.ok(elapsed < 1, 'took less than a second');

                  manager.closeWorkers().then(function () {
                      //    console.log('closed');
                      t.end();
                  }, function (err) {
                      console.log('error on close: ', err);
                  });
              }, function (err) {
                  console.log('error from updateWorkers: ', err);
              });
          });
    });

}
