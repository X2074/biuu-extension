module.exports = {
  root: true,
  globals: {
    chrome: true,
    defineProps: "readonly",
    defineEmits: "readonly",
    defineExpose: "readonly",
    withDefaults: "readonly",
  },
  env: {
    node: true,
    "vue/setup-compiler-macros": true
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    "handle-callback-err":"off",
    "prefer-const": "off",
    "eqeqeq":["off"],
    "generator-star-spacing": "off",
    "object-curly-spacing": "off",
    "no-var": "error",
    "semi": "off",
    "eol-last": "off",
    "no-tabs": "off",
    "indent": "off",
    "quote": "off",
    "comma-dangle":"off",
    "no-mixed-spaces-and-tabs": "off",
    "no-trailing-spaces": "off",
    "arrow-parens": 0,
    "spaced-comment": "off",
    "space-before-function-paren": "off",
    "no-empty": "off",
    "no-else-return": "off",
    "no-unused-vars": "off",
    "no-console": "off",
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    "vue/multi-word-component-names":"off",
    "no-var": 0
  }
}
