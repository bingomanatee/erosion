var _ = require('lodash');
var TerrainCell = require('./TerrainCell');
var util = require('util');
function Terrain(iSize, jSize, values, iStart, jStart) {
    this.iSize = iSize;
    this.jSize = jSize;
    this.iStart = iStart || 0;
    this.jStart = jStart || 0;
    this._cells = [];
    if (isNaN(iSize) || isNaN(jSize) || (jSize <= 0) || (iSize <= 0)) {
        console.log('terrain with bad arguments: ', util.inspect(arguments));
        throw new Error('bad terrain: ');
    }
    var i, j;
    if (_.isArray(values)) {
        if (values.length != iSize * jSize) {
            console.log('strange count of data: ', values.length, 'expected', iSize * jSize);
        }
        for (i = this.iStart; i < (this.iStart + this.iSize); ++i) {
            for (j = this.jStart; j < (this.jStart + this.jSize); ++j) {
                this._cells.push(new TerrainCell(this, i, j, values.shift()));
            }
        }
    } else {
        for (i = this.iStart; i < (this.iStart + this.iSize); ++i) {
            for (j = this.jStart; j < (this.jStart + this.jSize); ++j) {
                var value = (typeof values === 'function') ? values(i, j, iSize, jSize) : values;
                var cell = new TerrainCell(this, i, j, value);
                this._cells.push(cell);
            }
        }
    }
}

Terrain.prototype = _.extend({

      random: function (cell) {
          return Math.random();
      },

      neighborCells: function (i, j, includeCenter) {
          var cell = this.getCell(i, j);
          if (!cell) {
              throw new Error('cannot get neighbors for cell ' + i + ', ' + j);
          }
          return includeCenter ? cell.neighbors().concat([cell]) : cell.neighbors();
      },

      iMax: function () {
          return this.iStart + this.iSize - 1;
      },

      jMax: function () {
          return this.jStart + this.jSize - 1;
      },

      contains: function (i, j, dist) {
          if (dist) {
              if (this.contains(i, j)) {
                  return true;
              }
              if (i < this.iStart) {
                  if (this.iStart - i > dist) {
                      return false;
                  }
              } else if (i > this.iMax()) {
                  if ((i - this.iMax()) > dist) {
                      return false;
                  }
              }
              if (j < this.jStart) {
                  if ((this.jStart - j) > dist) {
                      return false;
                  }

              } else if (j > this.jMax()) {
                  if ((j - this.jMax()) > dist) {
                      return false;
                  }
              }

              return true;
          }
          return (i >= this.iStart && j >= this.jStart && i <= this.iMax() && j <= this.jMax());
      },

      map: function (delta) {
          return this._cells.map(delta, this);
      },

      each: function (delta) {
          this._cells.forEach(delta, this);
      },

      getCell: function (ii, jj) {
          var i = ii - this.iStart;
          var j = jj - this.jStart;
          if (i >= 0
            && i < this.iSize
            && j >= 0
            && j < this.jSize) {
              return this._cells[i * this.jSize + j]
          } else {
              // console.log(['out of range getHeight', i, j, 'from', JSON.stringify(this.toJSON())].join(' '));
              return null;
          }

      },

      getHeight: function (i, j, checkBounds) {
          return this.getCell(i, j, checkBounds).value;
      },

      setHeight: function (i, j, value) {
          this.getCell(i, j).value = value;
      },

      divide: require('./TerrainLib/divide')
  },
  require('./TerrainLib/bounds'),
  require('./TerrainLib/io'),
  require('./TerrainLib/change'),
  require('./TerrainLib/toPng'));

// this.iSize, this.jSize, this.iStart, this.jStart
Terrain.fromData = require('./TerrainLib/fromData');

module.exports = Terrain;