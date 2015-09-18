module.exports = {
    _boundsRow: function (label, spec) {
        var iMin = (spec.i.hasOwnProperty('min')) ? spec.i.min : spec.i;
        var iMax = (spec.i.hasOwnProperty('max')) ? spec.i.max : spec.i;
        var jMin = (spec.j.hasOwnProperty('min')) ? spec.j.min : spec.j;
        var jMax = (spec.j.hasOwnProperty('max')) ? spec.j.max : spec.j;
        var data = {
            label: label,
            iMin: iMin,
            iMax: iMax,
            jMin: jMin,
            jMax: jMax,
            heights: []
        };

        if (iMin === iMax) {
            for (var j = jMin; j < jMax; ++j) {
                data.heights.push(this.getHeight(i, j));
            }
        } else {
            for (var i = iMin; i < iMax; ++i) {
                data.heights.push(this.getHeight(i, j));
            }
        }


        data.heights = require('./../util/floatsToBuffer')(data.heights);
    },

    getBoundsCell: function (ii, jj) {
        if (!this._boundsIndex) {
            return null;
        }
        var index = ii + ',' + jj;
        if (this._boundsIndex[index]) {
            return this._boundsIndex[index];
        } else {
            return null;
        }
    },

    boundsData: function () { // The contents of each edge of this data. .
        var out = [];
        out.push(this._boundsRow('iMin', {
            j: this.jStart,
            i: {min: this.iStart, max: this.iStart + this.iSize - 1}
        }));
        out.push(this._boundsRow('iMax', {
            j: this.jStart + this.jSize - 1,
            i: {min: this.iStart, max: this.iStart + this.iSize - 1}
        }));
        out.push(this._boundsRow('jMin', {
            i: this.iStart,
            j: {min: this.jStart, max: this.jStart + this.jSize - 1}
        }));
        out.push(this._boundsRow('jMax', {
            i: this.iStart + this.iSize - 1,
            j: {min: this.jStart, max: this.jStart + this.jSize - 1}
        }));
    },

    neighbors: function () {
        return {
            iMin: this.iStart - 1,
            iMax: this.iStart + this.iSize + 1,
            jMin: this.jStart - 1,
            jMax: this.jStart + this.jSize + 1
        };
    },
}