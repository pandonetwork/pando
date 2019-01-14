module.exports = {
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	extends: ['standard', 'prettier', 'prettier/react'],
	// parser: 'babel-eslint',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 2018,
		sourceType: 'module',
	},
	rules: {
		'linebreak-style': ['error', 'unix'],
		// quotes: ['error', 'single'],
		// semi: ['error', 'never'],
	},
}
