var util = require('util');

module.exports = function (cell, waterFreq, waterAmount, sedDissolve) {
    if (cell.terrain.random(cell) < waterFreq) {
        cell.water += waterAmount;
    } else if (!cell.water) {
        return;
    }

    var sedToDissolve = cell.water * sedDissolve;
    sedToDissolve -= cell.sed / 2;

    //console.log(util.format('dissolving cell %s with sed amount %s based on sedDissolve %s and water %s',
    //  cell.toString(), sedToDissolve, sedDissolve, cell.water));

    cell.sed += sedToDissolve;
    cell.value -= sedToDissolve;
};