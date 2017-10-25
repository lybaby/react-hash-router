var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var History = function History(observer) {
	var _this = this;

	_classCallCheck(this, History);

	this.init = function () {
		window.addEventListener('hashchange', _this.hashChange, false);

		_this.emitRouteChange({
			current: [{ uri: _this.history[_this.current], className: 'current', index: _this.current }],
			next: [],
			end: [{ uri: _this.history[_this.current], className: 'current', index: _this.current }]
		});
	};

	this.push = function (currentURI, newURI, page) {
		var index = _this.current;
		_this.history[page] = newURI;
		_this.current = page;
		Object.keys(_this.history).forEach(function (p) {
			if (p > _this.current) {
				delete _this.history[p];
			}
		});
		_this.emitRouteChange({
			current: [{ uri: currentURI, className: 'current', index: index }, { uri: newURI, className: 'next', index: page }],
			next: [{ uri: currentURI, className: 'prev', index: index }, { uri: newURI, className: 'current', index: page }],
			end: [{ uri: newURI, className: 'current', index: page }]
		});
		_this.cacheHistory();
	};

	this.backward = function (previousURI, currentURI, page) {
		var index = _this.current;
		_this.current = page;
		_this.emitRouteChange({
			current: [{ uri: previousURI, className: 'prev', index: page }, { uri: currentURI, className: 'current', index: index }],
			next: [{ uri: previousURI, className: 'current', index: page }, { uri: currentURI, className: 'next', index: index }],
			end: [{ uri: previousURI, className: 'current', index: page }]
		});
		_this.cacheHistory();
	};

	this.forward = function (currentURI, nextURI, page) {
		var index = _this.current;
		_this.current = page;
		_this.emitRouteChange({
			current: [{ uri: currentURI, className: 'current', index: index }, { uri: nextURI, className: 'next', index: page }],
			next: [{ uri: currentURI, className: 'prev', index: index }, { uri: nextURI, className: 'current', index: page }],
			end: [{ uri: nextURI, className: 'current', index: page }]
		});
		_this.cacheHistory();
	};

	this.replace = function (currentURI, newURI, page) {
		_this.emitRouteChange({
			current: [{ uri: newURI, className: 'current', index: _this.current }],
			next: [],
			end: [{ uri: newURI, className: 'current', index: _this.current }]
		});
		_this.cacheHistory();
	};

	this.loads = function (path) {
		path.split(',').forEach(function (p) {
			var _p$split = p.split(':'),
			    _p$split2 = _slicedToArray(_p$split, 2),
			    action = _p$split2[0],
			    uri = _p$split2[1];

			if (action === 'go') {
				_this.playback.unshift(function () {
					return _this.navigateTo(uri);
				});
			} else if (action === 'back') {
				_this.playback.unshift(function () {
					return _this.backTo(uri);
				});
			} else if (action === 'begin') {
				_this.playback.unshift(function () {
					return _this.backTo(uri, true);
				});
			} else if (action === 'replace') {
				_this.playback.unshift(function () {
					return _this.replaceWith(uri);
				});
			}
		});
		if (_this.playback.length > 0) {
			_this.beginPath();
			_this.playback.pop()();
		}
	};

	this.hashChange = function (ev) {
		var pushState = false;
		if (Object.prototype.toString.apply(history.state) !== '[object Object]' || !('PAGE' in history.state)) {
			history.replaceState({ PAGE: history.length - 1 }, '');
			pushState = true;
		}
		var page = history.state.PAGE;
		var currentURI = _this.getHashURI(ev.oldURL);
		var newURI = _this.getHashURI(ev.newURL);

		// push
		if (pushState) {
			_this.push(currentURI, newURI, page);
		}
		// page, current => forward
		else if (_this.current > page) {
				_this.backward(newURI, currentURI, page);
			}
			// current, page => backward
			else if (_this.current < page) {
					_this.forward(currentURI, newURI, page);
				}
				// refresh
				else {
						//
					}

		if (_this.recoding) {
			if (_this.playback.length > 0) {
				_this.playback.pop()();
			} else {
				_this.endPath();
			}
		}
	};

	this.emitRouteChange = function (routes) {
		_this.times += 1;
		if (_this.recoding) {
			_this.path.push(routes.end[0]);
		} else {
			_this.observer.publish('ROUTER_CHANGE', routes);
		}
	};

	this.getHashURI = function (url) {
		var p = url.indexOf('#');
		return p === -1 ? '' : url.slice(p + 1);
	};

	this.buildURI = function (to) {
		if (/^[a-z]+:\/\//i.test(to)) {
			return to;
		}
		if (/^\/\//i.test(to)) {
			return window.location.protocol + to;
		} else if (to.indexOf('/') === 0) {
			return to;
		} else {
			// const hash = window.location.hash ? window.location.hash.slice(1).split('?', 1)[0] : ''
			var hash = _this.history[_this.current];
			var p = hash.split('/');
			p.pop();

			var _to$split = to.split('?'),
			    _to$split2 = _toArray(_to$split),
			    path = _to$split2[0],
			    args = _to$split2.slice(1);

			path.split('/').forEach(function (d) {
				if (d === '..') {
					p.pop();
				} else if (d !== '.') {
					p.push(d);
				}
			});
			return p.join('/').replace(/\/{2,}/g, '/') + (args.length > 0 ? '?' + args.join('?') : '');
		}
	};

	this.navigateTo = function (to) {
		if (to) {
			if (/^(mailto|tel):/i.test(to) || /^([a-z]+:)?\/\//i.test(to)) {
				window.open(to, '_self');
			} else {
				// const oldURI = this.history[this.current]
				// const newURI = this.buildURI(to)
				// window.history.pushState({ PAGE: this.current + 1 }, "", `#${newURI}`)
				// this.push(oldURI, newURI, true)
				window.location.hash = _this.buildURI(to);
				// window.history.pushState({PAGE: this.current + 1}, "", `#${this.buildURI(to)}`)
				// history.hashChange({ oldURL: window.location.href, newURL: window.location.href })
			}
		}
	};

	this.backTo = function (to) {
		var fromStart = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

		var uri = _this.buildURI(to);
		if (fromStart) {
			for (var i = 0; i < _this.current; i += 1) {
				if (_this.history[i] === uri) {
					window.history.go(i - _this.current);
					return true;
				}
			}
		} else {
			for (var _i = _this.current - 1; _i >= 0; _i -= 1) {
				if (_this.history[_i] === uri) {
					window.history.go(_i - _this.current);
					return true;
				}
			}
		}
		return false;
	};

	this.replaceWith = function (to) {
		var uri = _this.buildURI(to);

		_this.history[_this.current] = uri;
		_this.emitRouteChange({
			current: [{ uri: uri, className: 'current', index: _this.current }],
			next: [],
			end: [{ uri: uri, className: 'current', index: _this.current }],
			direct: true
		});
		// 安全问题
		if (/^[a-z]+:\/\//i.test(uri)) {
			window.open(uri, '_self');
		} else {
			window.history.replaceState(window.history.state, '', '#' + uri);
		}
		_this.cacheHistory();
	};

	this.savePath = function () {
		return { current: _this.current, history: _this.history };
	};

	this.beginPath = function () {
		_this.recoding = true;
		_this.path = [{ uri: _this.history[_this.current], index: _this.current }];
	};

	this.endPath = function () {
		_this.recoding = false;
		var current = _this.path[0];
		var end = _this.path.slice(-1)[0];
		if (current.index < end.index) {
			_this.emitRouteChange({
				current: [{ uri: current.uri, className: 'current', index: current.index }, { uri: end.uri, className: 'next', index: end.index }],
				next: [{ uri: current.uri, className: 'prev', index: current.index }, { uri: end.uri, className: 'current', index: end.index }],
				end: [{ uri: end.uri, className: 'current', index: end.index }]
			});
		} else {
			_this.emitRouteChange({
				current: [{ uri: end.uri, className: 'prev', index: end.index }, { uri: current.uri, className: 'current', index: current.index }],
				next: [{ uri: end.uri, className: 'current', index: end.index }, { uri: current.uri, className: 'next', index: current.index }],
				end: [{ uri: end.uri, className: 'current', index: end.index }]
			});
		}
	};

	this.restoreHistory = function () {
		var cache = JSON.parse(sessionStorage.getItem('history') || 'null');
		if (cache && 'current' in cache && 'history' in cache) {
			_this.history = cache.history;
			_this.current = cache.current;
		}
	};

	this.cacheHistory = function () {
		var cache = JSON.stringify({ current: _this.current, history: _this.history });
		sessionStorage.setItem('history', cache);
	};

	this.observer = observer;
	this.history = { 0: '' };
	this.current = 0;
	this.times = 0;
	this.path = [];
	this.recoding = false;
	this.playback = [];

	// history
	this.restoreHistory();

	// current
	if (history.state === null || !('PAGE' in history.state)) {
		this.current = history.length - 1;
		history.replaceState({ PAGE: this.current }, '');
		this.history[this.current] = this.getHashURI(window.location.href);
		Object.keys(this.history).forEach(function (page) {
			if (page > _this.current) {
				delete _this.history[page];
			}
		});
		this.cacheHistory();
	}
};

export default History;