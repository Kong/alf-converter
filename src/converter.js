import pkg from '../package'
import detector from './detector'

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
            // if already encoded
            if (entry.request.postData.encoding && entry.request.postData.encoding === 'base64') {
              entry.request.postData.text = new Buffer(entry.request.postData.text, 'base64').toString()
            }

            // set bodySize
            entry.request.bodySize = entry.request.postData.text.length

            // convert to new standard
            entry.request.content = {
              text: new Buffer(entry.request.postData.text).toString('base64'),
              encoding: 'base64'
            }
          }

          if (entry.request.content && !entry.request.content.text) {
            delete entry.request.content
          }

          // response body
          if (entry.response.content && entry.response.content.text && entry.response.content.text.length > 0) {
            // if already encoded
            if (entry.response.content.encoding && entry.response.content.encoding === 'base64') {
              entry.response.content.text = new Buffer(entry.response.content.text, 'base64').toString()
            }

            // set bodySize
            entry.response.bodySize = entry.response.content.text.length

            // convert to new standard
            entry.response.content = {
              text: new Buffer(entry.response.content.text).toString('base64'),
              encoding: 'base64'
            }
          }

          if (entry.response.content && !entry.response.content.text) {
            delete entry.response.content
          }

          entry.request.bodyCaptured = Boolean(entry.request.bodySize > 0 || ~~(entry.request.content && entry.request.content.text && entry.request.content.text.length > 0))
          entry.response.bodyCaptured = Boolean(entry.response.bodySize > 0 || ~~(entry.response.content && entry.response.content.text && entry.response.content.text.length > 0))

          entry.request.bodySize = entry.request.bodySize > -1 ? entry.request.bodySize : 0
          entry.response.bodySize = entry.response.bodySize > -1 ? entry.response.bodySize : 0

          entry.request.headersSize = entry.request.headersSize > -1 ? entry.request.headersSize : 0
          entry.response.headersSize = entry.response.headersSize > -1 ? entry.response.headersSize : 0

          return entry
        })

        let service = {
          token: data.serviceToken || serviceToken
        }

        if (data.environment) {
          service.environment = data.environment
        }

        resolve({
          version: '2.0.0',
          service: service,
          creator: data.har.log.creator || {
            name: 'har-converter',
            version: pkg.version
          },
          entries: data.har.log.entries
        })
      })
    }
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
      version: '2.0.0'
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