#!/usr/bin/env node

import converter from './converter'
import detector from './detector'
import furmat from 'furmat'
import validate from 'alf-validator'
import ALFError from 'alf-validator/lib/error'
import yargs from 'yargs'
import { buffer as stdin } from 'get-stdin'
import { read, write, parse } from './utils'

const format = furmat()
const options = {
  format: {
    alias: 'f',
    demand: false,
    describe: 'source file format'
  },

  version: {
    alias: 'v',
    demand: false,
    describe: 'source file schema version'
  },

  output: {
    alias: 'o',
    demand: false,
    describe: 'write output to <file>',
    type: 'string'
  },

  token: {
    alias: 't',
    demand: false,
    describe: 'use <token> for missing service.token',
    type: 'string'
  },

  help: {
    alias: 'h'
  }
}

stdin().then((stdin) => {
  let argv = yargs
    .demand(stdin.length ? 0 : 1)
    .usage('Usage: $0 <file...> [options]')
    .help('help')
    .options(options)
    .argv

  // add stdin to list of files
  if (stdin.length) {
    argv._.push(stdin)
  }

  argv._.forEach((file) => {
    read(file)
      .then(parse)
      .then((file) => {
        return detector(file.content, argv.format, argv.version)
          .then((result) => {
            console.log(format('%s:green [%s:yellow:italic] is %s:cyan version: %s:magenta', '✔️', file.name, result.format, result.version))

            if (argv.token) result.serviceToken = argv.token

            return result
          })

          .then((result) => converter(result.data, result))
          // strip additional properties
          .then((result) => validate(result, 'latest', true))
          .then((result) => {
            let output = JSON.stringify(result, null, 2)

            if (!argv.output) {
              return console.log(output)
            }

            return write(argv.output, output).then(() => console.log(format('%s:green [%s:yellow:italic] converted successfully to latest ALF at %s:magenta', '✔️', file.name, argv.output)))
          })

          .catch((err) => {
            if (err instanceof ALFError) {
              return err.errors.forEach((details) => console.error(format('%s:red [%s:yellow:italic] failed validation: %s:red (%s:cyan:italic: %s:magenta:italic)', '✖', file.name, details.message, details.field, details.value)))
            }
          })
      })

      .catch((err) => {
        if (err.code === 'ENOENT') {
          return console.error(format('%s:red [%s:yellow:italic] %s:red', '✖', err.file, 'no such file or directory'))
        }

        if (err instanceof SyntaxError) {
          return console.error(format('%s:red [%s:yellow:italic] failed to read JSON: %s:red', '✖', err.file, err.message))
        }

        console.error(format('%s:red an unknown error has occured: %s:red', '✖', err.message))
      })
  })
})
