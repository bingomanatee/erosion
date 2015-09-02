var _ = require('lodash');
var TerrainCell = require('./TerrainCell');

function Terrain(iSize, jSize, values, iStart, jStart) {
    this.iSize = iSize;
    this.jSize = jSize;
    this.iStart = iStart || 0;
    this.jStart = jStart || 0;
    this._cells = [];

    if (_.isArray(values)) {
        var n = 0;
        for (var i = 0; i < this.iSize; ++i) {
            for (var j = 0; j < this.jSize; ++j) {
                this._cells[n] = new TerrainCell(this, i, j, values[n]);
                ++n;
            }
        }
    } else {
        for (var i = 0; i < this.iSize; ++i) {
            for (var j = 0; j < this.jSize; ++j) {
                var value = (typeof values === 'function') ? values(i, j) : values;
                var cell = new TerrainCell(this, i, j, value);
                this._cells.push(cell);
            }
        }
    }

}

var _toString = _.template('iSize: <%= iSize %>, jSize: <%= jSize %>, iStart: <%= iStart %>, jStart: <%= jStart %>');
var DIMENSION_SIZE = 2 * 4;

Terrain.prototype = {

    getHeight: function (i, j) {
        return this._cells[i * this.jSize + j].value
    },

    toData: function () {
        var size = DIMENSION_SIZE // sizing parameters
          + 4 * this.iSize * this.jSize;
        var buffer = new Buffer(size);
        _.each([this.iSize, this.jSize, this.iStart, this.jStart], function (value, n) {
            buffer.writeInt16LE(value, n * 2);
        });
        _.each(this._cells, function (cell, i) {
            buffer.writeFloatLE(cell.value, i * 4 + DIMENSION_SIZE);
        });

        return buffer;
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
    },

    divide: function (number) {
        //   console.log('dividing', this.toString(), 'by', number);
        var iSize1, iSize2, jSize1, jSize2;
        var iStart1, iStart2, jStart1, jStart2;

        if (number == 1) {
            return [this];
        }

        iStart1 = jStart1 = 0;
        iStart2 = jStart2 = 0;
        jSize1 = jSize2 = this.jSize;
        iSize1 = iSize2 = this.iSize;

        if (this.iSize <= this.jSize) {
            jSize1 = jStart2 = Math.floor(this.jSize / 2);
            jSize2 = this.jSize - jSize1;
        } else {
            iSize1 = iStart2 = Math.floor(this.iSize / 2);
            iSize2 = this.iSize - iSize1;
        }

        //    console.log('size: ', this.iSize, this.jSize);

        //    console.log('iStart1', iStart1, 'jStart1:' , jStart1, 'iSize1', iSize1 ,'jSize1:', jSize1);
        //    console.log('iStart2', iStart2, 'jStart2:' , jStart2, 'iSize2', iSize2 ,'jSize2:', jSize2);
        var terrain1 = new Terrain(iSize1, jSize1,
          this.slice(iStart1, jStart1, iSize1, jSize1),
          this.iStart,
          this.jStart);
        var terrain2 = new Terrain(iSize2, jSize2,
          this.slice(iStart2, jStart2, this.iSize, this.jSize),
          iStart2 + this.iStart,
          jStart2 + this.jStart);

        var divide1 = Math.floor(number / 2);
        var divide2 = number - divide1;

        return terrain1.divide(divide1).concat(terrain2.divide(divide2));
    }
};

// this.iSize, this.jSize, this.iStart, this.jStart
Terrain.fromData = function (buffer) {
    var iSize = buffer.readInt16LE(0);
    var jSize = buffer.readInt16LE(2);
    var iStart = buffer.readInt16LE(4);
    var jStart = buffer.readInt16LE(6);
    var start = DIMENSION_SIZE;
    var data = [];
    while (start <= buffer.length - 4) {
        var value = buffer.readFloatLE(start);
        console.log('value: ', value);
        data.push(value);
        start += 4;
    }
    return new Terrain(iSize, jSize, data, iStart, jStart);
};

module.exports = Terrain;