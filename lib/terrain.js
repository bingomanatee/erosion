var _ = require('lodash');
var TerrainCell = require('./TerrainCell');
var StateMachine = require('javascript-state-machine');
var DIMENSION_SIZE = 2 * 4;

function Terrain(iSize, jSize, values, iStart, jStart) {
    this.iSize = iSize;
    this.jSize = jSize;
    this.iStart = iStart || 0;
    this.jStart = jStart || 0;
    this._cells = [];

    if (_.isArray(values)) {
        for (var i = 0; i < this.iSize; ++i) {
            for (var j = 0; j < this.jSize; ++j) {
                this._cells.push(new TerrainCell(this, i, j, values.shift()));
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

Terrain.prototype = _.extend({

    getHeight: function(i, j) {
        return this._cells[i * this.jSize + j].value
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
}, require('./Terrain/bounds'), require('./Terrain/io'));

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
        data.push(value);
        start += 4;
    }
    return new Terrain(iSize, jSize, data, iStart, jStart);
};

module.exports = Terrain;