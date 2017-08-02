'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Route = function Route() {};

Route.propTypes = {
	path: _propTypes2.default.string.isRequired,
	component: _propTypes2.default.func.isRequired
};

exports.default = Route;