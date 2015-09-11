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

    dataSummary: function (size, cfg) {
        var Table = require('cli-table');
        if (!cfg) {
            cfg = {};
        }
        if (!size) {
            size = 8;
        }

        var data = this.to2Darray(true);
      //  console.log('data:', data);

        var size2 = Math.floor(size / 2);

        var colsToRemove = data[0].length - (size + 1);

        if (colsToRemove > 0) {
            data.forEach(function (row) {
                row.splice(size2 + 1, colsToRemove, '...');
            })
        }

        data = data.map(function (row) {
            if (row.length <= size) {
                return row;
            }
            return row.slice(0, size2 + 1).concat(['...'])
              .concat(row.slice(-size2));
        });

        var rowsToRemove = data.length - 1 - size;

        if (rowsToRemove > 0) {
            if (rowsToRemove > 1) {
                data.splice(size2 + 1, rowsToRemove - 1);
            }
            for (var j = 0; j < data[0].length; ++j) {
                data[size2 + 1][j] = '...';
            }
        }


        cfg.head = data.shift();
        var table = new Table(cfg);
     //   console.log('cfg:', cfg);
     //   console.log('data:', data);

        data.forEach(function (row) {
            table.push(row);
        });

        return table.toString();

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

    to2Darray: function (heads) {
        var out = [];

        if (heads) {
            out.push([''].concat(_.range(this.iStart, this.iStart + this.iSize).map(function (n) {
                return 'j:' + n;
            })));
        }
        var iStart = this.iStart;
        out = out.concat(
          _(this._cells).chunk(this.jSize).map(function (a) {
              return _.pluck(a, 'value');
          }).map(function (row, i) {
              if (heads) {
                  row.unshift('i:' + (i + iStart));
              }
              return row;
          }).value());

        return out;
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

    updateData: function (data) {
        //   console.log('data: ', data);
        var buffer = new Buffer(data, CONST.encoding);
        var sBuffer = new SmartBuffer(buffer);
        var iSize = sBuffer.readInt16LE();
        var jSize = sBuffer.readInt16LE();
        var iStart = sBuffer.readInt16LE();
        var jStart = sBuffer.readInt16LE();

        //    console.log('updating from', iStart, jStart, iSize, jSize);
        //    console.log('before updateData: ', this.to2Darray());

        for (var i = iStart; i < iStart + iSize; ++i) {
            for (var j = jStart; j < jStart + jSize; ++j) {
                this.getCell(i, j).height(sBuffer.readFloatLE());
            }
        }

        //   console.log('after updateData: ', this.to2Darray());
    },

    toString: function () {
        return _toString(this);
    }
};