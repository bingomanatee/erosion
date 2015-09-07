var _ = require('lodash');
var _toString = _.template('iSize: <%= iSize %>, jSize: <%= jSize %>, iStart: <%= iStart %>, jStart: <%= jStart %>');
var SmartBuffer = require('smart-buffer');
var DIMENSION_SIZE = 4 * 4;
var CONST = require('./../util/const.json');

module.exports = {
    toJSON: function (withData) {
        var obj = _.pick(this, ['iSize', 'iStart', 'jSize', 'jStart']);
        if (withData) {
            obj.data = _.pluck(this._cells, 'value').map(Math.floor.bind(Math));
        }
        return obj;
    },

    toData: function (encoding) {
        if (!encoding) {
            encoding = CONST.encoding;
        }
        var size = DIMENSION_SIZE // sizing parameters
          + 4 * this._cells.length;
        var buffer = new SmartBuffer(size, encoding);
        buffer.writeInt16LE(this.iSize);
        buffer.writeInt16LE(this.jSize);
        buffer.writeInt16LE(this.iStart);
        buffer.writeInt16LE(this.jStart);

        _.each(this._cells, function (cell) {
            buffer.writeFloatLE(cell.value);
        });

        return buffer.toBuffer();
    },

    to2Darray: function (annotate) {
        if (annotate) {
            var out = [];
            for (var i = 0; i < this.iSize; ++i) {
                var row = [];
                for (var j = 0; j < this.jSize; ++j) {
                    row.push('i:' + i + ',j:' + j + ':' + this.getHeight(i, j));
                }
                out.push(row);
            }
            return out;
        }

        return _(this._cells).chunk(this.jSize).map(function (a) {
            return _.pluck(a, 'value');
        }).value();
    },

    slice: function (startI, startJ, endI, endJ) {

        var out = [];

        for (var i = startI; i < endI; ++i) {
            for (var j = startJ; j < endJ; ++j) {
                if (i < 0 || j < 0 || j >= this.jSize || i >= this.iSize) {
                    out.push(null);
                } else {
                    out.push(this._cells[i * this.jSize + j].value);
                }
            }
        }

        return out;
    },

    toString: function () {
        return _toString(this);
    }
};