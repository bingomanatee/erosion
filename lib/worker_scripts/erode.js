var q = require('q');
var util = require('util');
var moveSediment = require('./moveSediment');
var evaporate = require('./evaporate');
var dataOr = require('./../dataOr');
var dissolve = require('./dissolve');


module.exports = function erode(worker, data) {
    var evapRate = dataOr('evapRate' , data, 0.75);
    var maxSaturation = dataOr('satRate', data, 0.2);
    var waterFreq = dataOr('waterFreq', data, 0.05);
    var waterAmount = dataOr('waterAmount', data, 4);
    var sedDissolve = dataOr('sedDissolve', data, 0.1);

    return q.Promise(function (resolve, reject) {
        worker.updateTerrain(function (cell) {
            return dissolve(cell, waterFreq, waterAmount, sedDissolve);
        }).then(function () {
            worker.terrain.each(function (cell) {
                if (cell.water && cell.water > 0) {
                    moveSediment(cell, data);
                }
            });
            worker.terrain.each(function (cell) {
                evaporate(cell, evapRate, maxSaturation);
            });
        });
        resolve();
    });
};