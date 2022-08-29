const tsconfig = require('./tsconfig.json')
const moduleNameMapper = require('tsconfig-paths-jest')(tsconfig)

module.exports = {
	roots: [
		"tests",
	],
	moduleFileExtensions: [
		'ts',
		'tsx',
		'js',
		'jsx',
		'json',
	],
	moduleNameMapper: moduleNameMapper,
	clearMocks: true,
	testMatch: ['**/*.spec.ts'],
	transform: {
		"\\.ts$": "ts-jest",
		"\\.js$": "babel-jest",
	},
	verbose: true,
	globals: {
		"ts-jest": {
			tsconfig: 'tsconfig.json',
		},
	},
}