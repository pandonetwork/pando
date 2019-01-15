module.exports = {
	env: {
		es6: true,
		node: true,
	},
	extends: ['standard', 'prettier'],
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
	},
	rules: {
		'linebreak-style': ['error', 'unix'],
	}
}
