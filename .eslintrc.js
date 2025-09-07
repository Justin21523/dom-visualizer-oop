module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
    jest: true
  },

  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier'
  ],

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json'
  },

  plugins: [
    '@typescript-eslint',
    'import',
    'jsdoc',
    'prefer-arrow'
  ],

  rules: {
    // JavaScript/TypeScript Rules
    'indent': ['error', 2, { SwitchCase: 1 }],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'no-unused-vars': 'off', // Handled by TypeScript
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',

    // Code Quality
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-spacing': 'error',
    'no-duplicate-imports': 'error',

    // ES6+ Features
    'prefer-destructuring': ['error', {
      array: true,
      object: true
    }, {
      enforceForRenamedProperties: false
    }],
    'prefer-spread': 'error',
    'prefer-rest-params': 'error',

    // Object/Array Rules
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'computed-property-spacing': ['error', 'never'],

    // Function Rules
    'function-paren-newline': ['error', 'multiline-arguments'],
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always'
    }],

    // Import Rules
    'import/order': ['error', {
      groups: [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      'newlines-between': 'always',
      alphabetize: {
        order: 'asc',
        caseInsensitive: true
      }
    }],
    'import/no-unresolved': 'off', // Handled by TypeScript
    'import/no-duplicates': 'error',
    'import/newline-after-import': 'error',

    // JSDoc Rules
    'jsdoc/check-alignment': 'error',
    'jsdoc/check-indentation': 'error',
    'jsdoc/check-param-names': 'error',
    'jsdoc/check-syntax': 'error',
    'jsdoc/check-tag-names': 'error',
    'jsdoc/check-types': 'error',
    'jsdoc/require-description': 'error',
    'jsdoc/require-param': 'error',
    'jsdoc/require-param-description': 'error',
    'jsdoc/require-param-type': 'error',
    'jsdoc/require-returns': 'error',
    'jsdoc/require-returns-description': 'error',
    'jsdoc/require-returns-type': 'error',

    // Class Rules
    'class-methods-use-this': 'off',
    'no-useless-constructor': 'error',

    // Error Prevention
    'no-implicit-coercion': 'error',
    'no-implicit-globals': 'error',
    'no-implied-eval': 'error',
    'no-new-wrappers': 'error',
    'no-throw-literal': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-unused-expressions': 'error',

    // Performance
    'no-loop-func': 'error',
    'no-new-object': 'error',
    'no-new-array': 'error',

    // TypeScript Specific
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/prefer-readonly': 'error'
  },

  overrides: [
    {
      // Test files
      files: ['**/*.test.js', '**/*.test.ts', '**/*.spec.js', '**/*.spec.ts'],
      env: {
        jest: true,
        vitest: true
      },
      rules: {
        'no-console': 'off',
        'jsdoc/require-jsdoc': 'off'
      }
    },

    {
      // Configuration files
      files: ['*.config.js', '*.config.ts', '.eslintrc.js'],
      rules: {
        'no-console': 'off',
        'import/no-default-export': 'off'
      }
    },

    {
      // Worker files
      files: ['**/*.worker.js', '**/*.worker.ts'],
      env: {
        worker: true
      },
      rules: {
        'no-restricted-globals': 'off'
      }
    }
  ],

  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@', './src'],
          ['@core', './src/core'],
          ['@modules', './src/modules'],
          ['@components', './src/components'],
          ['@utils', './src/utils'],
          ['@styles', './src/styles'],
          ['@constants', './src/constants'],
          ['@types', './src/types'],
          ['@tests', './tests']
        ],
        extensions: ['.js', '.ts', '.json']
      }
    }
  }
};