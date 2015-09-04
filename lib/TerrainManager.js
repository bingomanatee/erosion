var _ = require('lodash');
var Hub = require('cluster-hub');
var q = require('q');
var cluster = require('cluster');

function TerrainManager(masterTerrain) {
    this.numCPUs = require('os').cpus().length;
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
          division.worker = cluster.fork();
          return this.initDivision(division);
      },

      getIseries: function (i, j1, j2) {
          if (i < 0 || i >= this.masterTerrain.iSize) {
              return null;
          }
          j1 = Math.max(0, j1);
          j2 = Math.min(this.masterTerrain.jSize, j2);

          var buffer = new Buffer(8 * (j2 - j1 + 1));
          var offset = 0;

          for (var j = j1; j <= j2; ++j) {
              offset = this._writeToBuffer(i, j, buffer, offset);
          }
          return buffer;
      },

      _writeToBuffer: function(i, j, buffer, offset){
          buffer.writeInt16LE(i, offset);
          offset += 2;
          buffer.writeInt16LE(j, offset);
          offset += 2;
          buffer.writeFloatLE(this.masterTerrain.getHeight(i, j));
          offset += 4;
          return offset;
      },

      getJseries: function (j, i1, i2) {
          if (i < 0 || i >= this.masterTerrain.jSize) {
              return null;
          }
          var i1 = Math.max(0, i1);
          var i2 = Math.min(this.masterTerrain.iSize, i2);
          var offset = 0;

          for (var i = i1; i <= i2; ++i){
              offset = this._writeToBuffer(i, j, buffer, offset);
          }
          return buffer;
      },

      boundsFor: function (region) {
          var buffers = [];
          buffers.push(this.getIseries(region.iStart - 1, region.jStart - 1, region.jStart + region.jSize + 1));
          buffers.push(this.getIseriies(region.iStart - 1, region.jStart - 1, region.jStart + region.jSize + 1));
          buffers.push(this.getJseries(region.jStart - 1, region.iStart - 1, region.iStart + region.jSize + 1));
          buffers.push(this.getJseries(region.jStart - 1, region.iStart - 1, region.iStart + region.jSize + 1));

          return Buffer.concat(_.compact(buffers));
      },

      initDivision: function (division) {
          var def = q.defer();

          this.hub.requestWorker(division.worker, 'initDivision', division.toData().toString(),
            function (err, result) {
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

          var finish = _.once(function () {
              def.resolve(true);
          });

          function _divisionDone() {
              --divisionCount;
              if (divisionCount <= 0) {
                  finish();
              }
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