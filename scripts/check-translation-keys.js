#!/usr/bin/env node

/**
 * Translation Keys Checker
 * 
 * This script analyzes the translation keys in the SOGo project to find:
 * - Missing translation keys (used in code but not defined in translation files)
 * - Unused translation keys (defined in translation files but not used in code)
 * 
 * Translation Pattern:
 * - Keys follow the pattern: <NAMESPACE>.key.key.string
 * - Namespace is dynamic and always uppercase
 * - All translation strings end with .string
 * - English translation files are in src/messages/en
 * 
 * Supported Usage Patterns:
 * - Function calls: t('NAMESPACE.key.string')
 * - Function calls with params: t('NAMESPACE.key.string', {param: value})
 * - Namespaced calls: useTranslations('NAMESPACE') + t('key.string')
 * - Namespaced calls with params: useTranslations('NAMESPACE') + t('key.string', {param: value})
 * - Multiple namespaces: const formT = useTranslations('FORM_COMMONS') + formT('key.string')
 * - Object literals: { title: 'NAMESPACE.key.string' }
 * - Array elements: ['NAMESPACE.key.string']
 * 
 * Usage:
 *   npm run check:translations                    # Full analysis
 *   node scripts/check-translation-keys.js       # Full analysis
 *   node scripts/check-translation-keys.js -m    # Only show missing keys
 *   node scripts/check-translation-keys.js -q    # Quiet mode (minimal output)
 *   node scripts/check-translation-keys.js -f src/path/to/file.tsx  # Check specific file
 * 
 * Options:
 *   -m, --only-missing    Only check for missing keys (ignore unused)
 *   -q, --quiet          Minimal output (useful for CI/CD)
 *   -f, --file <path>    Check only a specific file
 * 
 * Exit Codes:
 *   0: Success (all keys are properly used)
 *   1: Error (missing translation keys found)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const MESSAGES_DIR = path.join(__dirname, '../src/messages/en')
const SOURCE_DIRS = [
    path.join(__dirname, '../src'),
    path.join(__dirname, '../components')
]

// Colors for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
    reset: '\x1b[0m'
}

/**
 * Recursively find files with specific extensions
 */
function findFiles(dir, extensions, ignore = []) {
    const files = []

    function traverse(currentDir) {
        if (!fs.existsSync(currentDir)) return

        const items = fs.readdirSync(currentDir)

        for (const item of items) {
            const fullPath = path.join(currentDir, item)
            const stat = fs.statSync(fullPath)

            if (stat.isDirectory()) {
                // Skip ignored directories
                if (ignore.some(pattern => item.includes(pattern))) continue
                traverse(fullPath)
            } else if (stat.isFile()) {
                // Check if file matches extensions
                if (extensions.some(ext => item.endsWith(ext))) {
                    files.push(fullPath)
                }
            }
        }
    }

    traverse(dir)
    return files
}

/**
 * Extract all translation keys ending with .string from JSON files
 */
function extractTranslationKeys() {
    const keys = new Map() // Map to store key -> {file, line} object

    // Find all JSON files in messages directory
    const jsonFiles = findFiles(MESSAGES_DIR, ['.json'])

    jsonFiles.forEach(filePath => {
        try {
            const content = fs.readFileSync(filePath, 'utf8')
            const lines = content.split('\n')
            const translations = JSON.parse(content)

            // Recursively extract keys ending with .string with line numbers
            const fileKeys = new Map()
            extractKeysFromObject(translations, '', fileKeys, lines, content)

            // Store each key with its file path and line number
            fileKeys.forEach((line, key) => {
                keys.set(key, { file: path.relative(MESSAGES_DIR, filePath), line })
            })
        } catch (error) {
            const relativePath = path.relative(MESSAGES_DIR, filePath)
            console.error(`${colors.red}Error reading ${relativePath}: ${error.message}${colors.reset}`)
        }
    })

    return keys
}

/**
 * Recursively extract keys from translation object
 */
function extractKeysFromObject(obj, prefix, keys, lines, content) {
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key

        if (typeof value === 'object' && value !== null) {
            // Check if this object has a 'string' property (it's a translation)
            if (value.hasOwnProperty('string')) {
                // This is a translation key, add it with .string suffix
                const translationKey = `${fullKey}.string`

                // Find line number by searching for the key in the content
                const searchPattern = new RegExp(`"${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*:\\s*{[^}]*"string"`, 'g')
                const match = searchPattern.exec(content)
                let lineNumber = 1

                if (match && lines) {
                    // Calculate line number based on character position
                    let currentIndex = 0
                    for (let i = 0; i < lines.length; i++) {
                        if (currentIndex + lines[i].length >= match.index) {
                            lineNumber = i + 1
                            break
                        }
                        currentIndex += lines[i].length + 1 // +1 for newline
                    }
                }

                keys.set(translationKey, lineNumber)
            }
            // Continue recursing for nested objects
            extractKeysFromObject(value, fullKey, keys, lines, content)
        }
    }
}

