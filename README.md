# anki-to-json [![travis][travis-image]][travis-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

[travis-image]: https://travis-ci.org/CraigglesO/anki-to-json.svg?branch=master
[travis-url]: https://travis-ci.org/CraigglesO/anki-to-json
[npm-image]: https://img.shields.io/npm/v/anki-to-json.svg
[npm-url]: https://npmjs.org/package/anki-to-json
[downloads-image]: https://img.shields.io/npm/dm/anki-to-json.svg
[downloads-url]: https://www.npmjs.com/package/anki-to-json

## About

[Anki](https://apps.ankiweb.net/) decks are great, but what if you want to use another system, or you just want access to the data with proper links to the images and audio.

This module will extract all Anki deck data for you into a folder. Front and back data will be put into a JSON with links to audio and images. Assuming media exists, it will be placed into a media subfolder.


# How to install
```sh
# NPM
npm install --save anki-to-json
# Yarn
yarn add anki-to-json

# GLOBAL

# NPM
npm install -g anki-to-json
# YARN
yarn global add anki-to-json
```

# How to use

## Bin
```sh
ankiToJson jp_core_2000_1.apkg
```

## NodeJS
```js
// ES6
import ankiToJson from 'anki-to-json'
// ES5
const ankiToJson = require('anki-to-json').default

ankiToJson(inputFile, outputDir)
```

---

## ISC License (ISC)

Copyright 2019 <CraigglesO>
Copyright (c) 2004-2010 by Internet Systems Consortium, Inc. ("ISC")
Copyright (c) 1995-2003 by Internet Software Consortium

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
