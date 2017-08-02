
function buildURL(to) {
	if (to.indexOf('/') === 0) {
		return to
	}
	else {
		const hash = location.hash ? location.hash.slice(1) : ''
		const p = hash.split('/')
		p.pop()
		to.split('/').forEach(d => {
			if (d === '..') {
				p.pop()
			}
			else if (d !== '.') {
				p.push(d)
			}
		})
		return p.join('/').replace(/\/{2,}/g, '/')
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
