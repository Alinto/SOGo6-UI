/**
 * ESLint rule to check for t() function usage patterns with useTranslations() parameters
 * 
 * This rule enforces that when using next-intl translations:
 * - If t() is called with a string literal, useTranslations() must have a namespace parameter
 * - If t() is called with a variable, useTranslations() must not have a namespace parameter
 * - This helps ensure proper translation key organization and prevents runtime errors
 */

export default {
    meta: {
        type: 'problem',
        docs: {
            description: 'Require useTranslations() to have a namespace parameter when t() is used with variables. Must have to translation checks in place.',
            category: 'Possible Errors',
            recommended: true,
        },
        fixable: null,
        schema: [],
        messages: {
            stringNeedsNamespace: 'useTranslations() must have a namespace parameter when t() is called with a string literal. Use useTranslations("namespace").',
            variableNeedsNoNamespace: 't() is called with a variable "{{variable}}" but useTranslations() has a namespace parameter. Remove the namespace parameter when using variables.',
            stringWithoutNamespace: 't() is called with string "{{string}}" but useTranslations() has no namespace parameter. Add a namespace parameter.',
            variableWithNamespace: 'useTranslations() has a namespace parameter but t() is called with a variable "{{variable}}". Remove the namespace parameter.',
        },
    },

    create(context) {
        let useTranslationsNodes = [];
        let tFunctionCalls = [];

        return {
            // Collect all useTranslations() calls
            CallExpression(node) {
                if (
                    node.callee.type === 'Identifier' &&
                    node.callee.name === 'useTranslations'
                ) {
                    useTranslationsNodes.push({
                        node,
                        hasNamespace: node.arguments.length > 0 && node.arguments[0].type === 'Literal'
                    });
                }

                // Collect all t() function calls
                if (
                    node.callee.type === 'Identifier' &&
                    node.callee.name === 't'
                ) {
                    const firstArg = node.arguments[0];
                    if (firstArg) {
                        const isStringLiteral = firstArg.type === 'Literal' && typeof firstArg.value === 'string';
                        const isVariable = firstArg.type === 'Identifier' ||
                            firstArg.type === 'MemberExpression' ||
                            firstArg.type === 'CallExpression' ||
                            firstArg.type === 'ConditionalExpression' ||
                            firstArg.type === 'LogicalExpression' ||
                            firstArg.type === 'BinaryExpression';

                        tFunctionCalls.push({
                            node,
                            isStringLiteral,
                            isVariable,
                            argumentName: getArgumentName(firstArg),
                            argumentValue: isStringLiteral ? firstArg.value : null
                        });
                    }
                }
            },

            // Check the collected data at the end of the program
            'Program:exit'() {
                // Find useTranslations() calls with and without namespace
                const useTranslationsWithNamespace = useTranslationsNodes.filter(
                    ut => ut.hasNamespace
                );
                const useTranslationsWithoutNamespace = useTranslationsNodes.filter(
                    ut => !ut.hasNamespace
                );

                // Find t() calls with strings and variables
                const tCallsWithStrings = tFunctionCalls.filter(t => t.isStringLiteral);
                const tCallsWithVariables = tFunctionCalls.filter(t => t.isVariable);

                // Rule 1: If t() is called with strings, useTranslations() must have a namespace
                if (tCallsWithStrings.length > 0 && useTranslationsWithoutNamespace.length > 0) {
                    useTranslationsWithoutNamespace.forEach(ut => {
                        context.report({
                            node: ut.node,
                            messageId: 'stringNeedsNamespace',
                        });
                    });

                    tCallsWithStrings.forEach(t => {
                        context.report({
                            node: t.node,
                            messageId: 'stringWithoutNamespace',
                            data: {
                                string: t.argumentValue
                            }
                        });
                    });
                }

                // Rule 2: If t() is called with variables, useTranslations() must not have a namespace
                if (tCallsWithVariables.length > 0 && useTranslationsWithNamespace.length > 0) {
                    useTranslationsWithNamespace.forEach(ut => {
                        context.report({
                            node: ut.node,
                            messageId: 'variableNeedsNoNamespace',
                            data: {
                                variable: tCallsWithVariables[0].argumentName
                            }
                        });
                    });

                    tCallsWithVariables.forEach(t => {
                        context.report({
                            node: t.node,
                            messageId: 'variableWithNamespace',
                            data: {
                                variable: t.argumentName
                            }
                        });
                    });
                }
            }
        };

        function getArgumentName(node) {
            switch (node.type) {
                case 'Identifier':
                    return node.name;
                case 'MemberExpression':
                    return context.getSourceCode().getText(node);
                case 'CallExpression':
                    return context.getSourceCode().getText(node);
                case 'ConditionalExpression':
                    return 'conditional expression';
                case 'LogicalExpression':
                    return 'logical expression';
                case 'BinaryExpression':
                    return 'binary expression';
                default:
                    return 'expression';
            }
        }
    },
};
