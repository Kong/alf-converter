import converter from '../src/converter'
import tap from 'tap'
import validate from 'alf-validator'
import { har, alf } from './fixtures/'
import { readFileSync } from 'fs'
import { join } from 'path'

const options = {
  format: 'har',
  version: 1.2,
  serviceToken: 'token-foo'
}

tap.test('converter', (assert) => {
  assert.plan(6)

  let image = readFileSync(join(__dirname, 'fixtures', 'mashape-logo.png'))

  return Promise.all([
    Promise.resolve(converter(har, options))
      .then((alf) => validate(alf, '1.1.0', true))
      .then((alf) => {
        // add missing data
        alf.environment = 'PRODUCTION'
        alf.har.log.entries[0].serverIPAddress = '10.10.10.10'
        alf.har.log.entries[0].clientIPAddress = '10.10.10.20'

        return alf
      })
      .then((out) => assert.same(out, alf['1.1.0'], 'should convert HAR v1.2 successfully')),

    Promise.resolve(converter(alf['0.0.1']))
      .then((alf) => validate(alf, '1.1.0', true))
      .then((alf) => {
        // add missing data
        alf.environment = 'PRODUCTION'

        return alf
      })
      .then((result) => validate(result, 'latest', true))
      .then((out) => assert.same(out, alf['1.1.0'], 'should convert ALF v0.0.1 successfully')),

    Promise.resolve(converter(alf['1.0.0']))
      .then((alf) => validate(alf, '1.1.0', true))
      .then((out) => assert.same(out, alf['1.1.0'], 'should convert ALF v1.0.0 successfully')),

    Promise.resolve(converter(alf['1.0.0-binary']))
      .then((alf) => validate(alf, '1.1.0', true))
      .then((out) => {
        var binary = new Buffer(out.har.log.entries[0].request.postData.text, 'base64')

        assert.same(out, alf['1.1.0-binary'], 'should convert ALF v1.0.0 with binary data successfully')
        assert.same(binary, image, 'should manage binary data appropriately')
      }),

    Promise.resolve(converter(alf['1.0.0-without-bodies']))
      .then((alf) => validate(alf, '1.1.0', true))
      .then((out) => assert.same(out, alf['1.1.0-without-bodies'], 'should convert ALF v1.0.0 without body data successfully'))
  ])
})
