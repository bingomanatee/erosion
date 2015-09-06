var _ = require('lodash');
var Hub = require('cluster-hub');
var q = require('q');
var cluster = require('cluster');

function TerrainManager(masterTerrain, divisions) {
    this.divisionCount = arguments.length < 2 ? divisions : require('os').cpus().length;
    this.masterTerrain = masterTerrain;
    this.hub = new Hub();
    this.hub.on('getBounds', function (data, sender, callback) {
        var bounds = this.boundsFor(data);
        callback(null, bounds);
    });
    this.initState();
}

TerrainManager.prototype = _.extend({

      createWorker: function (division) {
          var def = q.defer();
          division.worker = cluster.fork();

          this.hub.requestWorker(division.worker, 'initDivision', division.toData().toString(),
            function (err, result) {
                //   console.log('initDivision returned for worker', division.worker.id);
                def.resolve(result);
            });
          return def.promise;
      },

      init: function (divisionCount) {
          if (arguments.length < 1) {
              divisionCount = this.divisionCount;
          }
          var def = q.defer();

// Fork workers. Fork them good and hard!
          if (!this.masterTerrain.divide) {
              console.log('cannot divide masterTerriain: ', this.masterTerrain);
          }
          this.divisions = this.masterTerrain.divide(divisionCount);
          var divisionCount = this.divisions.length;
          var finished = false;

          var finish = _.once(function () {
              finished = true;
              def.resolve(true);
          });

          function _divisionDone() {
              --divisionCount;
              if (divisionCount <= 0) {
                  finish();
              }
          }

          for (var index = 0; index < divisionCount; index++) {
              if (index < this.divisions.length) {
                  this.createWorker(this.divisions[index])
                    .then(_divisionDone);
              } else {
                  break;
              }
          }

          if (index < this.divisions.length) {
              if (finished) {
                  throw new Error('not every division has a worker');
              } else {
                  def.reject(new Error('not every division has a worker'));
                  finish = function () {
                  };
              }
          }

          return def.promise;
      }
  },
  require('./TerrainMgrLib/state'),
  require('./TerrainMgrLib/bounds')
);

module.exports = TerrainManager;