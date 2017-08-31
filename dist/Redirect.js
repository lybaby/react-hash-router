'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

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

var Redirect = function (_React$Component) {
	_inherits(Redirect, _React$Component);

	function Redirect() {
		_classCallCheck(this, Redirect);

		return _possibleConstructorReturn(this, (Redirect.__proto__ || Object.getPrototypeOf(Redirect)).apply(this, arguments));
	}

	_createClass(Redirect, [{
		key: 'componentWillMount',
		value: function componentWillMount() {
			var _props$context = this.props.context,
			    match = _props$context.match,
			    query = _props$context.query,
			    props = _props$context.props;

			var path = props.to.replace(/:[a-zA-Z][a-zA-Z0-9]*/g, function (m) {
				var variable = m.slice(1);
				if (variable in match) {
					return match[variable];
				} else {
					return '';
				}
			});
			this.redirectURI = query === null ? path : path + '?' + query;
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			var props = this.props.context.props;

			if (props.replace) {
				_h.history.replaceWith(this.redirectURI);
			} else {
				_h.history.navigateTo(this.redirectURI);
			}
		}
	}, {
		key: 'render',
		value: function render() {
			return _react2.default.createElement(
				'div',
				null,
				'redirect to: ',
				this.redirectURI
			);
		}
	}]);

	return Redirect;
}(_react2.default.Component);

// <Redirect path="" to="" replace />


Redirect.propTypes = {
	context: _propTypes2.default.shape()
};
Redirect.defaultProps = {
	context: {}
};
exports.default = Redirect;