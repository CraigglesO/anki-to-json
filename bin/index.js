#!/usr/bin/env node

const ankiToJson = require('../lib').default
const chalk = require('chalk')

const processLength = process.argv.length

if (processLength < 3 || process.argv[2] === '-h' || process.argv[2] === '--help') return prettyPrint()

const inputFile = process.argv[2]
let outputDir = null
if (processLength >= 4) outputDir = process.argv[3]

ankiToJson(inputFile, outputDir)

function prettyPrint () {
  console.log(chalk.blue(`
Missing input variable.

Command:
ankiToJson inputFile outputDir

inputFile: Required. Pointing to the apkg file to decode
outputDir: Optional. Where you would like to save the resultant folder.
  `))
}
