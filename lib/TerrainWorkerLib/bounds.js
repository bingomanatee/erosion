var SmartBuffer = require('smart-buffer');
var CONST = require('./../util/const.json');
var util = require('util');

module.exports = {

    sendBorderCellUpdate: function () {
        return new Promise(function (resolve, reject) {
            if (!this.terrain._bounds || !this.terrain._bounds.length) {
                console.log('no boundry cells');
                resolve();
            } else {
                var buffer = new SmartBuffer();
                console.log('updating border data from bounds:', this.terrain._bounds.length);

                this.terrain._bounds.forEach(function (boundCell) {
                    boundCell.recordBorderChange(buffer);
                });

                this.hub.requestMaster('updateBounds', buffer.toString(CONST.encoding), function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                })
            }
        }.bind(this));
    },

    processBorderCellUpdates: function (data) {
        console.log(' ********** processBorderCellUpdates', util.inspect(data));
        var buffer = new SmartBuffer(data, CONST.encoding);

        while (buffer.remaining() > 0) {
            var i = buffer.readInt16LE();
            var j = buffer.readInt16LE();
            var heightChange = buffer.readFloatLE();
            var waterChange = buffer.readFloatLE();
            var sedChange = buffer.readFloatLE();

            var cell = this.terrain.getCell(i, j);
            if (cell) {
                this.cell.sed += sedChange;
                this.cell.water += waterChange;
                this.cell.value += heightChange;
            }
        }
    }

};