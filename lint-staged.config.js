export default {
  '**/*.{js,ts,}': ['eslint --fix', 'prettier --write'],
  '**/*.{json,md,yml}': ['prettier --write'],
};
