import converter from '../src/converter'
import tap from 'tap'
import validator from 'alf-validator'
import { har, alf } from './fixtures/'

const options = {
  format: 'har',
  version: 1.2,
  serviceToken: 'token-foo'
}

tap.test('converter', (assert) => {
  assert.plan(3)

  return Promise.all([
    converter(har, options)
      .then((alf) => validator(alf, '1.1.0', true))
      .then((alf) => {
        // add missing data
        alf.environment = 'PRODUCTION'
        alf.har.log.entries[0].serverIPAddress = '10.10.10.10'
        alf.har.log.entries[0].clientIPAddress = '10.10.10.20'

        return alf
      })
      .then((out) => assert.same(out, alf['1.1.0'], 'should convert HAR v1.2 successfully')),

    converter(alf['0.0.1'])
      .then((alf) => validator(alf, '1.1.0', true))
      .then((alf) => {
        // add missing data
        alf.environment = 'PRODUCTION'

        return alf
      })
      .then((out) => assert.same(out, alf['1.1.0'], 'should convert ALF v0.0.1 successfully')),

    converter(alf['1.0.0'])
      .then((alf) => validator(alf, '1.1.0', true))
      .then((out) => assert.same(out, alf['1.1.0'], 'should convert ALF v1.0.0 successfully'))
  ])
})
