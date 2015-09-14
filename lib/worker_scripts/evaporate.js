module.exports = function evaporate(cell, evapRate, maxSaturation) {
    if (cell.water > 0) {
        cell.water *= evapRate;
        if (cell.water < 0.01) {
            cell.water = 0;
        }
        if (cell.sed >= 0) {
            var maxSed = cell.water * maxSaturation;
            if (maxSed < cell.sed) {
                cell.value += cell.sed - maxSed;
                cell.sed = maxSed;
            }
        }

    }
    else if (cell.sed > 0) {
        cell.value += cell.sed;
        cell.sed = 0;
    }
};