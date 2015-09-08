var _ = require('lodash');
var Hub = require('cluster-hub');
var q = require('q');
var cluster = require('cluster');
var CONST = require('./util/const.json');

function TerrainManager(masterTerrain, divisions) {
    this.divisionCount = arguments.length > 1 ? divisions : require('os').cpus().length;
    this.masterTerrain = masterTerrain;
    this.hub = new Hub();
    this.hub.on('getBounds', function (data, sender, callback) {
        var bounds = this.boundsFor(data);
        callback(null, bounds.toString(CONST.encoding));
    }.bind(this));
    this.initState();
}

TerrainManager.prototype = _.extend({

      createWorker: function (division) {
          var def = q.defer();
          division.worker = cluster.fork();

          var str = division.toData().toString(CONST.encoding);
          // console.log('create worker size: ', str.length);
          this.hub.requestWorker(division.worker, 'initDivision', {data: str, size: str.length},
            function (err, result) {
                //  console.log('initDivision returned for worker', result);
                def.resolve(result);
            });
          return def.promise;
      },

      updateWorkers: function (scriptPath, feedback, reps) {
          if (arguments.length < 3) {
              reps = 1;
          }
          return q.Promise(function (resolve, reject) {
              this.hub.requestAllWorkers('update', {script: scriptPath, reps: reps, feedback: !!feedback}, function (err, result) {
                  if (err) {
                      console.log('error in worker update:', err);
                      return reject(err);
                  }
                  // console.log('------- done updating', scriptPath, feedback, 'result:', result);
                  if (feedback) {
                      this.updateFromData(result);
                  }
                  resolve(result);
              }.bind(this));
          }.bind(this));
      },

      updateFromData: function (result) {
          _.each(result, function (data) {
              this.masterTerrain.updateData(data[1].data);
          }, this);
      },

      closeWorkers: function () {
          return q.Promise(function (resolve, reject) {
              this.hub.requestAllWorkers('die', {}, function (err, result) {
                  this.hub.releaseLocks();
                  this.divisions.forEach(function (div) {
                      div.worker.kill();
                  });
                  return err ? reject(err) : resolve(result);
              }.bind(this));
          }.bind(this));
      },

      init: function (divisionCount) {
          if (arguments.length < 1) {
              divisionCount = this.divisionCount;
          }
          var def = q.defer();

// Fork workers. Fork them good and hard!
          this.divisions = this.masterTerrain.divide(divisionCount);
          var divisionCount = this.divisions.length;
          var finished = false;

          var finish = _.once(function () {
              finished = true;
              def.resolve(true);
          });

          function _divisionDone() {
              //    console.log('division done');
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