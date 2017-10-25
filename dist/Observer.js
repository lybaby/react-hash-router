function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Observer = function Observer() {
	var _this = this;

	_classCallCheck(this, Observer);

	this.channels = {};

	this.subscribe = function (channel, callback) {
		if (typeof callback === 'function') {
			if (!(channel in _this.channels)) {
				_this.channels[channel] = [];
			}
			_this.channels[channel].push(callback);
		}
	};

	this.unsubscribe = function (channel, callback) {
		if (typeof callback === 'function' && channel in _this.channels) {
			var callbacks = _this.channels[channel];
			for (var i = 0; i < callbacks.length; i += 1) {
				var cb = callbacks[i];
				if (cb === callback) {
					_this.channels[channel] = callbacks.slice(0, i).concat(callbacks.slice(i + 1, callbacks.length));
					break;
				}
			}
		}
	};

	this.publish = function (channel, data) {
		if (channel in _this.channels) {
			_this.channels[channel].forEach(function (callback) {
				setTimeout(function () {
					callback(data);
				}, 0);
			});
		}
	};
};

export default Observer;