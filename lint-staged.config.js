module.exports = {
  '*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    () => 'vitest related --run --reporter=verbose'
  ],
  '*.{js,css,md,json}': ['prettier --write'],
  '*.{ts,tsx,js,jsx}': ['prettier --write']
}