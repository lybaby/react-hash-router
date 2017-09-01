'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Container = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _h = require('./h');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// route
var Route = function Route() {};

Route.propTypes = {
	path: _propTypes2.default.string.isRequired,
	component: _propTypes2.default.func.isRequired
};

exports.default = Route;

// route container

var Container = function (_React$Component) {
	_inherits(Container, _React$Component);

	function Container() {
		var _ref;

		var _temp, _this, _ret;

		_classCallCheck(this, Container);

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Container.__proto__ || Object.getPrototypeOf(Container)).call.apply(_ref, [this].concat(args))), _this), _this.shouldComponentUpdate = function (nextProps) {
			if (JSON.stringify(nextProps.context) === JSON.stringify(_this.props.context) && nextProps.component === _this.props.component) {
				if (nextProps.className !== _this.props.className) {
					_this.container.className = 'route ' + nextProps.className;
				}
				return false;
			}
			return true;
		}, _temp), _possibleConstructorReturn(_this, _ret);
	}

	_createClass(Container, [{
		key: 'render',
		value: function render() {
			var _this2 = this;

			var _props = this.props,
			    className = _props.className,
			    context = _props.context,
			    component = _props.component;

			var Component = component;

			return _react2.default.createElement(
				'div',
				{
					className: 'route ' + className,
					'data-uri': context.uri,
					ref: function ref(_ref2) {
						_this2.container = _ref2;
					}
				},
				_react2.default.createElement(Component, {
					context: _extends({}, context, { observer: _h.observer, navigateTo: _h.history.navigateTo, backTo: _h.history.backTo, replaceWith: _h.history.replaceWith }),
					key: context.uri
				})
			);
		}
	}]);

	return Container;
}(_react2.default.Component);

Container.propTypes = {
	component: _propTypes2.default.func.isRequired,
	context: _propTypes2.default.shape(),
	className: _propTypes2.default.string
};
Container.defaultProps = {
	context: {},
	className: ''
};
exports.Container = Container;