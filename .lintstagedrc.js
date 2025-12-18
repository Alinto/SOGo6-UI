import path from 'path'

const buildEslintCommand = (filenames) =>
    `next lint --fix --file ${filenames
        .map((f) => path.relative(process.cwd(), f))
        .join(' --file ')}`

const buildTestCommands = (filenames) => {
    // Check if any files are at root level (config files, package.json, etc.)
    const rootLevelFiles = filenames.filter((f) => {
        const relativePath = path.relative(process.cwd(), f)
        return !relativePath.includes(path.sep)
    })

    const commands = []

    // Job 1: If root-level files are modified, run full test suite
    if (rootLevelFiles.length > 0) {
        console.log('✓ Root-level files modified. Running full test suite first...')
        commands.push('npm run test:coverage')
    }

    // Job 2: Run related tests for the modified files
    const relatedTestCommand = `npm run test:related -- ${filenames
        .map((f) => path.relative(process.cwd(), f))
        .join(' ')}`

    console.log('✓ Running related tests...')
    commands.push(relatedTestCommand)

    return commands
}

export default {
    '*.{js,jsx,ts,tsx}': [buildEslintCommand, buildTestCommands],
}