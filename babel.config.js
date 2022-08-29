module.exports = {
	plugins: [
		[
			'ramda',
			{
				useES: true,
			},
		],
	],
	env: {
		test: {
			/* Cannot use ESM within node environment */
			plugins: ['ramda'],
		},
	},
}