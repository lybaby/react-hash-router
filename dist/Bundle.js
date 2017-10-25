var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React from 'react';
import PropTypes from 'prop-types';

var Bundle = function (_React$Component) {
	_inherits(Bundle, _React$Component);

	function Bundle() {
		var _ref;

		var _temp, _this, _ret;

		_classCallCheck(this, Bundle);

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Bundle.__proto__ || Object.getPrototypeOf(Bundle)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
			module: null
		}, _temp), _possibleConstructorReturn(_this, _ret);
	}

	_createClass(Bundle, [{
		key: 'componentWillMount',
		value: function componentWillMount() {
			this.load(this.props);
		}
	}, {
		key: 'componentWillReceiveProps',
		value: function componentWillReceiveProps(nextProps) {
			if (nextProps.load !== this.props.load) {
				this.load(nextProps);
			}
		}
	}, {
		key: 'load',
		value: function load(props) {
			var _this2 = this;

			this.setState({ module: null });
			props.load(function (module) {
				_this2.setState({ module: module.default ? module.default : module });
			});
		}
	}, {
		key: 'render',
		value: function render() {
			if (!this.state.module) {
				return false;
			}
			var Component = this.state.module;
			var props = Object.assign({}, this.props);
			delete props.load;
			return React.createElement(Component, props);
		}
	}]);

	return Bundle;
}(React.Component);

Bundle.propTypes = {
	load: PropTypes.func.isRequired
};
export default Bundle;