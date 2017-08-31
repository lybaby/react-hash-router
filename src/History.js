export default class History {
	constructor(observer) {
		this.observer = observer
		this.history = []
		this.current = -1
		this.times = 0

		window.addEventListener('hashchange', this.hashChange, false)

		// history
		this.restoreHistory()

		// current
		if (Object.prototype.toString.apply(history.state) !== '[object Object]' || !('PAGE' in history.state)) {
			history.replaceState({ PAGE: history.length - 1 }, '')
			const newURI = this.getHashURI(window.location.href)
			const index = this.current
			while (this.current + 1 < this.history.length) {
				this.history.pop()
			}
			this.history.push(newURI)
			this.current = this.history.length - 1
			this.cacheHistory()
		}

		this.emitRouteChange({
			current: [{ uri: this.history[this.current], className: 'current', index: history.state.PAGE + 1 }],
			next: [],
			end: [],
		})
	}

	hashChange = ev => {
		let pushState = false
		if (Object.prototype.toString.apply(history.state) !== '[object Object]' || !('PAGE' in history.state)) {
			history.replaceState({ PAGE: history.length - 1 }, '')
			pushState = true
		}
		const page = history.state.PAGE
		const oldURI = this.getHashURI(ev.oldURL)
		const newURI = this.getHashURI(ev.newURL)

		if (pushState) {
			const index = this.current
			while (this.current + 1 < this.history.length) {
				this.history.pop()
			}
			this.history.push(newURI)
			this.current = this.history.length - 1
			this.emitRouteChange({
				current: [{ uri: oldURI, className: 'current', index }, { uri: newURI, className: 'next', index: index + 1 }],
				next: [{ uri: oldURI, className: 'prev', index }, { uri: newURI, className: 'current', index: index + 1 }],
				end: [{ uri: newURI, className: 'current', index: index + 1 }],
			})
		}
		// page, current => forward
		else if (this.current > page) {
			const index = this.current
			this.current = page
			this.emitRouteChange({
				current: [{ uri: newURI, className: 'prev', index: index - 1 }, { uri: oldURI, className: 'current', index }],
				next: [{ uri: newURI, className: 'current', index: index - 1 }, { uri: oldURI, className: 'next', index }],
				end: [{ uri: newURI, className: 'current', index }],
			})
		}
		// current, page => backward
		else if (this.current < page) {
			const index = this.current
			this.current = page
			this.emitRouteChange({
				current: [{ uri: oldURI, className: 'current', index }, { uri: newURI, className: 'next', index: index + 1 }],
				next: [{ uri: oldURI, className: 'prev', index }, { uri: newURI, className: 'current', index: index + 1 }],
				end: [{ uri: newURI, className: 'current', index: index + 1 }],
			})
		}
		// refresh
		else {
			//
		}
		this.cacheHistory()
	}

	emitRouteChange = routes => {
		this.times += 1
		this.observer.publish('ROUTER_CHANGE', routes)
	}

	getHashURI = url => {
		const p = url.indexOf('#')
		return p === -1 ? '' : url.slice(p + 1)
	}

	buildURI = to => {
		if (to.indexOf('/') === 0) {
			return to
		}
		else {
			const hash = location.hash ? location.hash.slice(1).split('?', 1)[0] : ''
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
			if (/^(mailto):/i.test(to) || /^([a-z]+:)?\/\//i.test(to)) {
				window.open(to, '_self')
			}
			else {
				location.hash = this.buildURI(to)
			}
		}
	}

	backTo = (to, fromStart = false) => {
		const uri = this.buildURI(to)
		if (fromStart) {
			for (let i = 0; i < this.current; i += 1) {
				if (this.history[i] === uri) {
					history.go(i - this.current)
					break
				}
			}
		}
		else {
			for (let i = this.current - 1; i >= 0; i -= 1) {
				if (this.history[i] === uri) {
					history.go(i - this.current)
					break
				}
			}
		}
	}

	replaceWith = to => {
		const uri = this.buildURI(to)

		this.history[this.current] = uri
		this.emitRouteChange({
			current: [{ uri, className: 'current', index: this.current }],
			next: [],
			end: [],
		})
		window.history.replaceState(window.history.state, "", `#${uri}`)
		this.cacheHistory()
	}

	restoreHistory = () => {
		const cache = JSON.parse(sessionStorage.getItem('history') || 'null')
		if (cache && Array.isArray(cache.history) && (typeof cache.current === 'number') && cache.history.length > 0 && cache.history.length > cache.current) {
			this.history = cache.history
			this.current = cache.current
		}
	}

	cacheHistory = () => {
		const cache = JSON.stringify({ current: this.current, history: this.history })
		sessionStorage.setItem('history', cache)
	}
}
