import React from 'react';

export default (function (props) {
	return React.createElement(
		'div',
		null,
		React.createElement(
			'p',
			null,
			'Page Not Found'
		),
		React.createElement('hr', null),
		React.createElement(
			'p',
			null,
			props.uri
		)
	);
});