import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import vuePlugin from 'eslint-plugin-vue';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.vue'],
    plugins: {
      vue: vuePlugin
    },
    languageOptions: {
      parser: vuePlugin.parser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 2020,
        sourceType: 'module'
      }
    },
    rules: {
      'vue/multi-word-component-names': 'warn',
      'vue/no-unused-components': 'warn',
      'vue/no-unused-vars': 'warn'
    }
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module'
    }
  }
];