
function buildURL(to) {
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

function navigateTo(to) {
	if (to) {
		if (/^(tel|sms|mailto):/i.test(to) || /^([a-z]+:)?\/\//i.test(to)) {
			window.open(to, '_self')
		}
		else {
			location.hash = buildURL(to)
		}
	}
}

export default navigateTo
export { navigateTo, buildURL }
