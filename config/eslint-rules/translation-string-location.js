/**
 * @fileoverview Rule to enforce that strings ending with .string outside t() must be in translation-mapping.ts
 */
"use strict";

module.exports = {
    meta: {
        type: "suggestion",
        docs: {
            description: "Enforce that strings ending with .string outside t() must be in translation-mapping.ts",
            category: "Possible Errors",
            recommended: false,
        },
        fixable: null,
        schema: [],
        messages: {
            invalidLocation: "Translation string '{{ value }}' must be defined in a translation-mapping.ts file or inside a t() (i18n) call, not in regular code files"
        }
    },

    create: function (context) {
        // Check if the current file is a translation-mapping.ts file
        const filename = context.getFilename();
        const isTranslationMappingFile = filename.endsWith('translation-mapping.ts');
        const isTranslationFile = filename.includes('/messages/') && filename.endsWith('.json');

        return {
            Literal(node) {
                // Check if it's a string literal ending with .string
                if (typeof node.value === 'string' && node.value.endsWith('.string')) {

                    // If we're in a translation mapping file or translation JSON file, this is allowed
                    if (isTranslationMappingFile || isTranslationFile) {
                        return;
                    }

                    // Check if this string is within a t() call or other translation functions
                    const isInTranslationCall = context.sourceCode.getAncestors(node).some(ancestor => {
                        if (ancestor.type === 'CallExpression') {
                            // Check for t() calls
                            if (ancestor.callee.type === 'Identifier' && ancestor.callee.name === 't') {
                                return true;
                            }

                            // Check for useTranslations() calls
                            if (ancestor.callee.type === 'Identifier' && ancestor.callee.name === 'useTranslations') {
                                return true;
                            }

                            // Check for formatMessage() calls
                            if (ancestor.callee.type === 'Identifier' && ancestor.callee.name === 'formatMessage') {
                                return true;
                            }

                            // Check for method calls on translation objects (e.g., translationVar('key'))
                            if (ancestor.callee.type === 'Identifier') {
                                // Look for variables that might be translation functions
                                const scope = context.sourceCode.getScope(node);
                                const variable = scope.variables.find(v => v.name === ancestor.callee.name);
                                if (variable && variable.defs.length > 0) {
                                    const def = variable.defs[0];
                                    if (def.node && def.node.init &&
                                        def.node.init.type === 'CallExpression' &&
                                        def.node.init.callee.name === 'useTranslations') {
                                        return true;
                                    }
                                }
                            }
                        }
                        return false;
                    });

                    // If not in a translation call, report an error
                    if (!isInTranslationCall) {
                        context.report({
                            node,
                            messageId: "invalidLocation",
                            data: {
                                value: node.value
                            }
                        });
                    }
                }
            }
        };
    }
};
