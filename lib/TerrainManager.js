var _ = require('lodash');
var Hub = require('cluster-hub');
var q = require('q');
var cluster = require('cluster');

function TerrainManager(masterTerrain) {
    this.numCPUs = require('os').cpus().length;
    this.masterTerrain = masterTerrain;
    this.hub = new Hub();
    this.initState();
}

TerrainManager.prototype = _.extend({

      createWorker: function (division) {
          division.worker = cluster.fork();
          return this.initDivision(division);
      },

      initDivision: function (division) {
          var def = q.defer();

          this.hub.requestWorker(division.worker, 'initDivision', division.toData().toString(),
          function(err, result){
              console.log('initDivision returned for worker', division.worker.id);
              def.resolve(result);
          });
          return def.promise;
      },

      init: function () {
          var numCPUs = this.numCPUs;
          var def = q.defer();
          console.log('dividing terrain into ', numCPUs, ' chunks');

// Fork workers. Fork them good and hard!
          this.divisions = this.masterTerrain.divide(numCPUs);
          var divisionCount = this.divisions.length;

          var finish = _.once(function(){
              def.resolve(true);
          });

          function _divisionDone(){
              --divisionCount;
               if (divisionCount <= 0) finish();
          }

          for (var index = 0; index < numCPUs; index++) {
              if (index < this.divisions.length) {
                  this.createWorker(this.divisions[index])
                    .then(_divisionDone);
              } else {
                  break;
              }
          }

          return def.promise;
      }
  },
  require('./TerrainMgrLib/state.js')
);

module.exports = TerrainManager;