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
