import React from 'react'
import PropTypes from 'prop-types'

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

	buildURL = to => {
		if (to.indexOf('/') === 0) {
			return to
		}
		else {
			const hash = location.hash || ''
			const p = hash.split('/')
			p.pop()
			to.split('/').forEach(d => {
				if (d === '..') {
					p.pop()
				}
				else if (d !== '.' && d !== '') {
					p.push(d)
				}
			})
			return p.join('/')
		}
	}

	handleClick = async ev => {
		await this.props.onClick(ev)
		const to = this.props.to
		if (!ev.defaultPrevented) {
			if (to) {
				if (/^(tel|sms|mailto):/i.test(to) || /^([a-z]+:)?\/\//i.test(to)) {
					window.open(to, '_self')
				}
				else {
					location.hash = this.buildURL(to)
				}
			}
		}
	}

	render() {
		const { title, className, style, children } = this.props

		return <a
			className={className}
			style={style}
			title={title}
			onClick={this.handleClick}
		>
			{children}
		</a>
	}
}
