#!/usr/bin/env node

/**
 * Script to check if translation keys are used in the codebase and if they exist in translation files
 * 
 * This script:
 * 1. Concatenates all English translation JSON files
 * 2. Extracts namespace values from useTranslations() calls in source files
 * 3. Extracts translation keys from t() calls
 * 4. Prefixes those keys with their respective namespaces
 * 5. Checks if these prefixed keys exist in the concatenated translations
 * 6. Reports any missing or unused translations
 *
 * Note: Only checks for actual translation keys (ending with ".string")
 * 
 * Usage: 
 *   node scripts/check-translation-keys.js [options]
 *   node scripts/check-translation-keys.js --namespace=address-books
 * 
 * Options:
 *   --namespace=NAME   Filter results to specific namespace
 *   --report, -r       Generate JSON report files (default: false)
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
let namespaceFilter = null;
let generateReports = false;

// Check for namespace filter and report generation flag
args.forEach(arg => {
    // Format: --namespace=value or just value
    if (arg.startsWith('--namespace=')) {
        namespaceFilter = arg.split('=')[1];
    } else if (arg === '--report' || arg === '-r') {
        generateReports = true;
    } else if (!arg.startsWith('--')) {
        namespaceFilter = arg;
    }
});

// Configuration
const MESSAGES_DIR = path.join(__dirname, '../src/messages/en');
const SRC_DIR = path.join(__dirname, '../src');
const IGNORED_DIRS = ['node_modules', '.next', 'out', 'build', 'dist', 'coverage'];

// Utility to get all files with a specific extension
function getAllFiles(dir, extensions = [], filelist = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filepath = path.join(dir, file);

        if (IGNORED_DIRS.includes(file)) {
            return;
        }

        if (fs.statSync(filepath).isDirectory()) {
            filelist = getAllFiles(filepath, extensions, filelist);
        } else {
            const extension = path.extname(file).toLowerCase();
            if (extensions.length === 0 || extensions.includes(extension)) {
                filelist.push(filepath);
            }
        }
    });

    return filelist;
}

// Read and parse all translation files
function getTranslationKeys() {
    const translationFiles = getAllFiles(MESSAGES_DIR, ['.json']);
    const allKeys = {};

    // Process each translation file
    for (const file of translationFiles) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const translations = JSON.parse(content);

            // Get file-based namespace
            let relativePath = path.relative(MESSAGES_DIR, file);
            let fileNamespace;

            // Handle nested folder structure
            if (relativePath.includes(path.sep)) {
                const pathParts = relativePath.split(path.sep);
                const dirName = pathParts[0];
                const fileName = path.basename(pathParts[pathParts.length - 1], '.json');
                fileNamespace = fileName !== 'index' ? `${dirName}:${fileName}` : dirName;
            } else {
                fileNamespace = path.basename(file, '.json');
            }

            // Check for top-level namespace in content (e.g., "Mails_Common")
            const namespaceKeys = Object.keys(translations);
            if (namespaceKeys.length === 1 && typeof translations[namespaceKeys[0]] === 'object') {
                // Use the namespace from the file content (e.g., "Mails_Common")
                const contentNamespace = namespaceKeys[0];

                // Function to recursively process translation objects
                function processKeys(obj, prefix = '') {
                    for (const key of Object.keys(obj)) {
                        const newKey = prefix ? `${prefix}.${key}` : key;

                        if (typeof obj[key] === 'object' && obj[key] !== null) {
                            processKeys(obj[key], newKey);
                        } else if (newKey.endsWith('.string')) {
                            // Use the content namespace + the key
                            const fullKey = `${contentNamespace}.${newKey}`;
                            allKeys[fullKey] = {
                                file,
                                used: false,
                                value: obj[key]
                            };
                        }
                    }
                }

                // Process from the namespace's content
                processKeys(translations[contentNamespace]);
            } else {
                // No specific namespace in content, use file-based namespace
                function processKeys(obj, prefix = '') {
                    for (const key of Object.keys(obj)) {
                        const newKey = prefix ? `${prefix}.${key}` : key;

                        if (typeof obj[key] === 'object' && obj[key] !== null) {
                            processKeys(obj[key], newKey);
                        } else if (newKey.endsWith('.string')) {
                            // Use file namespace + key
                            const fullKey = fileNamespace ? `${fileNamespace}.${newKey}` : newKey;
                            allKeys[fullKey] = {
                                file,
                                used: false,
                                value: obj[key]
                            };
                        }
                    }
                }

                processKeys(translations);
            }
        } catch (error) {
            console.error(`Error parsing ${file}: ${error.message}`);
        }
    }

    return allKeys;
}

// Legacy function reference removed
// function getTranslationKeys() {
//    return allKeys;
// }

// Check if translation keys are used in the codebase
function checkUsage(keys) {
    const sourceFiles = getAllFiles(SRC_DIR, ['.js', '.jsx', '.ts', '.tsx']);
    const usedKeys = new Set();
    const potentialMissingKeys = new Map(); // Keys used but not found in translations - using Map to prevent duplicates
    const namespaceMap = {}; // Map to store file-specific namespace context

    // Create a mapping of simple keys to their full keys for easier lookup
    // Since the namespace is in the JSON file but not in the JS code
    const simpleKeyToFullKeyMap = {};
    Object.keys(keys).forEach(fullKey => {
        if (fullKey.startsWith('_')) return; // Skip special keys

        const keyParts = fullKey.split('.');
        // The first part is the namespace, the rest is the simple key
        const namespaceEndIndex = fullKey.indexOf('.');
        const simpleKey = namespaceEndIndex !== -1 ? fullKey.substring(namespaceEndIndex + 1) : fullKey;

        // Only create mapping for actual translation keys
        if (simpleKey.endsWith('.string')) {
            if (!simpleKeyToFullKeyMap[simpleKey]) {
                simpleKeyToFullKeyMap[simpleKey] = [];
            }
            simpleKeyToFullKeyMap[simpleKey].push(fullKey);
        }
    });

    // First pass: Extract namespaces and their contexts
    sourceFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');

        // Find all useTranslations calls to determine namespaces
        const namespaceMatches = Array.from(content.matchAll(/useTranslations\(['"](.*?)['"]\)/g));

        if (namespaceMatches.length > 0) {
            namespaceMatches.forEach(match => {
                const namespace = match[1];
                if (!namespaceMap[file]) {
                    namespaceMap[file] = [];
                }
                if (!namespaceMap[file].includes(namespace)) {
                    namespaceMap[file].push(namespace);
                }
            });
        }
    });

    // Second pass: Check for usages with namespace context
    sourceFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        let namespaces = namespaceMap[file] || [];

        // For files with no namespaces, look for common mail/calendar namespaces based on the file path
        if (namespaces.length === 0) {
            // Try to infer namespace based on file path
            if (file.includes('/mails/')) {
                namespaces = ['Mails', 'Mails_Common'];
            } else if (file.includes('/calendar/')) {
                namespaces = ['Calendar', 'Calendar_Common'];
            } else if (file.includes('/address_books/')) {
                namespaces = ['Address_Books', 'Address_Book_Item'];
            }
        }

        // Check all string literals for translation keys, even in files with no namespaces
        // This pattern specifically targets return statements with translation keys (e.g., from utils.ts)
        const returnStringLiterals = Array.from(content.matchAll(/return\s+['"]([\w.]+\.string)['"]/g));
        // Also check for other patterns where string literals are assigned or compared
        const assignedStringLiterals = Array.from(content.matchAll(/(?:=|===|==|!==|!=)\s*['"]([\w.]+\.string)['"]/g));
        // Check for string literals in object literals (e.g., { label: 'key.string' })
        const objectStringLiterals = Array.from(content.matchAll(/:\s*['"]([\w.]+\.string)['"]/g));
        // Check for string literals in function calls (e.g., someFunction('key.string'))
        const functionStringLiterals = Array.from(content.matchAll(/\(\s*['"]([\w.]+\.string)['"]/g));
        // Combine all matches
        const allStringLiterals = [
            ...returnStringLiterals,
            ...assignedStringLiterals,
            ...objectStringLiterals,
            ...functionStringLiterals
        ];

        allStringLiterals.forEach(match => {
            const key = match[1];

            // Check if this key exists in our translations with any namespace
            for (const fullKey of Object.keys(keys)) {
                if (fullKey.endsWith(`.${key}`)) {
                    keys[fullKey].used = true;
                    usedKeys.add(fullKey);
                }
            }

            // If the key has no namespace and just ends with .string, skip it
            if (!key.includes('.')) {
                return; // Skip this iteration
            }

            // If key has form like "folders.inbox.string", try to match with known namespaces
            const keyParts = key.split('.');
            if (keyParts.length >= 2) {
                // Try with some common namespaces
                const commonNamespaces = ['Mails', 'Mails_Common', 'Calendar', 'Calendar_Common', 'Address_Books', 'Address_Book_Item', 'User_Settings'];
                for (const ns of commonNamespaces) {
                    const prefixedKey = `${ns}.${key}`;
                    if (keys[prefixedKey]) {
                        keys[prefixedKey].used = true;
                        usedKeys.add(prefixedKey);
                    }
                }
            }
        });

        // Skip regular namespace processing for files with no namespaces
        if (namespaces.length === 0) return;

        // Process each namespace in this file
        namespaces.forEach(namespace => {
            // Determine which variable contains the translation function
            // Example: const t = useTranslations('namespace')
            const translationVarRegex = new RegExp(`const\\s+([a-zA-Z0-9_]+)\\s*=\\s*useTranslations\\(['"]${namespace}['"]\\)`, 'g');
            const translationVarMatches = Array.from(content.matchAll(translationVarRegex));

            translationVarMatches.forEach(varMatch => {
                const translationVar = varMatch[1]; // This should be 't' in most cases

                // Now find all usages of this variable with keys
                // Pattern: t('key.string')
                const keyRegex = new RegExp(`${translationVar}\\(['"]([^'"]+)['"]`, 'g');
                const keyMatches = Array.from(content.matchAll(keyRegex));

                keyMatches.forEach(keyMatch => {
                    const key = keyMatch[1];

                    // Only process keys that look like translation keys
                    if (!key.endsWith('.string')) return;

                    // Create the prefixed key using the namespace from useTranslations
                    const prefixedKey = `${namespace}.${key}`;

                    // Check if this key exists in our translations
                    let found = false;
                    if (keys[prefixedKey]) {
                        keys[prefixedKey].used = true;
                        usedKeys.add(prefixedKey);
                        found = true;
                    }

                    // If not found directly, try alternative formats (kebab-case vs snake_case)
                    if (!found) {
                        // Try with alternative namespace formats (kebab vs snake case)
                        const altNamespace = namespace.includes('-')
                            ? namespace.replace(/-/g, '_')
                            : namespace.replace(/_/g, '-');

                        const altPrefixedKey = `${altNamespace}.${key}`;
                        if (keys[altPrefixedKey]) {
                            keys[altPrefixedKey].used = true;
                            usedKeys.add(altPrefixedKey);
                            found = true;
                        }
                    }

                    // If not found, try to find a partial match before reporting as missing
                    if (!found) {
                        // Try checking if there are similar keys that might be a match
                        // This can help with cases where the key structure is slightly different
                        let similarKeyFound = false;

                        // Check if we have similar keys in our translations
                        const keyParts = key.split('.');
                        if (keyParts.length > 2) {
                            // For cases like "sidebar.options.delete.modal.title.string"
                            // Try removing parts to see if we can find a match
                            // e.g., "sidebar.options.delete.title.string"

                            // Try removing intermediate parts (like "modal")
                            for (let i = 1; i < keyParts.length - 1; i++) {
                                const modifiedParts = [...keyParts];
                                modifiedParts.splice(i, 1);
                                const modifiedKey = modifiedParts.join('.');
                                const modifiedPrefixedKey = `${namespace}.${modifiedKey}`;

                                if (keys[modifiedPrefixedKey]) {
                                    keys[modifiedPrefixedKey].used = true;
                                    usedKeys.add(modifiedPrefixedKey);
                                    similarKeyFound = true;
                                    break;
                                }

                                // Try alternative namespace
                                const altNamespace = namespace.includes('-')
                                    ? namespace.replace(/-/g, '_')
                                    : namespace.replace(/_/g, '-');

                                const altModifiedPrefixedKey = `${altNamespace}.${modifiedKey}`;
                                if (keys[altModifiedPrefixedKey]) {
                                    keys[altModifiedPrefixedKey].used = true;
                                    usedKeys.add(altModifiedPrefixedKey);
                                    similarKeyFound = true;
                                    break;
                                }
                            }
                        }

                        if (!similarKeyFound) {
                            // Skip reporting missing keys in test files
                            if (!(file.includes('__tests__') || file.includes('.test.'))) {
                                const uniqueKey = `${namespace}:${key}`;
                                potentialMissingKeys.set(uniqueKey, {
                                    key,
                                    prefixedKey,
                                    namespace,
                                    file: file,
                                    line: getLineNumber(content, keyMatch.index),
                                    translationVar
                                });
                            }
                        }
                    }
                });
            });
        });

        // Also check for translation keys in data structures (objects, arrays)
        // This will find string literals ending with .string in data structures
        const objectKeyMatches = Array.from(content.matchAll(/['"]([^'"]+\.string)['"]/g));
        objectKeyMatches.forEach(match => {
            const key = match[1];

            // Only process string literals that appear to be translation keys
            if (!key.endsWith('.string')) return;

            // Get all namespaces for this file
            namespaces.forEach(namespace => {
                // Create the prefixed key
                const prefixedKey = `${namespace}.${key}`;

                // Check if this key exists in our translations
                let found = false;
                if (keys[prefixedKey]) {
                    keys[prefixedKey].used = true;
                    usedKeys.add(prefixedKey);
                    found = true;
                }

                // Try alternative namespace formats
                if (!found) {
                    const altNamespace = namespace.includes('-')
                        ? namespace.replace(/-/g, '_')
                        : namespace.replace(/_/g, '-');

                    const altPrefixedKey = `${altNamespace}.${key}`;
                    if (keys[altPrefixedKey]) {
                        keys[altPrefixedKey].used = true;
                        usedKeys.add(altPrefixedKey);
                        found = true;
                    }
                }

                // If not found, try to find a partial match before reporting as missing
                if (!found) {
                    // Only consider it potentially missing if it has proper format
                    if (key.includes('.') && key.endsWith('.string')) {
                        // Try checking if there are similar keys that might be a match
                        // This can help with cases where the key structure is slightly different
                        let similarKeyFound = false;

                        // Check if we have similar keys in our translations
                        const keyParts = key.split('.');
                        if (keyParts.length > 2) {
                            // For cases like "sidebar.options.delete.modal.title.string"
                            // Try removing parts to see if we can find a match
                            // e.g., "sidebar.options.delete.title.string"

                            // Try removing intermediate parts (like "modal")
                            for (let i = 1; i < keyParts.length - 1; i++) {
                                const modifiedParts = [...keyParts];
                                modifiedParts.splice(i, 1);
                                const modifiedKey = modifiedParts.join('.');
                                const modifiedPrefixedKey = `${namespace}.${modifiedKey}`;

                                if (keys[modifiedPrefixedKey]) {
                                    keys[modifiedPrefixedKey].used = true;
                                    usedKeys.add(modifiedPrefixedKey);
                                    similarKeyFound = true;
                                    break;
                                }

                                // Try alternative namespace
                                const altNamespace = namespace.includes('-')
                                    ? namespace.replace(/-/g, '_')
                                    : namespace.replace(/_/g, '-');

                                const altModifiedPrefixedKey = `${altNamespace}.${modifiedKey}`;
                                if (keys[altModifiedPrefixedKey]) {
                                    keys[altModifiedPrefixedKey].used = true;
                                    usedKeys.add(altModifiedPrefixedKey);
                                    similarKeyFound = true;
                                    break;
                                }
                            }
                        }

                        if (!similarKeyFound) {
                            // Skip reporting missing keys in test files
                            if (!(file.includes('__tests__') || file.includes('.test.'))) {
                                const uniqueKey = `${namespace}:${key}`;
                                potentialMissingKeys.set(uniqueKey, {
                                    key,
                                    prefixedKey,
                                    namespace,
                                    file: file,
                                    line: getLineNumber(content, match.index),
                                    translationVar: 'Data Structure' // Indicate this was found in a data structure
                                });
                            }
                        }
                    }
                }
            });
        });

        // Also check for traditional translation patterns (these are not tied to namespace)

        // Pattern 2: formatMessage with explicit ID
        const formatMessageMatches = Array.from(content.matchAll(/formatMessage\(\s*\{\s*id:\s*['"](.*?)['"]/g));
        formatMessageMatches.forEach(match => {
            const key = match[1];
            let found = false;

            // Check if this simple key exists in our mapping
            if (simpleKeyToFullKeyMap[key]) {
                // Mark all matching full keys as used
                simpleKeyToFullKeyMap[key].forEach(fullKey => {
                    keys[fullKey].used = true;
                    usedKeys.add(fullKey);
                    found = true;
                });
            }            // If not found and looks like a translation key, add to potentially missing
            if (!found && key.endsWith('.string')) {
                // Skip reporting missing keys in test files
                if (!(file.includes('__tests__') || file.includes('.test.'))) {
                    const uniqueKey = `property:${key}`;
                    potentialMissingKeys.set(uniqueKey, {
                        key: key,
                        file: file,
                        line: getLineNumber(content, match.index)
                    });
                }
            }
        });

        // Pattern 4: String literal keys in component props like titleKey="key.string"
        const propKeyMatches = Array.from(content.matchAll(/[a-zA-Z]*Key=["'](.*?)["']/g));
        propKeyMatches.forEach(match => {
            const key = match[1];
            let found = false;

            // Check if this simple key exists in our mapping
            if (simpleKeyToFullKeyMap[key]) {
                // Mark all matching full keys as used
                simpleKeyToFullKeyMap[key].forEach(fullKey => {
                    keys[fullKey].used = true;
                    usedKeys.add(fullKey);
                    found = true;
                });
            }

            // If not found and looks like a translation key, add to potentially missing
            if (!found && key.includes('.') && key.endsWith('.string')) {
                // Skip reporting missing keys in test files
                if (!(file.includes('__tests__') || file.includes('.test.'))) {
                    const uniqueKey = `formatMessage:${key}`;
                    potentialMissingKeys.set(uniqueKey, {
                        key: key,
                        file: file,
                        line: getLineNumber(content, match.index)
                    });
                }
            }
        });
    });

    // Store potential missing keys for reporting
    if (potentialMissingKeys.size > 0) {
        keys._potentialMissing = Array.from(potentialMissingKeys.values());
    }

    return usedKeys;
}

// Helper function to get line number from character index
function getLineNumber(content, index) {
    const lines = content.slice(0, index).split('\n');
    return lines.length;
}

// Main execution
function main() {
    console.log('Checking translation keys usage...');

    // Get all translation keys
    const allKeys = getTranslationKeys();

    // Filter by namespace if specified
    let keysToCheck = allKeys;
    if (namespaceFilter) {
        // Create a new object with only keys from the specified namespace
        keysToCheck = Object.keys(allKeys)
            .filter(key => !key.startsWith('_') && key.startsWith(`${namespaceFilter}.`))
            .reduce((obj, key) => {
                obj[key] = allKeys[key];
                return obj;
            }, { _potentialMissing: [] });

        console.log(`Filtering for namespace: ${namespaceFilter}`);
        console.log(`Found ${Object.keys(keysToCheck).length - 1} translation keys for namespace in ${MESSAGES_DIR}`);
    } else {
        console.log(`Found ${Object.keys(allKeys).filter(key => !key.startsWith('_')).length} total translation keys in ${MESSAGES_DIR}`);
    }

    // Check usage
    const usedKeys = checkUsage(keysToCheck);
    console.log(`Found ${usedKeys.size} used translation keys`);

    // Report unused keys
    const unusedKeys = Object.keys(keysToCheck).filter(
        key => !key.startsWith('_') && !keysToCheck[key].used
    );

    if (unusedKeys.length > 0) {
        console.log('\n=== UNUSED TRANSLATION KEYS ===');

        // Group by file for better readability
        const groupedByFile = {};
        unusedKeys.forEach(key => {
            const file = allKeys[key].file;
            if (!groupedByFile[file]) {
                groupedByFile[file] = [];
            }
            groupedByFile[file].push(key);
        });

        Object.keys(groupedByFile).sort().forEach(file => {
            const relativeFile = path.relative(process.cwd(), file);
            console.log(`\nFile: ${relativeFile}`);
            groupedByFile[file].sort().forEach(key => {
                console.log(`  - ${key}`);
            });
        });

        console.log(`\nTotal: ${unusedKeys.length} unused translation keys`);

        // Output keys to a file for easier analysis if report generation is enabled
        if (generateReports) {
            const reportPath = path.join(__dirname, 'unused-translations-report.json');
            fs.writeFileSync(
                reportPath,
                JSON.stringify(
                    unusedKeys.reduce((acc, key) => {
                        acc[key] = {
                            file: path.relative(process.cwd(), allKeys[key].file),
                            value: allKeys[key].value
                        };
                        return acc;
                    }, {}),
                    null,
                    2
                )
            );
            console.log(`\nDetailed unused keys report saved to: ${reportPath}`);
        }
    } else {
        console.log('\nAll translation keys are used. Great job!');
    }

    // Report potentially missing keys
    if (allKeys._potentialMissing && allKeys._potentialMissing.length > 0) {
        console.log('\n=== POTENTIALLY MISSING TRANSLATION KEYS ===');
        console.log('These keys are used in the code but were not found in translation files:');

        // Group by namespace for better organization
        const groupedByNamespace = {};

        allKeys._potentialMissing.forEach(item => {
            const namespace = item.namespace || 'unknown';
            if (!groupedByNamespace[namespace]) {
                groupedByNamespace[namespace] = [];
            }
            groupedByNamespace[namespace].push(item);
        });

        // Then group by file within each namespace
        Object.keys(groupedByNamespace).sort().forEach(namespace => {
            console.log(`\nNamespace: ${namespace}`);

            const groupedByFile = {};
            groupedByNamespace[namespace].forEach(item => {
                const file = item.file;
                if (!groupedByFile[file]) {
                    groupedByFile[file] = [];
                }
                groupedByFile[file].push(item);
            });

            Object.keys(groupedByFile).sort().forEach(file => {
                const relativeFile = path.relative(process.cwd(), file);
                console.log(`  File: ${relativeFile}`);

                groupedByFile[file].sort((a, b) => a.line - b.line).forEach(item => {
                    const prefixedKey = item.prefixedKey || `${namespace}.${item.key}`;
                    console.log(`    - Line ${item.line}: ${item.key} (full key would be ${prefixedKey})`);
                });
            });
        });

        console.log(`\nTotal: ${allKeys._potentialMissing.length} potentially missing translation keys`);

        // Output missing keys to a file for easier analysis if report generation is enabled
        if (generateReports) {
            const missingReportPath = path.join(__dirname, 'missing-translations-report.json');
            fs.writeFileSync(missingReportPath, JSON.stringify(allKeys._potentialMissing, null, 2));
            console.log(`\nDetailed missing keys report saved to: ${missingReportPath}`);
        }
    } else {
        console.log('\nNo potentially missing translation keys detected.');
    }

    // Generate statistics
    const fileCount = new Set(
        Object.values(allKeys)
            .filter(info => typeof info === 'object' && info.file)
            .map(info => info.file)
    ).size;

    console.log('\n=== TRANSLATION STATISTICS ===');
    console.log(`- Total translation files: ${fileCount}`);

    const totalKeys = Object.keys(allKeys).filter(key => !key.startsWith('_')).length;
    console.log(`- Total translation keys: ${totalKeys}`);
    console.log(`- Used keys: ${usedKeys.size} (${Math.round(usedKeys.size / totalKeys * 100)}%)`);
    console.log(`- Unused keys: ${unusedKeys.length} (${Math.round(unusedKeys.length / totalKeys * 100)}%)`);

    if (allKeys._potentialMissing) {
        console.log(`- Potentially missing keys: ${allKeys._potentialMissing.length}`);
    }
}

main();
