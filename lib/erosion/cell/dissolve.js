module.exports = function (cell, dissolveRate) {
    if (cell.water <= 0) {
        return;
    }

    var dissolveAmount = cell.water * dissolveRate;
    if (cell.sed > 0) {
        var retainedSed = cell.sed / 2;
        dissolveAmount -= retainedSed;
    }

    if (dissolveAmount > 0) {
        cell.sed -= dissolveAmount;
        cell.value -= dissolveAmount;
    }
};