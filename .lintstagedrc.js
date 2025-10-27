import path from 'path'

const buildEslintCommand = (filenames) =>
    `next lint --fix --file ${filenames
        .map((f) => path.relative(process.cwd(), f))
        .join(' --file ')}`

const buildTestCommand = (filenames) =>
    `npm run test:related -- ${filenames
        .map((f) => path.relative(process.cwd(), f))
        .join(' ')} --passWithNoTests`

export default {
    '*.{js,jsx,ts,tsx}': [buildEslintCommand, buildTestCommand],
}