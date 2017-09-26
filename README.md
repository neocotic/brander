    888888b.                                 888
    888  "88b                                888
    888  .88P                                888
    8888888K.  888d888 8888b.  88888b.   .d88888  .d88b.  888d888
    888  "Y88b 888P"      "88b 888 "88b d88" 888 d8P  Y8b 888P"
    888    888 888    .d888888 888  888 888  888 88888888 888
    888   d88P 888    888  888 888  888 Y88b 888 Y8b.     888
    8888888P"  888    "Y888888 888  888  "Y88888  "Y8888  888

[Brander](https://github.com/NotNinja/brander) is a tool for generating branding assets for your project or
organisation.

[![Build Status](https://img.shields.io/travis/NotNinja/brander/develop.svg?style=flat-square)](https://travis-ci.org/NotNinja/brander)
[![Dependency Status](https://img.shields.io/david/NotNinja/brander.svg?style=flat-square)](https://david-dm.org/NotNinja/brander)
[![Dev Dependency Status](https://img.shields.io/david/dev/NotNinja/brander.svg?style=flat-square)](https://david-dm.org/NotNinja/brander?type=dev)
[![License](https://img.shields.io/npm/l/brander.svg?style=flat-square)](https://github.com/NotNinja/brander/blob/master/LICENSE.md)
[![Release](https://img.shields.io/npm/v/brander.svg?style=flat-square)](https://www.npmjs.com/package/brander)

* [Install](#install)
* [Configuration](#configuration)
* [API](#api)
* [Bugs](#bugs)
* [Contributors](#contributors)
* [License](#license)

## Install

Install using [npm](https://www.npmjs.com):

``` bash
$ npm install --save brander
```

You'll need to have at least [Node.js](https://nodejs.org) 8 or newer.

## Configuration

TODO: Complete

``` json
{
  "name": "my-brand",
  "title": "My Brand",
  "tasks": [
    {
      "task": "clean",
      "input": {
        "files": [
          "logo/**/*.png",
          "logo/**/*.min.svg"
        ]
      }
    },
    {
      "task": "convert",
      "input": {
        "dir": "", // Optional: defaults to Config#options.assets.dir, is resolved relative to same directory
        "files": "logo/**/my-brand-logo*.svg",
        "format": "svg" // Optional: derived per input.files
      },
      "output": {
        "dir": "<%= file.dir %>", // Optional: defaults to corresponding input file dir
        "files": "<%= file.base(true) %>-<%= size %>.png", // Optional: if format is provided (uses default provided by task)
        "format": "png" // Optional: derived from output.files if provided
      },
      "options": { // Optional
        "sizes": [ // Optional: derived
          16,
          "32",
          "64x64",
          "72x72",
          "96x96",
          "120x120",
          "144x144",
          "168x168",
          "256x256",
          "512x512"
        ]
      }
    },
    {
      "task": "convert",
      "input": {
        "files": [
          "logo/**/my-brand-logo*-16x16.png",
          "logo/**/my-brand-logo*-24x24.png",
          "logo/**/my-brand-logo*-32x32.png",
          "logo/**/my-brand-logo*-48x48.png",
          "logo/**/my-brand-logo*-64x64.png",
          "logo/**/my-brand-logo*-128x128.png",
          "logo/**/my-brand-logo*-256x256.png"
        ],
        "format": "png" // Optional: derived per input.files
      },
      "output": {
        "files": "<%= file.base(true) %>.ico",
        "format": "ico" // Optional: derived from output.files if provided
      },
      "options": {
        "groupBy": "<%= file.dir %>",
        "sizes": [ // Optional
          16,
          24,
          32,
          48,
          64,
          128,
          256
        ]
      }
    },
    {
      "task": "optimize",
      "input": {
        "files": "logo/**/*.svg",
        "format": "svg" // Optional: derived per input.files
      },
      "output": { // Optional
        "files": "<%= file.base(true) %>.min.svg" // Optional: default provided by task
      }
    }
  ],
  "docs": {
    ...
  },
  "options": {
    "assets": {
      "dir": "..." // defaults to "assets"
    },
    "docs": {
      "dir": "..." // defaults to "docs"
    }
    ...
  }
}
```

## API

TODO: Complete

## Bugs

If you have any problems with Brander or would like to see changes currently in development you can do so
[here](https://github.com/NotNinja/brander/issues).

## Contributors

If you want to contribute, you're a legend! Information on how you can do so can be found in
[CONTRIBUTING.md](https://github.com/NotNinja/brander/blob/master/CONTRIBUTING.md). We want your suggestions and pull
requests!

A list of Brander contributors can be found in [AUTHORS.md](https://github.com/NotNinja/brander/blob/master/AUTHORS.md).

## License

See [LICENSE.md](https://github.com/NotNinja/brander/raw/master/LICENSE.md) for more information on our MIT license.

[![Copyright !ninja](https://cdn.rawgit.com/NotNinja/branding/master/assets/copyright/base/not-ninja-copyright-186x25.png)](https://not.ninja)
