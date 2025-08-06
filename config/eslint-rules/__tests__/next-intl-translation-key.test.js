const { RuleTester } = require('eslint');
const rule = require('../next-intl-translation-key.js');

const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
    },
});

ruleTester.run('next-intl-translation-key', rule, {
    valid: [
        // Valid: useTranslations() with namespace when using string literals
        {
            code: `
        function MyComponent() {
          const t = useTranslations('common');
          return t('error.required');
        }
      `,
        },
        // Valid: useTranslations() without namespace when using variables
        {
            code: `
        function MyComponent() {
          const t = useTranslations();
          const message = 'error.required';
          return t(message);
        }
      `,
        },
        // Valid: multiple t() calls with strings and namespace
        {
            code: `
        function MyComponent() {
          const t = useTranslations('validation');
          return (
            <div>
              {t('error.required')}
              {t('error.invalid')}
            </div>
          );
        }
      `,
        },
        // Valid: multiple t() calls with variables and no namespace
        {
            code: `
        function MyComponent() {
          const t = useTranslations();
          const errorKey = 'error.required';
          const warningKey = 'warning.optional';
          return (
            <div>
              {t(errorKey)}
              {t(warningKey)}
            </div>
          );
        }
      `,
        },
        // Valid: no useTranslations at all
        {
            code: `
        function MyComponent() {
          const someFunction = () => {};
          const message = 'hello';
          return someFunction(message);
        }
      `,
        },
    ],
    invalid: [
        // Invalid: useTranslations() without namespace when t() uses string literals
        {
            code: `
        function MyComponent() {
          const t = useTranslations();
          return t('error.required');
        }
      `,
            errors: [
                {
                    messageId: 'stringNeedsNamespace',
                    line: 3,
                },
                {
                    messageId: 'stringWithoutNamespace',
                    line: 4,
                    data: { string: 'error.required' },
                },
            ],
        },
        // Invalid: useTranslations() with namespace when t() uses variables
        {
            code: `
        function MyComponent() {
          const t = useTranslations('common');
          const message = 'error.required';
          return t(message);
        }
      `,
            errors: [
                {
                    messageId: 'variableNeedsNoNamespace',
                    line: 3,
                    data: { variable: 'message' },
                },
                {
                    messageId: 'variableWithNamespace',
                    line: 5,
                    data: { variable: 'message' },
                },
            ],
        },
        // Invalid: multiple string literals without namespace
        {
            code: `
        function MyComponent() {
          const t = useTranslations();
          return (
            <div>
              {t('error.required')}
              {t('error.invalid')}
            </div>
          );
        }
      `,
            errors: [
                {
                    messageId: 'stringNeedsNamespace',
                    line: 3,
                },
                {
                    messageId: 'stringWithoutNamespace',
                    line: 6,
                    data: { string: 'error.required' },
                },
                {
                    messageId: 'stringWithoutNamespace',
                    line: 7,
                    data: { string: 'error.invalid' },
                },
            ],
        },
        // Invalid: multiple variables with namespace
        {
            code: `
        function MyComponent() {
          const t = useTranslations('validation');
          const errorKey = 'error.required';
          const warningKey = 'warning.optional';
          return (
            <div>
              {t(errorKey)}
              {t(warningKey)}
            </div>
          );
        }
      `,
            errors: [
                {
                    messageId: 'variableNeedsNoNamespace',
                    line: 3,
                    data: { variable: 'errorKey' },
                },
                {
                    messageId: 'variableWithNamespace',
                    line: 8,
                    data: { variable: 'errorKey' },
                },
                {
                    messageId: 'variableWithNamespace',
                    line: 9,
                    data: { variable: 'warningKey' },
                },
            ],
        },
    ],
}); console.log('All tests passed!');
