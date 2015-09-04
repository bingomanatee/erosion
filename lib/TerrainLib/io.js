var _ = require('lodash');

var _toString = _.template('iSize: <%= iSize %>, jSize: <%= jSize %>, iStart: <%= iStart %>, jStart: <%= jStart %>');

var DIMENSION_SIZE = 2 * 4;

module.exports = {
    toJSON: function(withData) {
        var obj = _.pick(this, ['iSize', 'iStart', 'jSize', 'jStart']);
        if (withData) {
            obj.data = _.pluck(this._cells, 'value').map(Math.floor.bind(Math));
        }
        return obj;
    },

    toData: function() {
        var size = DIMENSION_SIZE // sizing parameters
            + 4 * this._cells.length;
        var buffer = new Buffer(size);
        _.each([this.iSize, this.jSize, this.iStart, this.jStart], function(value, n) {
            buffer.writeInt16LE(value, n * 2);
        });
        _.each(this._cells, function(cell, i) {
            buffer.writeFloatLE(cell.value, (i * 4) + DIMENSION_SIZE);
        });

        return buffer;
    },

    to2Darray: function(annotate) {
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

        return _(this._cells).chunk(this.jSize).map(function(a) {
            return _.pluck(a, 'value');
        }).value();
    },

    slice: function(startI, startJ, endI, endJ) {

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

    toString: function() {
        return _toString(this);
    }
};