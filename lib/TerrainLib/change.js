module.exports = {

    updateTerrain: function (delta) {
        var updated = [];

        this._cells.forEach(function (cell) {
            updated.push(delta(cell));
        }.bind(this));

        updated.forEach(function (value, i) {
            this._cells[i].value = value;
        }.bind(this));
    },

    each: function (delta) {
        this._cells.forEach(delta.bind(this));
    }

};