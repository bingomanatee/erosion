module.exports = {
    _boundsRow: function(label, spec){
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

        if (iMin === iMax){
            for (var j = jMin; j < jMax; ++j){
                data.heights.push(this.getHeight(i, j));
            }
        } else {
            for (var i = iMin; i < iMax; ++i){
                data.heights.push(this.getHeight(i, j));
            }
        }

        data.heights = require('./../util/floatsToBuffer')(data.heights);
    },

    boundsData: function(){ // The contents of each edge of this data. .
        var out = [];
        out.push(this._boundsRow('iMin', {j: 0, i: {min: 0, max: this.iSize}}));
        out.push(this._boundsRow('iMax', {j: this.jSize - 1, i: {min: 0, max: this.iSize}}));
        out.push(this._boundsRow('jMin', {i: 0, j: {min: 0, max: this.jSize}}));
        out.push(this._boundsRow('jMax', {i: this.iSize - 1, j: {min: 0, max: this.jSize}}));
    },

    neighbors: function() {
        return {
            iMin: this.iStart - 1,
            iMax: this.iStart + this.iSize + 1,
            jMin: this.jStart - 1,
            jMax: this.jStart + this.jSize + 1
        };
    },
}