/**
 * Extract translation usage from JS/TS files
 */
function extractUsedTranslations(specificFile = null) {
    const usedKeys = new Map() // Map to store key -> array of {file, line} objects

    // Find all JS/TS files or use specific file
    let sourceFiles = []
    if (specificFile) {
        // Check if the specific file exists and has the right extension
        const fullPath = path.isAbsolute(specificFile) ? specificFile : path.join(process.cwd(), specificFile)
        if (fs.existsSync(fullPath) && ['.js', '.jsx', '.ts', '.tsx'].some(ext => fullPath.endsWith(ext))) {
            sourceFiles = [fullPath]
        } else {
            console.error(`${colors.red}Error: File not found or not a JS/TS file: ${specificFile}${colors.reset}`)
            return usedKeys
        }
    } else {
        SOURCE_DIRS.forEach(dir => {
            if (fs.existsSync(dir)) {
                const files = findFiles(dir, ['.js', '.jsx', '.ts', '.tsx'], ['__tests__', '.test.', '.spec.', 'node_modules'])
                sourceFiles.push(...files)
            }
        })
    }

    sourceFiles.forEach(file => {
        try {
            const content = fs.readFileSync(file, 'utf8')

            // Extract translation keys from the file with line numbers
            const keysWithLines = extractTranslationKeysFromCode(content, file)
            keysWithLines.forEach(({ key, line }) => {
                if (!usedKeys.has(key)) {
                    usedKeys.set(key, [])
                }
                const relativePath = file.replace(path.join(__dirname, '..'), '').substring(1)
                usedKeys.get(key).push({ file: relativePath, line })
            })
        } catch (error) {
            console.error(`${colors.red}Error reading ${file}: ${error.message}${colors.reset}`)
        }
    })

    return usedKeys
}

/**
 * Extract translation keys from code content
 */
