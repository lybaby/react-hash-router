import React from 'react'
import PropTypes from 'prop-types'

import { history } from './h'

export default class Link extends React.Component {
	static propTypes = {
		id: PropTypes.string,
		title: PropTypes.string,
		to: PropTypes.string,
		className: PropTypes.string,
		style: PropTypes.shape(),
		children: PropTypes.node,
		onClick: PropTypes.func,
	}

	static defaultProps = {
		id: null,
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
		const goon = await this.props.onClick(ev)
		if (goon !== false && !ev.isDefaultPrevented()) {
			history.navigateTo(this.props.to)
		}
	}

	render() {
		const { title, id, className, style, children } = this.props

		return <a
			id={id}
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
