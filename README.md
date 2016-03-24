# alf-converter [![version][npm-version]][npm-url] [![License][npm-license]][license-url]

> unnamed package

[![Build Status][travis-image]][travis-url]
[![Downloads][npm-downloads]][npm-url]
[![Code Climate][codeclimate-quality]][codeclimate-url]
[![Coverage Status][codeclimate-coverage]][codeclimate-url]
[![Dependencies][david-image]][david-url]

## Install

```bash
npm install --save alf-converter
```

## Usage

```

  Usage: bin [options] <files...>

  Options:

    -h, --help               output usage information
    -V, --version            output the version number
    -f, --format <format>    source file format (default, auto-detect)
    -v, --version <version>  source file format version (default, auto-detect)
    -o, --output <file>      Write output to <file> instead of stdout

```

## API

###### Import

```js
// default, ES5 (pre-compiled)
import converter from 'alf-converter/lib/converter'
import detector from 'alf-converter/lib/detector'

// ES2015 (srouce)
import converter from 'alf-converter/src/converter'
import detector from 'alf-converter/src/detector'
```

###### Require

```js
// default, ES5 (pre-compiled)
var converter = require('alf-converter/lib/converter')
var detector = require('alf-converter/lib/detector')
```

### converter(data [, options])

> Returns a Promise

- **data**: `Object` *(Required)*
  a single [HAR][har-spec] or [ALF][alf-spec] object

- **options**:
  - **format**: `String`
    one of `"ALF"` or `"HAR"`.

  - **version**: `String`
    [HAR][har-spec] or [ALF][alf-spec] schema version number

  - **serviceToken**: `Boolea
    optional `serviceToken` value to provide in final output if missing from input.

```js
const options = {
  format: 'HAR',
  version: '1.2',
  serviceToken: 'token-foo'
}

converter(data, options)
  .then(console.log)
  .catch(console.error)
```

> - the promise resolves with an object representing the latest [ALF version][alf-spec]
> - If `options` not provided, automatic detection of source object will be triggered using `detector` Promise below

### detector(data)

> Returns a Promise

- **data**: `Object` *(Required)*
  a single [HAR][har-spec] or [ALF][alf-spec] object

```js
detector(data)
  .then(console.log)
  .catch(console.error)
```

> - the promise resolves with an object with the following properties

- **data**: `Object`
  same as the `data` passed to the promise

- **format**: `String`
  one of `"ALF"` or `"HAR"`.

- **version**: `String`
  [HAR][har-spec] or [ALF][alf-spec] schema version number

----
> :copyright: [www.mashape.com](https://www.mashape.com/) &nbsp;&middot;&nbsp;
> License: [ISC](LICENSE) &nbsp;&middot;&nbsp;
> Github: [@mashape](https://github.com/mashape) &nbsp;&middot;&nbsp;
> Twitter: [@mashape](https://twitter.com/mashape)

[license-url]: http://choosealicense.com/licenses/isc/

[travis-url]: https://travis-ci.org/Mashape/alf-converter
[travis-image]: https://img.shields.io/travis/Mashape/alf-converter.svg?style=flat-square

[npm-url]: https://www.npmjs.com/package/alf-converter
[npm-license]: https://img.shields.io/npm/l/alf-converter.svg?style=flat-square
[npm-version]: https://img.shields.io/npm/v/alf-converter.svg?style=flat-square
[npm-downloads]: https://img.shields.io/npm/dm/alf-converter.svg?style=flat-square

[codeclimate-url]: https://codeclimate.com/github/Mashape/alf-converter
[codeclimate-quality]: https://img.shields.io/codeclimate/github/Mashape/alf-converter.svg?style=flat-square
[codeclimate-coverage]: https://img.shields.io/codeclimate/coverage/github/Mashape/alf-converter.svg?style=flat-square

[david-url]: https://david-dm.org/Mashape/alf-converter
[david-image]: https://img.shields.io/david/Mashape/alf-converter.svg?style=flat-square

[har-spec]: https://github.com/ahmadnassri/har-spec "HAR Spec"
[alf-spec]: https://github.com/Mashape/api-log-format "ALF Spec"
