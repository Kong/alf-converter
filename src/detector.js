export default function detector (data = {}) {
  return new Promise((resolve, reject) => {
    // ALF 2.0.0
    if (data.creator && data.entries && !data.har && !data.serviceToken && !data.har) {
      resolve({
        data: data,
        format: 'ALF',
        version: '2.0.0'
      })
    }

    // ALF 1.1.0
    if (data.har && data.version && data.serviceToken && data.har && (data.har.log.entries[0].clientIPAddress || data.har.log.entries[0].request.bodyCaptured)) {
      resolve({
        data: data,
        format: 'ALF',
        version: '1.1.0'
      })
    }

    // ALF 1.0.0
    if (data.har && data.version && data.serviceToken && data.har) {
      resolve({
        data: data,
        format: 'ALF',
        version: '1.0.0'
      })
    }

    // ALF 0.0.1
    if (data.har && !data.version && data.serviceToken && data.har) {
      resolve({
        data: data,
        format: 'ALF',
        version: '0.0.1'
      })
    }

    // HAR 1.2
    if (!data.har && data.log && data.log.version && data.log.version === '1.2') {
      resolve({
        data: data,
        format: 'HAR',
        version: '1.2'
      })
    }

    reject(new Error('unknown format'))
  })
}
