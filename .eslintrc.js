module.exports = {
	env: {
		browser: false,
		node: true,
	},
	settings: {
		'import/resolver': {
			'node': {
				'extensions': ['.js', '.ts']
			},
			'typescript': {
				'alwaysTryTypes': true
			},
		}
	},
}