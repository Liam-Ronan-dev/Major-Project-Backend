export default {
  extends: ['@commitlint/config-conventional'],

  rules: {
    'header-max-length': [0, 'always', 200],
  },
};

/**
 * 
    build
    chore
    ci
    docs
    feat
    fix
    perf
    refactor
    revert
    style
    test
 */
