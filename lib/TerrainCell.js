function TerrainCell(terrain, i, j, value, meta) {
    this.terrain = terrain;
    this.i = i;
    this.j = j;
    this.value = value;
    if (arguments.length > 4) {
        this.meta = meta;
    }
    this.water = this.sed = this.water2 = this.sed2 = 0;
}

var _ = require('lodash');
var _toString = _.template('<<CELL{<%= i %>, <%= j %>},' +
  ' water: <%= _.round(water, 2) %> (<%=  _.round(water + water2, 2) %>), ' +
  'sed: <%=  _.round(sed, 2) %> (<%=  _.round(sed + sed2, 2) %>), ' +
  'height: <%=  _.round(value, 2) %> (total: <%=  _.round(water + water2 + sed + sed2 + value, 2) %>) >>');

TerrainCell.prototype = {

    neighbors: function () {
        if (!this._neighbors) {
            this._initNeighbors();
        }
        return this._neighbors;
    },

    toString: function () {
        return _toString(this);
    },

    height: function (value) {
        if (arguments.length > 0) {
            this.value = value;
            return this.value;
        } else if (this.value !== null) {
            return this.value;
        } else if (this.meta === 'absent') {
            var bounds = this.terrain.getBoundsCell(this.i, this.j);
            if (bounds) {
                return bounds.value;
            }
        }
        return null;
    },

    _initNeighbors: function () {
        this._neighbors = [];

        for (var i = this.i - 1; i <= this.i + 1; ++i) {
            for (var j = this.j - 1; j <= this.j + 1; ++j) {
                if (!((i === this.i) && (j === this.j))) {
                    var cell = this.terrain.getCell(i, j);
                    if (cell) {
                        this._neighbors.push(cell);
                    } else {
                        this._neighbors.push(new TerrainCell(this.terrain, i, j, null, 'absent'));
                    }
                }
            }
        }
    }
};

module.exports = TerrainCell;