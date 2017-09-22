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
  "title": "My Brand", // Optional: defaults to name
  "categories": { // Optional
    "logo": "Logo"
  },
  "assets": {
    "logo-base": {
      "title": "Base", // Optional: defaults to name
      "category": "logo", // Optional
      "path": "<%= asset.category.name %>/<%= asset.name %>", // Optional: defaults to name
      "convert": [
        {
          "source": "my-brand-logo.svg",
          "sourceFormat": "svg", // Optional: derived
          "target": "my-brand-logo-<%= size %>.png", // Optional (if targetFormat is provided): derived
          "targetFormat": "png", // Optional (if target is provided): derived
          "sizes": [ // Optional: derived
            "16x16",
            "32x32",
            "64x64",
            "72x72",
            "96x96",
            "120x120",
            "144x144",
            "168x168",
            "256x256",
            "512x512"
          ]
          ...
        },
        {
          "source": "my-brand-logo-256x256.png", // Can be array of source files (must match sizes)
          "sourceFormat": "png",
          "target": "my-brand-logo.ico",
          "targetFormat": "ico",
          "sizes": [ // Optional
            "16x16",
            "24x24",
            "32x32",
            "48x48",
            "64x64",
            "128x128",
            "256x256"
          ]
        }
      ],
      "optimize": [
        {
          "source": "my-brand-logo.svg",
          "sourceFormat": "svg", // Optional: derived
          "target": "my-brand-logo.min.svg" // Optional: derived
        }
      ]
    },
    ...
  },
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