function extractTranslationKeysFromCode(content, filePath) {
    const keys = []
    const lines = content.split('\n')

    // Helper function to find line number for a given match index
    function getLineNumber(matchIndex) {
        let currentIndex = 0
        for (let i = 0; i < lines.length; i++) {
            if (currentIndex + lines[i].length >= matchIndex) {
                return i + 1 // Line numbers are 1-based
            }
            currentIndex += lines[i].length + 1 // +1 for newline character
        }
        return 1
    }

    // Pattern 1: t('NAMESPACE.key.key.string') - basic usage
    const pattern1 = /t\(\s*['"`]([A-Z_]+(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*\.string)['"`]\s*\)/g

    // Pattern 2: t(`NAMESPACE.key.key.string`) - template literal
    const pattern2 = /t\(\s*`([A-Z_]+(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*\.string)`\s*\)/g

    // Pattern 3: t('NAMESPACE.key.string', {...}) - with parameters
    const pattern3 = /t\(\s*['"`]([A-Z_]+(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*\.string)['"`]\s*,/g

    // Pattern 4: useTranslations('NAMESPACE') followed by variable.t('key.key.string')
    const useTranslationsPattern = /(\w+)\s*=\s*useTranslations\(\s*['"`]([A-Z_]+)['"`]\s*\)/g
    const namespaceMatches = Array.from(content.matchAll(useTranslationsPattern))

    // Pattern 5: String literals in objects/arrays (e.g., title: 'NAMESPACE.key.string')
    const objectLiteralPattern = /['"`]([A-Z_]+(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*\.string)['"`]/g

    // Extract direct translation calls
    let match
    while ((match = pattern1.exec(content)) !== null) {
        keys.push({ key: match[1], line: getLineNumber(match.index) })
    }

    while ((match = pattern2.exec(content)) !== null) {
        keys.push({ key: match[1], line: getLineNumber(match.index) })
    }

    // Extract translation calls with parameters
    while ((match = pattern3.exec(content)) !== null) {
        keys.push({ key: match[1], line: getLineNumber(match.index) })
    }

    // Extract string literals that match translation pattern
    while ((match = objectLiteralPattern.exec(content)) !== null) {
        const key = match[1]
        // Only add if it's not already captured by t() patterns
        // Check if this match is inside a t() function call
        const beforeMatch = content.substring(0, match.index)
        const lastTFunctionCall = beforeMatch.lastIndexOf('t(')
        const lastClosingParen = beforeMatch.lastIndexOf(')')

        // If the last t( is after the last ), then this key is inside a t() call
        // and we don't need to add it again
        if (lastTFunctionCall === -1 || lastClosingParen > lastTFunctionCall) {
            keys.push({ key: key, line: getLineNumber(match.index) })
        }
    }

    // Extract namespaced translation calls
    namespaceMatches.forEach(nsMatch => {
        const variableName = nsMatch[1] // e.g., 't', 'formT', etc.
        const namespace = nsMatch[2]    // e.g., 'ADDRESS_BOOKS_SIDEBAR', 'FORM_COMMONS'

        // Pattern for namespaced calls without parameters: variableName('key.string')
        const namespacedPattern = new RegExp(`${variableName}\\(\\s*['"\`]([a-zA-Z_][a-zA-Z0-9_]*(?:\\.[a-zA-Z_][a-zA-Z0-9_]*)*\\.string)['"\`]\\s*\\)`, 'g')
        // Pattern for namespaced calls with parameters: variableName('key.string', {...})
        const namespacedPatternWithParams = new RegExp(`${variableName}\\(\\s*['"\`]([a-zA-Z_][a-zA-Z0-9_]*(?:\\.[a-zA-Z_][a-zA-Z0-9_]*)*\\.string)['"\`]\\s*,`, 'g')

        let namespacedMatch
        while ((namespacedMatch = namespacedPattern.exec(content)) !== null) {
            const fullKey = `${namespace}.${namespacedMatch[1]}`
            keys.push({ key: fullKey, line: getLineNumber(namespacedMatch.index) })
        }

        while ((namespacedMatch = namespacedPatternWithParams.exec(content)) !== null) {
            const fullKey = `${namespace}.${namespacedMatch[1]}`
            keys.push({ key: fullKey, line: getLineNumber(namespacedMatch.index) })
        }
    })

    return keys
}

/**
 * Generate report
 */
function generateReport(onlyMissing = false, quiet = false, specificFile = null) {
    if (!quiet) {
        if (specificFile) {
            console.log(`${colors.cyan}🔍 Checking specific file: ${specificFile}${colors.reset}`)
        } else {
            console.log(`${colors.cyan}🔍 Extracting translation keys...${colors.reset}`)
        }
    }

    const translationKeys = extractTranslationKeys()
    const usedKeys = extractUsedTranslations(specificFile)

    const allTranslationKeys = Array.from(translationKeys.keys()).sort()
    const allUsedKeys = Array.from(usedKeys.keys()).sort()

    if (!quiet) {
        console.log(`${colors.blue}📊 Translation Keys Analysis${colors.reset}`)
        console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`)

        if (specificFile) {
            console.log(`\n${colors.green}✓ File analyzed: ${specificFile}${colors.reset}`)
            console.log(`${colors.green}✓ Translation keys found in file: ${allUsedKeys.length}${colors.reset}`)
        } else {
            console.log(`\n${colors.green}✓ Total translation keys found: ${allTranslationKeys.length}${colors.reset}`)
            console.log(`${colors.green}✓ Total used keys found: ${allUsedKeys.length}${colors.reset}`)
        }
    }

    // Find unused keys
    const unusedKeys = allTranslationKeys.filter(key => !usedKeys.has(key))

    // Find missing keys (used but not defined)
    const missingKeys = allUsedKeys.filter(key => !translationKeys.has(key))

    // For specific file mode, show different output
    if (specificFile) {
        if (allUsedKeys.length > 0) {
            console.log(`\n${colors.blue}🔍 Translation keys used in ${specificFile}:${colors.reset}`)
            console.log(`${colors.blue}${'─'.repeat(50)}${colors.reset}`)
            allUsedKeys.forEach(key => {
                const isValid = translationKeys.has(key)
                const color = isValid ? colors.green : colors.red
                const status = isValid ? '✓' : '✗'
                console.log(`${color}  ${status} ${key}${colors.reset}`)
            })
        } else {
            console.log(`\n${colors.yellow}ℹ️  No translation keys found in ${specificFile}${colors.reset}`)
        }

        // Show missing keys for this file
        if (missingKeys.length > 0) {
            console.log(`\n${colors.red}❌ Missing translation keys in ${specificFile} (${missingKeys.length}):${colors.reset}`)
            console.log(`${colors.red}${'─'.repeat(40)}${colors.reset}`)
            missingKeys.forEach(key => {
                const locations = usedKeys.get(key)
                console.log(`${colors.red}  • ${key}${colors.reset}`)
                if (locations && locations.length > 0) {
                    locations.forEach(location => {
                        console.log(`${colors.gray}    → line ${location.line}${colors.reset}`)
                    })
                }
            })
        } else if (allUsedKeys.length > 0) {
            console.log(`\n${colors.green}✅ All translation keys in ${specificFile} are properly defined${colors.reset}`)
        }
    } else {
        // Original full analysis output
        // Report unused keys (only if not onlyMissing mode)
        if (!onlyMissing && unusedKeys.length > 0) {
            console.log(`\n${colors.yellow}⚠️  Unused translation keys (${unusedKeys.length}):${colors.reset}`)
            console.log(`${colors.yellow}${'─'.repeat(40)}${colors.reset}`)
            unusedKeys.forEach(key => {
                const location = translationKeys.get(key)
                console.log(`${colors.yellow}  • ${key}${colors.reset} ${colors.gray}(${location.file}:${location.line})${colors.reset}`)
            })
        } else if (!onlyMissing && !quiet) {
            console.log(`\n${colors.green}✓ No unused translation keys found${colors.reset}`)
        }

        // Report missing keys
        if (missingKeys.length > 0) {
            console.log(`\n${colors.red}❌ Missing translation keys (${missingKeys.length}):${colors.reset}`)
            console.log(`${colors.red}${'─'.repeat(40)}${colors.reset}`)
            missingKeys.forEach(key => {
                const locations = usedKeys.get(key)
                console.log(`${colors.red}  • ${key}${colors.reset}`)
                if (locations && locations.length > 0) {
                    locations.forEach(location => {
                        console.log(`${colors.gray}    → ${location.file}:${location.line}${colors.reset}`)
                    })
                }
            })
        } else if (!quiet) {
            console.log(`\n${colors.green}✓ No missing translation keys found${colors.reset}`)
        }
    }

    // Summary
    if (!quiet) {
        console.log(`\n${colors.magenta}📋 Summary:${colors.reset}`)
        console.log(`${colors.magenta}${'─'.repeat(20)}${colors.reset}`)
        if (specificFile) {
            console.log(`${colors.green}  Keys in file: ${allUsedKeys.length}${colors.reset}`)
            console.log(`${colors.green}  Valid keys: ${allUsedKeys.length - missingKeys.length}${colors.reset}`)
            console.log(`${colors.red}  Missing keys: ${missingKeys.length}${colors.reset}`)
        } else {
            console.log(`${colors.green}  Used keys: ${allUsedKeys.length - missingKeys.length}${colors.reset}`)
            if (!onlyMissing) {
                console.log(`${colors.yellow}  Unused keys: ${unusedKeys.length}${colors.reset}`)
            }
            console.log(`${colors.red}  Missing keys: ${missingKeys.length}${colors.reset}`)
        }

        const coverage = allUsedKeys.length > 0 ?
            ((allUsedKeys.length - missingKeys.length) / allUsedKeys.length * 100).toFixed(1) :
            100
        console.log(`${colors.cyan}  Coverage: ${coverage}%${colors.reset}`)
    }

    // Exit with error if there are issues
    if (missingKeys.length > 0) {
        if (!quiet) {
            console.log(`\n${colors.red}❌ Translation check failed due to missing keys${colors.reset}`)
        }
        process.exit(1)
    } else if (!onlyMissing && !specificFile && unusedKeys.length > 0) {
        if (!quiet) {
            console.log(`\n${colors.yellow}⚠️  Translation check completed with unused keys${colors.reset}`)
        }
        process.exit(0) // Don't fail on unused keys, just warn
    } else {
        if (!quiet) {
            const message = specificFile ?
                `✅ Translation check passed for ${specificFile}` :
                `✅ Translation check passed`
            console.log(`\n${colors.green}${message}${colors.reset}`)
        }
        process.exit(0)
    }
}

/**
 * Main function
 */
function main() {
    try {
        const args = process.argv.slice(2)
        const onlyMissing = args.includes('--only-missing') || args.includes('-m')
        const quiet = args.includes('--quiet') || args.includes('-q')

        // Handle file argument
        let specificFile = null
        const fileArgIndex = args.findIndex(arg => arg === '--file' || arg === '-f')
        if (fileArgIndex !== -1 && fileArgIndex + 1 < args.length) {
            specificFile = args[fileArgIndex + 1]
        }

        if (!quiet) {
            console.log(`${colors.cyan}🚀 Translation Keys Checker${colors.reset}`)
            console.log(`${colors.cyan}${'='.repeat(30)}${colors.reset}`)
        }

        generateReport(onlyMissing, quiet, specificFile)
    } catch (error) {
        console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`)
        console.error(error.stack)
        process.exit(1)
    }
}

// Run the script
main()

export {
    extractTranslationKeys,
    extractUsedTranslations,
    generateReport,
    findFiles
}
