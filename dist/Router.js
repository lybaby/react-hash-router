'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _NotFound = require('./NotFound');

var _NotFound2 = _interopRequireDefault(_NotFound);

var _Route = require('./Route');

var _Route2 = _interopRequireDefault(_Route);

var _Redirect = require('./Redirect');

var _Redirect2 = _interopRequireDefault(_Redirect);

var _Observer = require('./Observer');

var _Observer2 = _interopRequireDefault(_Observer);

var _History = require('./History');

var _History2 = _interopRequireDefault(_History);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var observer = new _Observer2.default();

var Router = function (_React$Component) {
	_inherits(Router, _React$Component);

	function Router(props) {
		_classCallCheck(this, Router);

		var _this = _possibleConstructorReturn(this, (Router.__proto__ || Object.getPrototypeOf(Router)).call(this, props));

		_initialiseProps.call(_this);

		_this.state = {
			current: [],
			next: [],
			end: []
		};
		_this.routes = [];
		_this.pages = {};

		_this.parseRoutes(props.children, props.path || '');
		return _this;
	}

	_createClass(Router, [{
		key: 'componentWillMount',
		value: function componentWillMount() {
			var _this2 = this;

			observer.subscribe('ROUTER_CHANGE', function (routes) {
				Object.keys(routes).forEach(function (step) {
					return routes[step].forEach(function (item) {
						if (!(item.uri in _this2.pages)) {
							_this2.parseRoute(item.uri);
						}
					});
				});
				_this2.setState(routes);
			});
			this.history = new _History2.default(observer);
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			this.animated();
		}
	}, {
		key: 'componentDidUpdate',
		value: function componentDidUpdate() {
			this.animated();
		}
	}, {
		key: 'render',
		value: function render() {
			var _this3 = this;

			return _react2.default.createElement(
				'div',
				{ className: 'router' },
				this.state.current.map(function (item) {
					var uri = item.uri,
					    className = item.className,
					    index = item.index;
					var _pages$uri = _this3.pages[uri],
					    Component = _pages$uri.Component,
					    path = _pages$uri.path,
					    query = _pages$uri.query,
					    match = _pages$uri.match,
					    args = _pages$uri.args,
					    props = _pages$uri.props;

					var context = { index: index, uri: uri, path: path, query: query, match: match, args: args, props: props, observer: observer, navigateTo: _this3.history.navigateTo, backTo: _this3.history.backTo, replaceWith: _this3.history.replaceWith };
					return _react2.default.createElement(
						'div',
						{
							className: 'route ' + className,
							'data-uri': uri,
							key: uri
						},
						_react2.default.createElement(Component, { context: context, active: className === 'current' })
					);
				})
			);
		}
	}]);

	return Router;
}(_react2.default.Component);

Router.propTypes = {
	path: _propTypes2.default.string,
	children: _propTypes2.default.arrayOf(_Route2.default, Router, _propTypes2.default.func).isRequired,
	cache: _propTypes2.default.bool,
	notFound: _propTypes2.default.func,
	duration: _propTypes2.default.number,
	useHistoryState: _propTypes2.default.bool
};
Router.defaultProps = {
	path: '',
	cache: false,
	notFound: _NotFound2.default,
	duration: 400,
	useHistoryState: true
};

var _initialiseProps = function _initialiseProps() {
	var _this4 = this;

	this.animated = function () {
		var _state = _this4.state,
		    next = _state.next,
		    end = _state.end;

		if (next.length > 0) {
			var timeout = next.length > 1 ? 16 : _this4.props.duration;
			setTimeout(function () {
				_this4.setState({ current: next, next: end, end: [] });
			}, timeout);
		}
	};

	this.parseRoute = function (requestURI) {
		var _parseURI = _this4.parseURI(requestURI),
		    uri = _parseURI.uri,
		    pathname = _parseURI.pathname,
		    query = _parseURI.query,
		    args = _parseURI.args;

		var found = false;
		_this4.routes.forEach(function (route) {
			if (found) {
				return;
			}
			var Component = route.Component,
			    path = route.path,
			    rule = route.rule,
			    variables = route.variables,
			    props = route.props;

			var matches = pathname.match(rule);
			if (path === pathname || matches) {
				var match = {};
				if (matches) {
					for (var i = 1; i < matches.length; i += 1) {
						match[variables[i - 1]] = _this4.parseValue(matches[i]);
					}
				}
				var page = {
					Component: Component,
					uri: uri,
					path: pathname,
					query: query,
					match: match,
					args: args,
					props: props
				};
				_this4.pages[uri] = page;
				found = true;
			}
		});
		if (!found) {
			var page = {
				Component: _this4.props.notFound,
				uri: uri,
				path: pathname,
				query: query,
				match: {},
				args: args
			};
			_this4.pages[uri] = page;
		}
	};

	this.parseURI = function (uri) {
		var q = uri.indexOf('?');
		var pathname = q === -1 ? uri : uri.slice(0, q);
		var query = q === -1 ? null : uri.slice(q + 1);
		var args = null;
		if (q !== -1) {
			args = {};
			if (query.length > 0) {
				query.split('&').forEach(function (item) {
					var p = item.indexOf('=');
					if (p === -1) {
						args[item] = null;
					} else {
						args[item.slice(0, p)] = _this4.parseValue(unescape(item.slice(p + 1)));
					}
				});
			}
		}
		return { uri: uri, pathname: pathname, query: query, args: args };
	};

	this.parseValue = function (value) {
		if (/^([0-9]|[1-9][0-9]+)$/.test(value)) {
			if (value.length > 11) {
				return value;
			}
			return parseInt(value, 10);
		} else if (/^\d*\.\d+$/.test(value)) {
			return parseFloat(value);
		} else if (value === 'true') {
			return true;
		} else if (value === 'false') {
			return false;
		} else if (value === 'null' || value === '') {
			return null;
		} else if (value === 'undefined') {
			return undefined;
		}
		return value;
	};

	this.parseRoutes = function (routes) {
		var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

		routes.forEach(function (r) {
			if (r.type === _Route2.default) {
				var _r$props = r.props,
				    component = _r$props.component,
				    path = _r$props.path;

				var variables = [];
				var rule = ('' + prefix + path).replace(/\\/g, '\\/').replace(/:[a-zA-Z][a-zA-Z0-9]*/g, function (m) {
					variables.push(m.slice(1));
					return '([a-zA-Z0-9]+)';
				});
				_this4.routes.push({
					Component: component,
					path: '' + prefix + path,
					rule: new RegExp('^' + rule + '$'),
					variables: variables,
					props: r.props
				});
			} else if (r.type === _Redirect2.default) {
				var _path = r.props.path;

				var _variables = [];
				var _rule = ('' + prefix + _path).replace(/\\/g, '\\/').replace(/:[a-zA-Z][a-zA-Z0-9]*/g, function (m) {
					_variables.push(m.slice(1));
					return '([a-zA-Z0-9]+)';
				});
				_this4.routes.push({
					Component: r.type,
					path: '' + prefix + _path,
					rule: new RegExp('^' + _rule + '$'),
					variables: _variables,
					props: r.props
				});
			} else if (r.type === Router) {
				_this4.parseRoutes(r.props.children, '' + prefix + (r.props.path || ''));
			} else if (typeof r.type === 'function') {
				var result = r.type();
				if (result && result.type === Router) {
					_this4.parseRoutes(result.props.children, '' + prefix + (result.props.path || ''));
				}
			}
		});
	};
};

exports.default = Router;