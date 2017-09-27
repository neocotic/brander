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

const imageSize = require('image-size');
const util = require('util');

const sizeOf = util.promisify(imageSize);

const _height = Symbol('height');
const _width = Symbol('width');

const rSize = /^\s*(\d+)\s*([xX]\s*(\d+))?\s*$/;

/**
 * Contains size information based on specific dimensions.
 *
 * While it's possible to create an instance using the constructor, it's often necessary to contents read from
 * configuration data or file names, in which cases {@link Size.parse} is recommended instead. Additionally, size
 * information for images can be derived using {@link Size.fromImage}.
 *
 * @public
 */
class Size {

  /**
   * Creates an instance of {@link Size} with the dimensions read from the specified <code>image</code>.
   *
   * <code>image</code> can either be a <code>Buffer</code> containing image data or the path of an image file.
   *
   * @param {Buffer|string} image - the image whose dimensions are to be captured in the returned {@link Size}
   * @return {Promise.<Size, Error>} A <code>Promise</code> for the asynchronous image parsing and file reading that is
   * resolved with the <code>image</code> {@link Size}.
   * @public
   */
  static async fromImage(image) {
    const { height, width } = await sizeOf(image);

    return new Size(width, height);
  }

  /**
   * Parses the specified <code>size</code> value into a {@link Size} instance.
   *
   * <code>size</code> can either be a string representation of {@link Size} or a number representing both width and
   * height dimensions. If <code>size</code> is a string, it can contain either just a single number, which will be used
   * as both width and height dimensions, or two numbers separated by an "x", which will be used as the width and height
   * dimensions repsectively.
   *
   * An error will occur if <code>size</code> is a negative number or <code>NaN</code>, or it's a malformed string, or
   * it's a string or number.
   *
   * @param {number|string} size - the size value to be parsed
   * @return {Size} A {@link Size} parsed from <code>size</code>.
   * @throws {Error} If <code>size</code> is invalid or malformed.
   * @public
   */
  static parse(size) {
    let height;
    let match;
    let width;

    switch (typeof size) {
    case 'number':
      if (Number.isNaN(size) || size < 0) {
        throw new Error(`"sizes" configuration must contain only valid positive numbers: ${size}`);
      }

      width = size;
      height = size;

      break;
    case 'string':
      match = size.match(rSize);
      if (!match) {
        throw new Error(`"sizes" configuration must contain width and optionally height: ${size}`);
      }

      width = parseInt(match[1], 10);
      height = match[3] ? parseInt(match[3], 10) : width;

      break;
    default:
      throw new Error(`"sizes" configuration can only contain numbers and strings: ${size} (${typeof size})`);
    }

    return new Size(width, height);
  }

  /**
   * Returns a string representation of the specified <code>size</code>.
   *
   * <code>null</code> will be returned if <code>size</code> is <code>null</code>.
   *
   * @param {?Size} size - the {@link Size} whose string representation is to be returned (may be <code>null</code>)
   * @return {?string} The string representation of <code>size</code> or <code>null</code> if <code>size</code> is
   * <code>null</code>.
   * @public
   */
  static stringify(size) {
    return size ? size.toString() : null;
  }

  /**
   * Creates an instance of {@link Size} with the <code>width</code> and <code>height</code> provided.
   *
   * {@link Size.parse} is typically used to create instances during the parsing of a {@link Config}.
   *
   * @param {number} width - the width to be used
   * @param {number} height - the height to be used
   * @public
   */
  constructor(width, height) {
    this[_width] = width;
    this[_height] = height;
  }

  /**
   * @override
   */
  toString() {
    return `${this.width}x${this.height}`;
  }

  /**
   * Returns the height of this {@link Size}.
   *
   * @return {number} The height.
   * @public
   */
  get height() {
    return this[_height];
  }

  /**
   * Returns the width of this {@link Size}.
   *
   * @return {number} The width.
   * @public
   */
  get width() {
    return this[_width];
  }

}

module.exports = Size;
