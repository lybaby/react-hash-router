'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

var _h = require('./h');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Router = function (_React$Component) {
	_inherits(Router, _React$Component);

	function Router(props) {
		_classCallCheck(this, Router);

		var _this = _possibleConstructorReturn(this, (Router.__proto__ || Object.getPrototypeOf(Router)).call(this, props));

		_initialiseProps.call(_this);

		_this.state = {
			current: [],
			next: [],
			end: [],
			transition: 0
		};
		_this.routes = [];
		_this.pages = {};
		_this.playback = [];
		_this.emiting = false;

		_this.parseRoutes(props.children, props.path || '');
		return _this;
	}

	_createClass(Router, [{
		key: 'componentWillMount',
		value: function componentWillMount() {
			var _this2 = this;

			_h.observer.subscribe('ROUTER_CHANGE', function (routes) {
				Object.keys(routes).forEach(function (step) {
					if (step !== 'direct') {
						routes[step].forEach(function (item) {
							if (!(item.uri in _this2.pages)) {
								_this2.parseRoute(item.uri);
							}
						});
					}
				});
				_this2.playback.push(routes);
				if (!_this2.emiting) {
					_this2.emit();
				}
			});

			_h.history.init();
		}
	}, {
		key: 'render',
		value: function render() {
			var _this3 = this;

			var styles = {
				position: 'absolute',
				overflowX: 'hidden',
				width: '100%',
				height: '100%'
			};

			return _react2.default.createElement(
				'div',
				{ style: styles },
				this.state.current.map(function (item) {
					var uri = item.uri,
					    className = item.className,
					    index = item.index;

					var pos = { 'prev': '0', 'current': '0', 'next': '100' }[className];
					var style = {
						position: 'absolute',
						zIndex: index + 1,
						width: '100%',
						height: '100%',
						transition: 'transform ease ' + _this3.state.transition + 'ms',
						transform: 'translate(' + pos + '%, 0) translateZ(0)'
					};
					var _pages$uri = _this3.pages[uri],
					    Type = _pages$uri.Type,
					    component = _pages$uri.component,
					    context = _pages$uri.context,
					    props = _pages$uri.props,
					    mount = _pages$uri.mount,
					    unmount = _pages$uri.unmount,
					    cache = _pages$uri.cache;

					return _react2.default.createElement(Type, {
						context: _extends({ index: index }, context, { props: props }),
						style: style,
						component: component,
						key: uri
					});
				})
			);
		}
	}]);

	return Router;
}(_react2.default.Component);

Router.propTypes = {
	path: _propTypes2.default.string,
	children: _propTypes2.default.arrayOf(_Route2.default, Router, _Redirect2.default, _propTypes2.default.func).isRequired,
	cache: _propTypes2.default.bool,
	notFound: _propTypes2.default.func,
	duration: _propTypes2.default.number,
	delay: _propTypes2.default.number
};
Router.defaultProps = {
	path: '',
	cache: false,
	notFound: _NotFound2.default,
	duration: 400,
	delay: 16
};

var _initialiseProps = function _initialiseProps() {
	var _this4 = this;

	this.emit = function () {
		_this4.emiting = true;
		if (_this4.playback.length === 0) {
			_this4.emiting = false;
			return;
		}

		var _playback$ = _this4.playback[0],
		    current = _playback$.current,
		    next = _playback$.next,
		    end = _playback$.end,
		    direct = _playback$.direct;

		_this4.playback = _this4.playback.slice(1);
		var _props = _this4.props,
		    duration = _props.duration,
		    delay = _props.delay;

		if (direct === true || duration <= 0) {
			_this4.setState({ current: end, transition: 0 }, function () {
				return _this4.emit();
			});
		} else {
			_this4.setState({ current: current, transition: 0 });
			setTimeout(function () {
				_this4.setState({ current: next, transition: duration });
				setTimeout(function () {
					_this4.setState({ current: end, transition: delay }, function () {
						setTimeout(function () {
							return _this4.emit();
						}, delay);
					});
				}, duration);
			}, delay);
		}
	};

	this.parseRoutes = function (routes) {
		var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

		routes.forEach(function (r) {
			var p = ('' + prefix + (r.props.path || '')).replace(/\/{2,}/g, '/');
			if (r.type === _Route2.default) {
				var component = r.props.component;

				var variables = [];
				var rule = p.replace(/\//g, '\\/').replace(/:[a-zA-Z][a-zA-Z0-9]*/g, function (m) {
					variables.push(m.slice(1));
					return '([a-zA-Z0-9\-_]+)';
				});
				_this4.routes.push({
					Type: _Route.Container,
					component: component,
					rule: new RegExp('^' + rule + '$'),
					variables: variables,
					props: {
						path: p
					}
				});
			} else if (r.type === _Redirect2.default) {
				var _r$props = r.props,
				    to = _r$props.to,
				    replace = _r$props.replace;

				var _variables = [];
				var _rule = p.replace(/\//g, '\\/').replace(/:[a-zA-Z][a-zA-Z0-9]*/g, function (m) {
					_variables.push(m.slice(1));
					return '([a-zA-Z0-9\-_]+)';
				});
				_this4.routes.push({
					Type: r.type,
					component: null,
					rule: new RegExp('^' + _rule + '$'),
					variables: _variables,
					props: {
						path: p,
						to: to,
						replace: replace
					}
				});
			} else if (r.type === Router) {
				_this4.parseRoutes(r.props.children, '' + prefix + (r.props.path || ''));
			} else if (typeof r.type === 'function') {
				var _result = r.type();
				if (_result && _result.type === Router) {
					_this4.parseRoutes(_result.props.children, '' + prefix + (_result.props.path || ''));
				}
			}
		});
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
			var Type = route.Type,
			    component = route.component,
			    path = route.path,
			    rule = route.rule,
			    variables = route.variables,
			    props = route.props,
			    mount = route.mount,
			    unmount = route.unmount,
			    cache = route.cache;

			var matches = pathname.match(rule);
			if (path === pathname || matches) {
				var match = {};
				if (matches) {
					for (var i = 1; i < matches.length; i += 1) {
						match[variables[i - 1]] = _this4.parseValue(matches[i]);
					}
				}
				var page = {
					Type: Type,
					component: component,
					props: props,
					context: {
						uri: uri,
						pathname: pathname,
						query: query,
						match: match,
						args: args
					},
					mount: mount,
					unmount: unmount,
					cache: cache
				};
				_this4.pages[uri] = page;
				found = true;
			}
		});
		if (!found) {
			var page = {
				Type: _Route.Container,
				component: _this4.props.notFound,
				props: {},
				context: {
					uri: uri,
					pathname: pathname,
					query: query,
					match: {},
					args: args
				},
				mount: function mount() {},
				unmount: function unmount() {},
				cache: false
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
};

exports.default = Router;