var q = require('q');
var util = require('util');
var moveSediment = require('./moveSediment');
var resolveMoveSediment = require('./resolveMoveSediment');
var evaporate = require('./evaporate');
var dataOr = require('./../dataOr');
var dissolve = require('./dissolve');

module.exports = function erode(worker, data) {
    var evapRate = dataOr('evapRate', data, 0.75);
    var maxSaturation = dataOr('satRate', data, 0.2);
    var waterFreq = dataOr('waterFreq', data, 0.05);
    var waterAmount = dataOr('waterAmount', data, 4);
    var sedDissolve = dataOr('sedDissolve', data, 0.1);

    return new Promise(function (resolve, reject) {

        try {
            console.log('---------- initial terrain:');
            //  worker.terrain.erosionReport();
            worker.terrain.each(function (cell) {
                dissolve(cell, waterFreq, waterAmount, sedDissolve);
            });

            console.log('---------- after dissolve:');
            // worker.terrain.erosionReport();

            worker.terrain.each(moveSediment);
            worker.terrain.each(resolveMoveSediment);

            console.log('---------- after moveSediment:');
            //  worker.terrain.erosionReport();

            worker.terrain.each(function (cell) {
                evaporate(cell, evapRate, maxSaturation);
            });

            console.log('---------- after evaporate:');
            //      worker.terrain.erosionReport();
            resolve();
        } catch (err) {
            console.log('erode error: ', err);
            reject(err);
        }

    });
};