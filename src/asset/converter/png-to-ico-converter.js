/*
 * Copyright (C) 2017 Alasdair Mercer, !ninja
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';

// TODO: complete

const _ = require('lodash');
const fs = require('fs-extra');
const toIco = require('to-ico');

const Converter = require('./converter');
const Formats = require('../formats');

const _readSources = Symbol('readSources');

const defaultSizes = [ 16, 24, 32, 48, 64, 128, 256 ];

/**
 * TODO: document
 *
 * @public
 */
class PNGToICOConverter extends Converter {

  /**
   * @inheritdoc
   * @override
   */
  async generate(asset, options) {
    const { source } = options;
    const sizes = _.isEmpty(options.sizes) ? defaultSizes : _.map(options.sizes, 'width');
    const resize = typeof source === 'string';

    if (Array.isArray(source) && source.length !== sizes.length) {
      throw new Error(`source[${source.length}] must contain same number as sizes[${sizes.length}]`);
    }

    const target = options.target ? asset.evaluate(options.target)
      : Formats.buildCorrespondingFileName(_.castArray(source)[0], options.targetFormat);
    const input = await this[_readSources](asset, options);
    const output = await toIco(input, { sizes, resize });

    await fs.writeFile(asset.resolve(target), output);
  }

  /**
   * @inheritdoc
   * @override
   */
  supports(options) {
    return options.sourceFormat === 'png' && options.targetFormat === 'ico';
  }

  async [_readSources](asset, options) {
    const inputs = [];
    const sources = _.castArray(options.source);

    for (let source of sources) {
      source = asset.evaluate(source);

      const input = await fs.readFile(asset.resolve(source));
      inputs.push(input);
    }

    return inputs;
  }

}

Converter.register(new PNGToICOConverter());

module.exports = PNGToICOConverter;
