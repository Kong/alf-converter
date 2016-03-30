import detector from './detector'
import pkg from '../package'

const formats = {
  HAR: {
    '1.2': (data, serviceToken) => {
      return new Promise((resolve) => {
        data.log.entries = data.log.entries.map((entry) => {
          entry.request.content = entry.request.postData
          return entry
        })

        resolve({
          version: '0.0.1',
          serviceToken,
          har: data
        })
      })
    }
  },

  ALF: {
    '0.0.1': (data, serviceToken) => {
      return new Promise((resolve) => {
        data.har.log.entries = data.har.log.entries.map((entry) => {
          if (entry.request.content && !entry.request.postData) {
            entry.request.postData = entry.request.content
          }

          return entry
        })

        resolve({
          version: '1.0.0',
          serviceToken: data.serviceToken || serviceToken,
          har: data.har
        })
      })
    },

    '1.0.0': (data, serviceToken) => {
      return new Promise((resolve) => {
        data.har.log.entries = data.har.log.entries.map((entry, index) => {
          if (data.clientIPAddress) {
            entry.clientIPAddress = data.clientIPAddress
          }

          // request body
          if (entry.request.postData && entry.request.postData.text && entry.request.postData.text.length > 0) {
            let encoding = 'utf8'

            // should this be treted as base64 source?
            if (entry.request.postData.encoding && entry.request.postData.encoding === 'base64') {
              encoding = 'base64'
            }

            // create buffer
            let buffer = new Buffer(entry.response.content.text, encoding)

            // set new values
            entry.request.bodySize = buffer.length // we used to reply on postData.size
            entry.request.postData.encoding = 'base64'
            entry.request.postData.text = buffer.toString('base64')
          }

          // delete entire object if no data is present
          if (entry.request.postData && !entry.request.postData.text) {
            delete entry.request.postData
          }

          // response body
          if (entry.response.content && entry.response.content.text && entry.response.content.text.length > 0) {
            let encoding = 'utf8'

            // should this be treted as base64 source?
            if (entry.response.content.encoding && entry.response.content.encoding === 'base64') {
              encoding = 'base64'
            }

            // create buffer
            let buffer = new Buffer(entry.response.content.text, encoding)

            // set new values
            entry.response.bodySize = buffer.length // we used to reply on content.size
            entry.response.content.encoding = 'base64'
            entry.response.content.text = buffer.toString('base64')
          }

          // delete entire object if no data is present
          if (entry.response.content && !entry.response.content.text) {
            delete entry.response.content
          }

          entry.request.bodyCaptured = Boolean(entry.request.bodySize > 0 || ~~(entry.request.postData && entry.request.postData.text && entry.request.postData.text.length > 0))
          entry.response.bodyCaptured = Boolean(entry.response.bodySize > 0 || ~~(entry.response.content && entry.response.content.text && entry.response.content.text.length > 0))

          entry.request.bodySize = entry.request.bodySize > -1 ? entry.request.bodySize : 0
          entry.response.bodySize = entry.response.bodySize > -1 ? entry.response.bodySize : 0

          entry.request.headersSize = entry.request.headersSize > -1 ? entry.request.headersSize : 0
          entry.response.headersSize = entry.response.headersSize > -1 ? entry.response.headersSize : 0

          return entry
        })

        resolve({
          version: '1.1.0',
          serviceToken: data.serviceToken || serviceToken,
          environment: data.environment || 'default',
          har: {
            log: {
              creator: data.har.log.creator || {
                name: 'har-converter',
                version: pkg.version
              },
              entries: data.har.log.entries
            }
          }
        })
      })
    }

    // ,

    // '1.1.0': (data, serviceToken) => {
    //   return new Promise((resolve) => {
    //     data.har.log.entries = data.har.log.entries.map((entry, index) => {
    //       if (entry.request.postData) {
    //         entry.request.content = entry.request.postData
    //       }

    //       return entry
    //     })

    //     let service = {
    //       token: data.serviceToken || serviceToken
    //     }

    //     if (data.environment) {
    //       service.environment = data.environment
    //     }

    //     resolve({
    //       version: '2.0.0',
    //       service: service,
    //       creator: data.har.log.creator || {
    //         name: 'har-converter',
    //         version: pkg.version
    //       },
    //       entries: data.har.log.entries
    //     })
    //   })
    // }
  }
}

const sequence = {
  HAR: {
    '1.2': {
      format: 'ALF',
      version: '0.0.1'
    }
  },
  ALF: {
    '0.0.1': {
      format: 'ALF',
      version: '1.0.0'
    },
    '1.0.0': {
      format: 'ALF',
      version: '1.1.0'
    }
  }
}

export default function converter (data, options) {
  if (!options) {
    return detector(data).then((opts) => converter(data, Object.assign(options || {}, opts)))
  }

  options.format = options.format.toUpperCase()
  options.version = String(options.version)

  if (formats[options.format] && formats[options.format][options.version]) {
    // what's next?
    let { format, version } = sequence[options.format][options.version]

    // run converstion step
    return formats[options.format][options.version]
      .call(this, data, options.serviceToken)
      .then((data) => converter.call(this, data, { format, version, serviceToken: options.serviceToken }))
  }

  return data
}
