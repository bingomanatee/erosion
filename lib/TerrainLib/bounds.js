module.exports = {
    setBounds: function (bounds) {
        this._boundsIndex = bounds.reduce(function (out, bound) {
            out[bound.i + ',' + bound.j] = bound;
            return out;
        }.bind(this), {});
        this._bounds = _.values(this._boundsIndex); // removes redundant values;
        this._bounds = _.sortBy(function (cell) {
            return cell.i * jSize + cell.j;
        }.bind(this));
    },

    getBounds: function () {
        return this._bounds;
    },

    snapshotBounds: function () {
        if (!this._bounds) {
            return;
        }

        this._bounds.forEach(function (cell) {
            cell.snapshot();
        });
    },

    boundsDiffToBuffer: function(buffer){
        if (!this._bounds) return buffer;

        this._bounds.forEach(function(cell){
            cell.snapshotToBuffer(buffer);
        });

        return buffer;
    }
};