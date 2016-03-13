export default function detector (data = {}) {
  return new Promise((resolve, reject) => {
    // HAR 1.2
    if (data.log && data.log.version && data.log.version === '1.2') {
      resolve({
        data: data,
        format: 'HAR',
        version: '1.2'
      })
    }

    // ALF 0.0.1
    if ((!data.version || data.version === '0.0.1') && data.serviceToken && data.har) {
      resolve({
        data: data,
        format: 'ALF',
        version: '0.0.1'
      })
    }

    // ALF 1.0.0
    if (data.version && data.version === '1.0.0' && data.serviceToken && data.har) {
      resolve({
        data: data,
        format: 'ALF',
        version: '1.0.0'
      })
    }

    // ALF 2.0.0
    if (data.version && data.version === '2.0.0' && data.creator && data.entries) {
      reject(new Error('already at latest version'))

      // resolve({
      //   data: data,
      //   format: 'ALF',
      //   version: '2.0.0'
      // })
    }

    reject(new Error('unknown format'))
  })
}
