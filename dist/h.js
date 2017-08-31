'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.history = exports.observer = undefined;

var _History = require('./History');

var _History2 = _interopRequireDefault(_History);

var _Observer = require('./Observer');

var _Observer2 = _interopRequireDefault(_Observer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var observer = new _Observer2.default();
var history = new _History2.default(observer);

exports.observer = observer;
exports.history = history;