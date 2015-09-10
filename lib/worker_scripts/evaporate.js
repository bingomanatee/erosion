module.exports = function evaporate(cell, evapRate, maxSaturation) {
    if (cell.water > 0) {
        cell.water *= evapRate;
        if (cell.water < 0.01) {
            cell.water = 0;
        } else {
            var maxSed = cell.water * maxSaturation;
            if (maxSed > cell.sed) {
                var drySed = cell.sed - maxSed;
                cell.value += drySed;
                cell.sed = maxSed;
            }
        }
    }

    if (cell.sed > 0) {
        cell.value += cell.sed;
        cell.sed = 0;
    }
};