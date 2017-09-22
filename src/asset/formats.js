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
const path = require('path');

/**
 * TODO: document
 *
 * @public
 */
class Formats {

  /**
   * TODO: document
   *
   * @param {string} fileName -
   * @param {string} format -
   * @param {Formats~BuildCorrespondingFileNameOptions} [options] -
   * @return {string}
   * @public
   */
  static buildCorrespondingFileName(fileName, format, options) {
    options = Object.assign({ prefix: '', suffix: '' }, options);
    fileName = path.basename(fileName, path.extname(fileName));

    return `${options.prefix}${fileName}${options.suffix}.${format}`;
  }

  /**
   * TODO: document
   *
   * @param {string} fileName -
   * @return {?string}
   * @public
   */
  static deriveFromFileName(fileName) {
    return Formats.sanitize(path.extname(fileName).substring(1));
  }

  /**
   * TODO: document
   *
   * @param {string} format -
   * @return {string}
   * @public
   */
  static sanitize(format) {
    format = _.trim(format);

    return format ? format.toLowerCase() : null;
  }

}

module.exports = Formats;

/**
 * TODO: document
 *
 * @typedef {Object} Formats~BuildCorrespondingFileNameOptions
 * @property {string} [prefix] -
 * @property {string} [suffix] -
 */
