var util = require('util');
var dataOr = require('./../dataOr');

var waterCell = require('./cell/waterCell');
var dissolve = require('./cell/dissolve');
var flow = require('./cell/flow');
var evaporate = require('./cell/evaporate');

module.exports = function erode(worker, data) {
    var evapRate = dataOr('evapRate', data, 0.75);
    var maxSaturation = dataOr('satRate', data, 0.2);
    var waterFreq = dataOr('waterFreq', data, 0.05);
    var waterAmount = dataOr('waterAmount', data, 4);
    var sedDissolve = dataOr('sedDissolve', data, 0.1);

    return new Promise(function (resolve, reject) {
        try {

            worker.terrain.each(function (cell) {
                waterCell(cell, waterFreq, waterAmount);
            });

            worker.terrain.each(function (cell) {
                dissolve(cell, sedDissolve);
                flow(cell);
            });

            worker.terrain.each(function (cell) {
                cell.resolve();
                evaporate(cell, evapRate, maxSaturation);
            });

            resolve();
        } catch (err) {
            console.log('error in erode', erode);
            reject(err);
        }
    });
};