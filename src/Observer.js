export default class Observer {
	channels = {}

	subscribe = (channel, callback) => {
		if (typeof callback === 'function') {
			if (!(channel in this.channels)) {
				this.channels[channel] = []
			}
			this.channels[channel].push(callback)
		}
	}

	unsubscribe = (channel, callback) => {
		if (typeof callback === 'function' && (channel in this.channels)) {
			const callbacks = this.channels[channel]
			for (let i = 0; i < callbacks.length; i += 1) {
				const cb = callbacks[i]
				if (cb === callback) {
					this.channels[channel] = callbacks.slice(0, i).concat(callbacks.slice(i + 1, callbacks.length))
					break
				}
			}
		}
	}

	publish = (channel, data) => {
		if (channel in this.channels) {
			this.channels[channel].forEach(callback => {
				setTimeout(() => {
					callback(data)
				}, 0)
			})
		}
	}
}
