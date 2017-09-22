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

const rSize = /^\s*(\d+)\s*[xX]\s*(\d+)\s*$/;

/**
 * TODO: document
 *
 * @public
 */
class Sizes {

  /**
   * TODO: document
   *
   * @param {string} size -
   * @return {boolean}
   * @public
   */
  static isValid(size) {
    return size && rSize.test(size);
  }

  /**
   * TODO: document
   *
   * @param {string} size -
   * @return {Sizes~Dimensions}
   * @public
   */
  static parse(size) {
    const match = size.match(rSize);
    if (!match) {
      throw new Error(`Unable to read dimensions from size: ${size}`);
    }

    return {
      width: parseInt(match[1], 10),
      height: parseInt(match[2], 10)
    };
  }

  /**
   * TODO: document
   *
   * @param {string} size -
   * @return {string}
   * @public
   */
  static santize(size) {
    return Sizes.stringify(Sizes.parse(size));
  }

  /**
   * TODO: document
   *
   * @param {Sizes~Dimensions} dimensions -
   * @return {string}
   * @public
   */
  static stringify(dimensions) {
    return dimensions ? `${dimensions.width}x${dimensions.height}` : null;
  }

}

module.exports = Sizes;

/**
 * TODO: document
 *
 * @typedef {Object} Sizes~Dimensions
 * @property {number} height -
 * @property {number} width -
 */
