#!/usr/bin/env node

import cmd from 'commander'
import pkg from '../package'
import fs from 'fs'
import path from 'path'
import converter from './converter'
import detector from './detector'
import chalk from 'chalk'

cmd
  .version(pkg.version)
  .usage('[options] <files...>')
  .option('-f, --format <format>', 'source file format (default, auto-detect)')
  .option('-v, --version <version>', 'source file format version (default, auto-detect)')
  .option('-o, --output <file>', 'Write output to <file> instead of stdout')
  .parse(process.argv)

if (!cmd.args.length) {
  cmd.help()
}

cmd.args.map((fileName) => {
  let file = chalk.yellow.italic(path.basename(fileName))

  new Promise((resolve, reject) => {
    fs.readFile(fileName, (err, data) => err === null ? resolve(data) : reject(err))
  })

  .then(JSON.parse)
  .then((data) => detector(data, cmd.format, cmd.version))
  .then((result) => {
    console.log('%s [%s] is %s version: %s', chalk.green('✔️'), file, chalk.cyan(result.format), chalk.magenta(result.version))

    return result
  })
  .then((result) => converter(result.data, result.format, result.version, 'foo'))
  .then((output) => {
    if (!cmd.output) {
      return console.log(output)
    }

    return new Promise((resolve, reject) => {
      fs.writeFile(cmd.output, JSON.stringify(output, ' ', 2), (err, data) => err === null ? resolve(data) : reject(err))
    })

    .then(() => console.log('%s [%s] converted successfully', chalk.green('✔️'), file))
  })

  .catch((err) => console.error('%s [%s] %s', chalk.red('✖'), file, chalk.red(err.message), chalk.magenta(err.stack)))
})
