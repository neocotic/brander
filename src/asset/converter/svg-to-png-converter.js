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
const svg2png = require('svg2png');

const Converter = require('./converter');
const Formats = require('../formats');
const Sizes = require('../sizes');

const _generate = Symbol('generate');

/**
 * TODO: document
 *
 * @public
 */
class SVGToPNGConverter extends Converter {

  /**
   * @inheritdoc
   * @override
   */
  async generate(asset, options) {
    const { sizes } = options;
    let { source } = options;

    if (Array.isArray(source)) {
      throw new Error('source cannot be an array');
    }

    source = asset.evaluate(source);
    options = Object.assign(_.cloneDeep(options), { source });

    const input = await fs.readFile(asset.resolve(source));

    if (_.isEmpty(sizes)) {
      await this[_generate](asset, options, input);
    } else {
      for (const size of sizes) {
        await this[_generate](asset, options, input, size);
      }
    }
  }

  /**
   * @inheritdoc
   * @override
   */
  supports(options) {
    return options.sourceFormat === 'svg' && options.targetFormat === 'png';
  }

  async [_generate](asset, options, input, size) {
    const dimensions = Sizes.stringify(size);
    const target = options.target ? asset.evaluate(options.target, { size: dimensions })
      : Formats.buildCorrespondingFileName(options.source, options.targetFormat, { suffix: dimensions });
    const output = await svg2png(input, Object.assign({}, size));

    await fs.writeFile(asset.resolve(target), output);
  }

}

Converter.register(new SVGToPNGConverter());

module.exports = SVGToPNGConverter;
