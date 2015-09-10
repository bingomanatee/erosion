

module.exports = function(cell, waterFreq, waterAmount, sedDissolve){
    var height = cell.height();
    if (!cell.water) {
        cell.water = 0;
    }
    if (!cell.sed) {
        cell.sed = 0;
    }

    if (Math.random() < waterFreq) {
        cell.water += waterAmount;
    }

    if (cell.water) {
        var sedToDissolve = cell.water * sedDissolve;
        sedToDissolve -= cell.sed / 2;
        cell.sed += sedToDissolve;
        height -= sedToDissolve;
    }

    return height;
};