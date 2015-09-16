var NEAR_RANGE = 0.05;

module.exports = function (cell, evapRate, maxSaturation) {

    if (cell.water) {
        cell.water *= evapRate;
        if (cell.water <= NEAR_RANGE) {
            cell.water = 0;
            cell.value += cell.sed;
            cell.sed = 0;
        }
        var maxSed = cell.water * maxSaturation;
        var dryAmount = cell.sed - maxSed;
        if (dryAmount > 0) {
            cell.value += dryAmount;
            cell.sed = maxSed;
        }
    } else if (cell.sed > 0){
        cell.value += cell.sed;
        cell.sed = 0;

    }

}