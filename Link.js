import React from 'react';
import PropTypes from 'prop-types';

export default class Link extends React.Component {

	render() {
		const { title, to, className, style, children, onClick } = this.props;
		let link = null;
		if (to) {
			if (/^(tel|sms|mailto):/i.test(to) || /^([a-z]+:)?\/\//i.test(to)) {
				link = to;
			} else {
				link = `#${to}`;
			}
		}
		return React.createElement(
			'a',
			{
				title: title,
				href: link,
				className: className,
				style: style,
				onClick: onClick
			},
			children
		);
	}
}
Link.propTypes = {
	title: PropTypes.string,
	to: PropTypes.string,
	className: PropTypes.string,
	style: PropTypes.shape(),
	children: PropTypes.node,
	onClick: PropTypes.func
};
Link.defaultProps = {
	title: '',
	to: '',
	className: '',
	style: {},
	children: PropTypes.node,
	onClick: () => {}
};