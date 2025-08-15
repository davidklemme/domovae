export default {
	// TypeScript and JavaScript files
	'**/*.{ts,js}': ['eslint --fix', 'prettier --write'],

	// Svelte files
	'**/*.svelte': ['eslint --fix', 'prettier --write'],

	// JSON, Markdown, and other files
	'**/*.{json,md,yml,yaml}': ['prettier --write'],

	// CSS files
	'**/*.{css,scss}': ['prettier --write']
};
