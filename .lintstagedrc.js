import fs from 'fs'
import path from 'path'

const buildEslintCommand = (filenames) => {
  const lintable = filenames.filter((f) => {
    const rel = path.relative(process.cwd(), f)
    return !rel.includes('__tests__') && !rel.includes('.test.')
  })
  if (lintable.length === 0) {
    return 'true'
  }
  return `next lint --fix --file ${lintable
    .map((f) => path.relative(process.cwd(), f))
    .join(' --file ')}`
}

const getTestFilePath = (filePath) => {
  const parsedPath = path.parse(filePath)
  const dir = parsedPath.dir
  const name = parsedPath.name
  const ext = parsedPath.ext

  // Look for test file in __tests__ directory
  const testPath = path.join(dir, '__tests__', `${name}.test${ext}`)
  return testPath
}

const shouldHaveTest = (filePath) => {
  const relativePath = path.relative(process.cwd(), filePath)

  // Skip test files themselves
  if (relativePath.includes('__tests__') || relativePath.includes('.test.')) {
    return false
  }

  // Skip config files and certain directories
  const skipPatterns = [
    'config/',
    'public/',
    'coverage/',
    '.next/',
    'node_modules/',
    'src/app/env/',
    'src/app/fakeApi/',
  ]
  if (skipPatterns.some((pattern) => relativePath.startsWith(pattern))) {
    return false
  }

  // Require tests for source files in src/
  return relativePath.startsWith('src/')
}

const buildTestCommands = (filenames) => {
  // Check if test files exist for modified source files
  const missingTests = []

  for (const file of filenames) {
    if (shouldHaveTest(file)) {
      const testPath = getTestFilePath(file)
      if (!fs.existsSync(testPath)) {
        missingTests.push({
          source: path.relative(process.cwd(), file),
          test: path.relative(process.cwd(), testPath),
        })
      }
    }
  }

  // Trigger error if tests are missing
  if (missingTests.length > 0) {
    const missingList = missingTests
      .map((m) => `  ${m.source} (expected test: ${m.test})`)
      .join('\n')
    throw new Error(
      `\n❌ Missing test files for:\n${missingList}\n\nPlease add test files before committing.`
    )
  }

  const srcFiles = filenames.filter((f) => {
    const relativePath = path.relative(process.cwd(), f)
    return relativePath.startsWith('src/') && shouldHaveTest(f)
  })

  if (srcFiles.length === 0) {
    return []
  }

  const relatedTestCommand = `npm run test:related -- ${srcFiles
    .map((f) => path.relative(process.cwd(), f))
    .join(' ')}`

  console.log('✓ Running related tests for src/ files...')
  return [relatedTestCommand]
}

export default {
  '*.{js,jsx,ts,tsx}': [buildEslintCommand, buildTestCommands],
}
