var util = require('util');
var moveSediment = require('./moveSediment');
var dataOr = require('./../dataOr');
var dissolve = require('./cell/dissolve');
var flow = require('./cell/flow');

module.exports = function erode(worker, data) {
    var evapRate = dataOr('evapRate', data, 0.75);
    var maxSaturation = dataOr('satRate', data, 0.2);
    var waterFreq = dataOr('waterFreq', data, 0.05);
    var waterAmount = dataOr('waterAmount', data, 4);
    var sedDissolve = dataOr('sedDissolve', data, 0.1);

    return new Promise(function (resolve, reject) {
        worker.terrain.each(function(cell){
            dissolve(cell, sedDissolve);
            flow(cell);
        });

        worker.terrain.each(function(cell){
            cell.resolve();
            evaporate(cell, evapRate, maxSaturation);
        });

        resolve();
    });
};