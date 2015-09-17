var NEAR_RANGE = 0.00000005;

module.exports = function(cell, evapRate, maxSaturation) {

    if (cell.water) {
        if (cell.water <= NEAR_RANGE) {
            cell.water = 0;
        }
        cell.water *= evapRate;
        if (cell.sed > 0) {
            var maxSed = cell.water * maxSaturation;
            var dryAmount = cell.sed - maxSed;
            if (dryAmount > 0) {
                cell.sed -= dryAmount;
                cell.value += dryAmount/2; // half of the sediment blows away with the water.
                // not realistic but gives better terrain.
            }
        }
    } else if (cell.sed < NEAR_RANGE) {
        cell.value += cell.sed;
        cell.sed = 0;
    } else if (cell.sed > 0) {
        cell.value += cell.sed / 2;
        cell.sed /= 2;
    }
};