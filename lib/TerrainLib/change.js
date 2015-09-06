
module.exports = {

    update: function(delta){
        var updated = [];

        this._cells.forEach(function(cell){
            updated.push(delta(cell));
        }.bind(this));
        updated.forEach(function(value, i){
           this._cells[i].value = value;
        }.bind(this));
    }

};