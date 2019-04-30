#!/usr/bin/env node

const ankiToJson = require('../lib')
const chalk = require('chalk')

const processLength = process.argv.length

if (processLength < 2 || process.argv[1] === '-h' || process.argv[1] === '--help') return prettyPrint()

const inputFile = process.argv[1]
let outputDir = null
if (processLength >= 3) outputDir = process.argv[2]

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
