var NEAR_RANGE = 0.05;

module.exports = function(cell, evapRate, maxSaturation) {

    if (cell.water) {
        cell.water *= evapRate;
        if (cell.water <= NEAR_RANGE) {
            cell.water = 0;
        }
        if (cell.sed > 0) {
            var maxSed = cell.water * maxSaturation;
            var dryAmount = (cell.sed - maxSed) / 2;
            if (dryAmount > 0) {
                cell.sed -= dryAmount;
                dryAmount *= 0.8;
                cell.value += dryAmount;
            }
        }
    } else if (cell.sed > 0) {
        cell.value += cell.sed / 2;
        cell.sed /= 2;
        if (cell.sed < NEAR_RANGE) {
            cell.value += cell.sed;
            cell.sed = 0;
        }

    }

};