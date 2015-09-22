var _ = require('lodash');
var SmartBuffer = require('smart-buffer');
var CONST = require('./../util/const.json');

function _j(buffer) {
    var data = buffer.toJSON();
    var l = buffer.length;
    console.log('data.length: ', data.data.length, 'l:', l);
}

module.exports = {
    triggerRequestBounds: function(){
        return new Promise(function(resolve, reject){
            this.hub.requestAllWorkers('doRequestBounds', {}, function(err, result){
                if (err) return reject(err);
                console.log('doRequestBounds result: ', err, result);
                resolve(true);
            });
        }.bind(this));
    },

    boundsFor: function (requestor) {
        var cells = [];

        var i = requestor.iStart - 1;
        var j = requestor.jStart - 1;

        // "TOP"
        for (j = requestor.jStart - 1; j <= requestor.jStart + requestor.jSize; ++j) {
            cells.push(this.masterTerrain.getCell(i, j));
        }

        j = requestor.jStart - 1;
        // "LEFT"
        for (i = requestor.iStart - 1; i <= requestor.iStart + requestor.iSize; ++i) {
            cells.push(this.masterTerrain.getCell(i, j));
        }

        i = requestor.iStart + requestor.iSize + 1;
        // "BOTTOM"
        for (j = requestor.jStart - 1; j <= requestor.jStart + requestor.jSize; ++j) {
            cells.push(this.masterTerrain.getCell(i, j));
        }

        j = requestor.jStart + requestor.jSize + 1;
        // "RIGHT"
        for (i = requestor.iStart - 1; i <= requestor.iStart + requestor.iSize; ++i) {
            cells.push(this.masterTerrain.getCell(i, j));
        }

        cells = _(cells).compact().uniq().value();

        var json = cells.map(function (cell) {
            return cell.toJSON();
        });

        var buffer = new SmartBuffer(12 * json.length, CONST.encoding);

        cells.forEach(function(cell){
            cell.toBuffer(buffer);
        });

        return {
            data: json,
            buffer: buffer.toString(CONST.encoding)
        };
    }

};