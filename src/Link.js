import React from 'react'
import PropTypes from 'prop-types'

import navigateTo from './URL'

export default class Link extends React.Component {
	static propTypes = {
		title: PropTypes.string,
		to: PropTypes.string,
		className: PropTypes.string,
		style: PropTypes.shape(),
		children: PropTypes.node,
		onClick: PropTypes.func,
	}

	static defaultProps = {
		title: '',
		to: '',
		className: '',
		style: {},
		children: PropTypes.node,
		onClick: () => {},
	}

	click = () => {
		this.link.click()
	}

	// buildURL = to => {
	// 	if (to.indexOf('/') === 0) {
	// 		return to
	// 	}
	// 	else {
	// 		const hash = location.hash ? location.hash.slice(1) : ''
	// 		const p = hash.split('/')
	// 		p.pop()
	// 		to.split('/').forEach(d => {
	// 			if (d === '..') {
	// 				p.pop()
	// 			}
	// 			else if (d !== '.') {
	// 				p.push(d)
	// 			}
	// 		})
	// 		return p.join('/').replace(/\/{2,}/g, '/')
	// 	}
	// }

	// jumpTo = to => {
	// 	if (to) {
	// 		if (/^(tel|sms|mailto):/i.test(to) || /^([a-z]+:)?\/\//i.test(to)) {
	// 			window.open(to, '_self')
	// 		}
	// 		else {
	// 			location.hash = this.buildURL(to)
	// 		}
	// 	}
	// }

	handleClick = async ev => {
		ev.persist()
		await this.props.onClick(ev)
		if (!ev.isDefaultPrevented()) {
			navigateTo(this.props.to)
		}
	}

	render() {
		const { title, className, style, children } = this.props

		return <a
			className={className}
			style={style}
			title={title}
			onClick={this.handleClick}
			ref={ref => { this.link = ref }}
		>
			{children}
		</a>
	}
}
