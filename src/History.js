export default class History {
	constructor(observer) {
		this.observer = observer
		this.history = { 0: '' }
		this.current = 0
		this.times = 0
		this.path = []
		this.recoding = false
		this.playback = []

		// history
		this.restoreHistory()

		// current
		if (history.state === null || !('PAGE' in history.state)) {
			this.current = history.length - 1
			history.replaceState({ PAGE: this.current }, '')
			this.history[this.current] = this.getHashURI(window.location.href)
			Object.keys(this.history).forEach(page => {
				if (page > this.current) {
					delete this.history[page]
				}
			})
			this.cacheHistory()
		}
	}

	init = () => {
		window.addEventListener('hashchange', this.hashChange, false)

		this.emitRouteChange({
			current: [{ uri: this.history[this.current], className: 'current', index: this.current }],
			next: [],
			end: [{ uri: this.history[this.current], className: 'current', index: this.current }],
		})
	}

	push = (currentURI, newURI, page) => {
		const index = this.current
		this.history[page] = newURI
		this.current = page
		Object.keys(this.history).forEach(p => {
			if (p > this.current) {
				delete this.history[p]
			}
		})
		this.emitRouteChange({
			current: [{ uri: currentURI, className: 'current', index }, { uri: newURI, className: 'next', index: page }],
			next: [{ uri: currentURI, className: 'prev', index }, { uri: newURI, className: 'current', index: page }],
			end: [{ uri: newURI, className: 'current', index: page }],
		})
		this.cacheHistory()
	}

	backward = (previousURI, currentURI, page) => {
		const index = this.current
		this.current = page
		this.emitRouteChange({
			current: [{ uri: previousURI, className: 'prev', index: page }, { uri: currentURI, className: 'current', index }],
			next: [{ uri: previousURI, className: 'current', index: page }, { uri: currentURI, className: 'next', index }],
			end: [{ uri: previousURI, className: 'current', index: page }],
		})
		this.cacheHistory()
	}

	forward = (currentURI, nextURI, page) => {
		const index = this.current
		this.current = page
		this.emitRouteChange({
			current: [{ uri: currentURI, className: 'current', index }, { uri: nextURI, className: 'next', index: page }],
			next: [{ uri: currentURI, className: 'prev', index }, { uri: nextURI, className: 'current', index: page }],
			end: [{ uri: nextURI, className: 'current', index: page }],
		})
		this.cacheHistory()
	}

	replace = (currentURI, newURI, page) => {
		this.emitRouteChange({
			current: [{ uri: newURI, className: 'current', index: this.current }],
			next: [],
			end: [{ uri: newURI, className: 'current', index: this.current }],
		})
		this.cacheHistory()
	}

	loads = path => {
		path.split(',').forEach(p => {
			const [action, uri] =p.split(':')
			if (action === 'go') {
				this.playback.unshift(() => this.navigateTo(uri))
			}
			else if (action === 'back') {
				this.playback.unshift(() => this.backTo(uri))
			}
			else if (action === 'begin') {
				this.playback.unshift(() => this.backTo(uri, true))
			}
			else if (action === 'replace') {
				this.playback.unshift(() => this.replaceWith(uri))
			}
		})
		if (this.playback.length > 0) {
			this.beginPath()
			this.playback.pop()()
		}
	}

	hashChange = ev => {
		let pushState = false
		if (Object.prototype.toString.apply(history.state) !== '[object Object]' || !('PAGE' in history.state)) {
			history.replaceState({ PAGE: history.length - 1 }, '')
			pushState = true
		}
		const page = history.state.PAGE
		const currentURI = this.getHashURI(ev.oldURL)
		const newURI = this.getHashURI(ev.newURL)

		// push
		if (pushState) {
			this.push(currentURI, newURI, page)
		}
		// page, current => forward
		else if (this.current > page) {
			this.backward(newURI, currentURI, page)
		}
		// current, page => backward
		else if (this.current < page) {
			this.forward(currentURI, newURI, page)
		}
		// refresh
		else {
			//
		}

		if (this.recoding) {
			if (this.playback.length > 0) {
				this.playback.pop()()
			}
			else {
				this.endPath()
			}
		}
	}

	emitRouteChange = routes => {
		this.times += 1
		if (this.recoding) {
			this.path.push(routes.end[0])
		}
		else {
			this.observer.publish('ROUTER_CHANGE', routes)
		}
	}

	getHashURI = url => {
		const p = url.indexOf('#')
		return p === -1 ? '' : url.slice(p + 1)
	}

	buildURI = to => {
		if (/^[a-z]+:\/\//i.test(to)) {
			return to
		}
		if (/^\/\//i.test(to)) {
			return window.location.protocol + to
		}
		else if (to.indexOf('/') === 0) {
			return to
		}
		else {
			// const hash = window.location.hash ? window.location.hash.slice(1).split('?', 1)[0] : ''
			const hash = this.history[this.current]
			const p = hash.split('/')
			p.pop()
			const [path, ...args] = to.split('?')
			path.split('/').forEach(d => {
				if (d === '..') {
					p.pop()
				}
				else if (d !== '.') {
					p.push(d)
				}
			})
			return p.join('/').replace(/\/{2,}/g, '/') + (args.length > 0 ? `?${args.join('?')}` : '')
		}
	}

	navigateTo = to => {
		if (to) {
			if (/^(mailto|tel):/i.test(to) || /^([a-z]+:)?\/\//i.test(to)) {
				window.open(to, '_self')
			}
			else {
				const oldURI = this.history[this.current]
				const newURI = this.buildURI(to)
				window.history.pushState({ PAGE: this.current + 1 }, "", `#${newURI}`)
				this.push(oldURI, newURI, this.current + 1)
				// window.location.hash = this.buildURI(to)
			}
		}
	}

	backTo = (to, fromStart = false) => {
		const uri = this.buildURI(to)
		if (fromStart) {
			for (let i = 0; i < this.current; i += 1) {
				if (this.history[i] === uri) {
					window.history.go(i - this.current)
					return true
				}
			}
		}
		else {
			for (let i = this.current - 1; i >= 0; i -= 1) {
				if (this.history[i] === uri) {
					window.history.go(i - this.current)
					return true
				}
			}
		}
		return false
	}

	replaceWith = to => {
		const uri = this.buildURI(to)

		this.history[this.current] = uri
		this.emitRouteChange({
			current: [{ uri, className: 'current', index: this.current }],
			next: [],
			end: [{ uri, className: 'current', index: this.current }],
			direct: true
		})
		// 安全问题
		if (/^[a-z]+:\/\//i.test(uri)) {
			window.open(uri, '_self')
		}
		else {
			window.history.replaceState(window.history.state, '', `#${uri}`)
		}
		this.cacheHistory()
	}

	savePath = () => {
		return { current: this.current, history: this.history }
	}

	beginPath = () => {
		this.recoding = true
		this.path = [{ uri: this.history[this.current], index: this.current }]
	}

	endPath = () => {
		this.recoding = false
		const current = this.path[0]
		const end = this.path.slice(-1)[0]
		if (current.index < end.index) {
			this.emitRouteChange({
				current: [{ uri: current.uri, className: 'current', index: current.index }, { uri: end.uri, className: 'next', index: end.index }],
				next: [{ uri: current.uri, className: 'prev', index: current.index }, { uri: end.uri, className: 'current', index: end.index }],
				end: [{ uri: end.uri, className: 'current', index: end.index }]
			})
		}
		else {
			this.emitRouteChange({
				current: [{ uri: end.uri, className: 'prev', index: end.index }, { uri: current.uri, className: 'current', index: current.index }],
				next: [{ uri: end.uri, className: 'current', index: end.index }, { uri: current.uri, className: 'next', index: current.index }],
				end: [{ uri: end.uri, className: 'current', index: end.index }]
			})
		}
	}

	restoreHistory = () => {
		const key = (location + '').split('#')[0]
		const cache = JSON.parse(sessionStorage.getItem(key) || 'null')
		if (cache && ('current' in cache) && ('history' in cache)) {
			this.history = cache.history
			this.current = cache.current
		}
	}

	cacheHistory = () => {
		const key = (location + '').split('#')[0]
		const cache = JSON.stringify({ current: this.current, history: this.history })
		sessionStorage.setItem(key, cache)
	}
}
