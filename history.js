"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// history

var History = function History() {
	_classCallCheck(this, History);

	this.state = {
		current: -1,
		history: []
	};
};

exports.default = new History();