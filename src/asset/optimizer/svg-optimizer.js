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

const fs = require('fs-extra');
const SVGO = require('svgo');

const Formats = require('../formats');
const Optimizer = require('./optimizer');

const _generate = Symbol('generate');
const _svgo = Symbol('svgo');

/**
 * TODO: document
 *
 * @public
 */
class SVGOptimizer extends Optimizer {

  /**
   * TODO: document
   *
   * @public
   */
  constructor() {
    super();

    this[_svgo] = new SVGO();
  }

  /**
   * @inheritdoc
   * @override
   */
  async generate(asset, options) {
    const source = asset.evaluate(options.source);
    const target = options.target ? asset.evaluate(options.target) : Formats.buildCorrespondingFileName(source,
      options.sourceFormat, { suffix: '.min' });
    const input = await fs.readFile(asset.resolve(source), 'utf8');
    const output = await new Promise((resolve, reject) => {
      this[_svgo].optimize(input, (result) => {
        if (result.error) {
          reject(result.error);
        } else {
          resolve(result.data);
        }
      });
    });

    await fs.writeFile(asset.resolve(target), output);
  }

  /**
   * @inheritdoc
   * @override
   */
  supports(options) {
    return options.sourceFormat === 'svg';
  }

}

Optimizer.register(new SVGOptimizer());

module.exports = SVGOptimizer;
