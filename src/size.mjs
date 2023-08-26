/*
 * Copyright (C) 2023 neocotic
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

/* istanbul ignore file */

import imageSize from 'image-size';

/**
 * Contains size information based on specific dimensions.
 *
 * While it's possible to create an instance using the constructor, it's often necessary to contents read from
 * configuration data or file names, in which cases {@link Size.parse} is recommended instead. Additionally, size
 * information for images can be derived using {@link Size.fromImage}.
 *
 * @public
 */
export class Size {

  /**
   * @type {RegExp}
   * @private
   */
  static #rSize = /^\s*(\d+)\s*([xX]\s*(\d+))?\s*$/;

  /**
   * Creates instances of {@link Size} from the dimensions read from the specified <code>image</code>.
   *
   * <code>image</code> can either be a <code>Buffer</code> containing image data or the path of an image file. If
   * <code>image</code> contains multiple images (e.g. ICO), the returned array will contain a {@link Size} for each
   * image contained within.
   *
   * @param {Buffer|string} image - the image whose dimensions are to be captured in the returned {@link Size} instances
   * @return {Size[]} An array of {@link Size} instances for each image contained within <code>image</code>.
   * @public
   */
  static fromImage(image) {
    const { height, images, width } = imageSize(image);
    const sizes = [];

    if (images) {
      for (const dimensions of images) {
        sizes.push(new Size(dimensions.width, dimensions.height));
      }
    } else {
      sizes.push(new Size(width, height));
    }

    return sizes;
  }

  /**
   * Parses the specified <code>size</code> value into a {@link Size} instance.
   *
   * <code>size</code> can either be a string representation of {@link Size} or a number representing both width and
   * height dimensions. If <code>size</code> is a string, it can contain either just a single number, which will be used
   * as both width and height dimensions, or two numbers separated by an "x", which will be used as the width and height
   * dimensions respectively.
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
    let height, match, width;

    switch (typeof size) {
    case 'number':
      if (Number.isNaN(size) || size < 0) {
        throw new Error(`"sizes" configuration must contain only valid positive numbers: ${size}`);
      }

      width = size;
      height = size;

      break;
    case 'string':
      match = size.match(Size.#rSize);
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
   * @type {number}
   * @private
   */
  #height;
  /**
   * @type {number}
   * @private
   */
  #width;

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
    this.#width = width;
    this.#height = height;
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
    return this.#height;
  }

  /**
   * Returns the width of this {@link Size}.
   *
   * @return {number} The width.
   * @public
   */
  get width() {
    return this.#width;
  }

}
