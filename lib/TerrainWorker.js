var Terrain = require('./terrain.js');
var Hub = require('cluster-hub');
var cluster = require('cluster');
var q = require('q');
var _ = require('lodash');
var CONST = require('./util/const.json');

function _boundsJSON(data) {
    return data.map(function(item) {
        return _.pick(item, ['i', 'j', 'value']);
    })
}

function TerrainWorker(terrain) {
    if (terrain) {
        this.terrain = terrain;
    }

    if (cluster.isWorker) { // normally always true; but can be false under test scenarios
        this.hub = new Hub();

        this.hub.on('initDivision', function(data, sender, callback) {
            this.createTerrain(data.data, CONST.encoding);
            callback(null, this.terrain.toJSON());
        }.bind(this));

        this.hub.on('initBounds', function(data, sender, callback) {
            this.askBounds()
                .then(function() {
                    callback(null, data.echo ? _boundsJSON(this.terrain.getBounds()) : true);
                }.bind(this));
        }.bind(this));

        this.hub.on('updateBounds', function(data, sender, callback){
            this.updateFromBounds(data);
            callback();
        });

        this.hub.on('die', function(data, sender, callback) {
            callback();
            setTimeout(function() {
                process.exit.bind(process);
            }, 100);
        });

        this.hub.on('update', function(data, sender, callback) {
            this.updateTerrain(data).then(function(result) {
                callback(null, result);
            }, callback);
        }.bind(this));

        this.hub.on('updateBorderCellChanges', function(data, sender, callback){
            this.processBorderCellUpdates(data);
            callback();
        }.bind(this));

        this.hub.on('feedback', function(data, sender, callback){
            callback(null, {
                source: this.terrain.toJSON(),
                data: this.terrain.toData(data.full).toString(CONST.encoding)
            });
        }.bind(this))
    }
}

TerrainWorker.prototype = _.extend({
    askBounds: function() {
        return q.Promise(function(resolve, reject) {
            this.hub.requestMaster('getBounds', this.terrain.toJSON(), function(err, boundsStr) {
                if (err) {
                    console.log('error from bounds: ', err);
                    reject(err);
                } else {
                    var boundsData = TerrainWorker.decodeBounds(boundsStr);
                    this.terrain.setBounds(boundsData);
                    resolve(true);
                }
            }.bind(this));
        }.bind(this));
    },

    createTerrain: function(data) {
        this.terrain = Terrain.fromData(data);
    },

    updateTerrain: function(config) {
        return q.Promise(function(resolve, rej) {
            function reject(err) {
                console.log('error in updateTerran', err);
                rej(err);
            }

            if (!config.script) {
                return reject('no script in data for updateTerrain');
            }
            try {
                var executor = require(config.script);
            } catch (err) {
                console.log('cannot load script ', config.script, ': ', err);
                return reject(err);
            }
            var count = 0;

            function finish() {
                if (config.feedback) {
                    resolve({
                        source: this.terrain.toJSON(),
                        data: this.terrain.toData().toString(CONST.encoding)
                    });
                } else {
                    resolve(true);
                }
            }

            finish = finish.bind(this);

            console.log('config: ', config);
            var noisy = config.noisy;

            function loop() {
                executor(this, _.clone(config)).then(function() {
                    ++count;
                    if (noisy && !(count % noisy)) {
                        console.log('worker ' ,this.terrain.toString(),' finished rep ' + count, 'of' , config.reps);
                    }

                    if (count >= config.reps) {
                        finish();
                    }
                    else {
                        loop();
                    }
                }.bind(this), function(err) {
                    console.log('error on loop: ', count, err);
                    reject(err);
                });
            }

            loop = loop.bind(this);

            if (config.askBounds) {
                this.askBounds()
                    .then(function(){
                        loop();
                    }, function(err) {
                        console.log('error asking for bounds', err);
                        reject(err);
                    });
            } else {
                loop();
            }
        }.bind(this));
    }
},
 require('./TerrainWorkerLib/bounds')
);

TerrainWorker.decodeBounds = require('./TerrainWorkerLib/decodeBounds');

module.exports = TerrainWorker;