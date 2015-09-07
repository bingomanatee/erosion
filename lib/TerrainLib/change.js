
module.exports = {

    updateTerrain: function(delta){
        var updated = [];

        this._cells.forEach(function(cell){
            updated.push(delta(cell));
        }.bind(this));

        console.log('updating terrain based on ', updated);

        updated.forEach(function(value, i){
           this._cells[i].value = value;
        }.bind(this));
    }

};