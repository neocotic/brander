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
const convert = require('color-convert');

const _format = Symbol('format');
const _name = Symbol('name');
const _value = Symbol('value');

/**
 * TODO: document
 *
 * @public
 */
class Color {

  /**
   * TODO: document
   *
   * @param {Color~Options} options -
   * @public
   */
  constructor(options) {
    this[_format] = _.trim(options.format).toLowerCase() || null;
    this[_name] = _.trim(options.name) || null;
    this[_value] = options.value != null ? _.castArray(options.value) : [];
  }

  /**
   * TODO: document
   *
   * @return {string}
   * @public
   */
  get format() {
    return this[_format];
  }

  /**
   * TODO: document
   *
   * @return {?string}
   * @public
   */
  get name() {
    return this[_name];
  }

  /**
   * TODO: document
   *
   * @return {number[]|string}
   * @public
   */
  get value() {
    return this[_value];
  }

}

Object.keys(convert).forEach((format) => {
  Object.defineProperty(Color.prototype, format, {
    configurable: true,
    enumerable: true,
    get() {
      if (!convert[this.format]) {
        throw new Error(`Unsupported color format: ${this.format}`);
      }
      if (typeof convert[this.format][format] !== 'function') {
        throw new Error(`Unsupported color format: ${format}`);
      }

      return convert[this.format][format](...this.value);
    }
  });
});

module.exports = Color;

/**
 * TODO: document
 *
 * @typedef {Object} Color~Options
 * @property {string} format -
 * @property {string} [name] -
 * @property {number[]|string} value -
 */
