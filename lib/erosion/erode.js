var util = require('util');
var dataOr = require('./../dataOr');

var waterCell = require('./cell/waterCell');
var flow = require('./cell/flowToNeighbors');
var evaporate = require('./cell/evaporate');

var q = require('q');
module.exports = function erode(worker, data) {
    var evapRate = dataOr('evapRate', data, 0.75);
    var maxSaturation = dataOr('satRate', data, 0.2);
    var waterFreq = dataOr('waterFreq', data, 0.05);
    var waterAmount = dataOr('waterAmount', data, 4);
    var sedDissolve = dataOr('sedDissolve', data, 0.1);
    var neighborWaterAmount = dataOr('neighborWaterAmount', data, waterAmount / 2);
    var distance = dataOr('distance', data, 2);
    var noScale = dataOr('noScale', data, false);
    return q.Promise(function (resolve, reject) {
        try {

            if (worker.terrain._bounds) {
                worker.terrain.snapshotBounds();
            }

            worker.terrain.each(function (cell) {
                cell.initBorderChange();
                waterCell(cell, waterFreq, waterAmount, neighborWaterAmount, noScale);
            });

            worker.terrain.each(function (cell) {
                flow(cell, sedDissolve, distance);
            });

            worker.terrain.each(function (cell) {
                cell.clean2values();
                evaporate(cell, evapRate, maxSaturation);
            });

            resolve(worker.borderDiffs())
        } catch (err) {
            console.log('error in erode', erode);
            reject(err);
        }
    });
};