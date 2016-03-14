import { har, alf } from './fixtures/'
import detector from '../src/detector'
import tap from 'tap'

tap.test('detector', (assert) => {
  assert.plan(4)

  return Promise.all([
    detector(har)
      .then((result) => assert.same(result, { data: har, format: 'HAR', version: '1.2' }, 'should detect HAR v1.2 successfully')),

    detector(alf['0.0.1'])
      .then((result) => assert.same(result, { data: alf['0.0.1'], format: 'ALF', version: '0.0.1' }, 'should detect ALF v0.0.1 successfully')),

    detector(alf['1.0.0'])
      .then((result) => assert.same(result, { data: alf['1.0.0'], format: 'ALF', version: '1.0.0' }, 'should detect ALF v1.0.0 successfully')),

    detector(alf['1.1.0'])
      .then((result) => assert.same(result, { data: alf['1.1.0'], format: 'ALF', version: '1.1.0' }, 'should detect ALF v1.1.0 successfully')),

    detector(alf['2.0.0'])
      .catch((error) => assert.same(error, new Error('already at latest version'), 'should detect ALF v2.0.0 successfully'))
  ])
})
