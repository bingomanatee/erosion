var SmartBuffer = require('smart-buffer');
var CONST = require('./../util/const.json');
var util = require('util');
var decodeBounds = require('./../TerrainWorkerLib/decodeBounds');
var TerrainCell = require('./../TerrainCell');
module.exports = {

    borderDiffs: function(){
        if (!this.terrain._bounds) return null;

        var buffer = new SmartBuffer(this.terrain._bounds.length * 12, CONST.encoding);

        this.terrain.boundsDiffToBuffer(buffer);

    },

    requestBounds: function () {
        return new Promise(function (resolve, reject) {
            this.hub.requestMaster('requestBounds',  this.toJSON(), function (err, data) {
                if (err) {
                    return reject(err);
                }

                var buffer = new SmartBuffer(new Buffer(data.buffer, CONST.encoding));
                var cells = [];
                while(buffer.remaining() > 0){
                    cells.push(TerrainCell.fromBuffer(this.terrain, buffer));
                }

                console.log('============ WORKER: recieved bounds for ', this.toJSON(), ': data from master:', data, '... buffer decoded:', cells);

                this.terrain.setBounds(cells);
                resolve(true);
            }.bind(this));
        }.bind(this));
    }
};