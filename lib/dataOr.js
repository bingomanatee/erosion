module.exports = function _dataOr(prop, data, alt) {
    return data.hasOwnProperty(prop) ? data[prop] : alt;
};