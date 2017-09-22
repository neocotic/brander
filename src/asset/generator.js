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

const pollock = require('pollock');
const util = require('util');

/**
 * TODO: document
 *
 * @public
 */
class Generator {

  /**
   * TODO: document
   *
   * @param {Generator~Options} options -
   * @return {Generator}
   * @throws {Error}
   * @public
   */
  static getInstance(options) {
    for (const instance of this.getInstances()) {
      if (instance.supports(options)) {
        return instance;
      }
    }

    throw new Error(`Unable to find generator for options: ${util.inspect(options)}`);
  }

  /**
   * TODO: document
   *
   * @param {Generator} instance -
   * @return {void}
   * @public
   */
  static register(instance) {
    if (instance) {
      this.getInstances().add(instance);
    }
  }

}

/**
 * TODO: document
 *
 * @return {Set.<Generator>}
 * @protected
 * @abstract
 * @memberof Generator
 * @method getInstances
 */
pollock(Generator, 'getInstances');

/**
 * TODO: document
 *
 * @param {Asset} asset -
 * @param {Generator~Options} options -
 * @return {Promise.<Error>}
 * @public
 * @abstract
 * @memberof Generator#
 * @method generate
 */
pollock(Generator, 'generate', { promise: true });

/**
 * TODO: document
 *
 * @param {Generator~Options} options -
 * @return {boolean}
 * @public
 * @abstract
 * @memberof Generator#
 * @method supports
 */
pollock(Generator, 'supports');

module.exports = Generator;

/**
 * TODO: document
 *
 * @typedef {Object} Generator~Options
 * @property {string|string[]} source -
 * @property {string} sourceFormat -
 * @property {?string} target -
 * @property {?string} targetFormat -
 * @property {?string[]} sizes -
 */
