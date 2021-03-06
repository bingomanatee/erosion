var _ = require('lodash');
var Hub = require('cluster-hub');
var q = require('q');
var cluster = require('cluster');
var CONST = require('./util/const.json');
var util = require('util');

function TerrainManager(masterTerrain, divisions) {
    this.divisionCount = arguments.length > 1 ? divisions : require('os').cpus().length;
    // console.log('divCount: ', this.divisionCount);
    this.masterTerrain = masterTerrain;
    this.hub = new Hub();
    var count = 0;

    this.hub.on('requestBounds', function(data, sender, callback){
        console.log('MASTER: requestBounds for', data);
        var bounds = this.boundsFor(data);
        callback(null,bounds);
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

        updateWorkers: function (options) {
            return q.Promise(function (resolve, reject) {
                this.hub.requestAllWorkers('update', options, function (err, result) {
                    if (err) {
                        console.log('error in worker update');
                        return reject(err);
                    }
                    // console.log('------- done updating', scriptPath, feedback, 'result:', result);
                    if (options.feedback) {
                        this.updateFromData(result);
                    }
                    resolve(result);
                }.bind(this), function (err) {
                    console.log('request all workers:', err);
                    reject(err);
                });
            }.bind(this));
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

        init: function () {
            return new Promise(function (resolve, reject) {
                this.divisions = this.masterTerrain.divide(this.divisionCount);
                var divisionCount = this.divisions.length;
                var finished = false;

                var finish = _.once(function () {
                    finished = true;
                    resolve(true);
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
                        reject(new Error('not every division has a worker'));
                        finish = function () {
                        };
                    }
                }

            }.bind(this));
        }
    },
    require('./TerrainMgrLib/state'),
    require('./TerrainMgrLib/bounds'),
    require('./TerrainMgrLib/io')
);

module.exports = TerrainManager;