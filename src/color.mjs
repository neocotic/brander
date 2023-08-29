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

import convert from 'color-convert';
import { chain, trim } from 'lodash-es';

/**
 * Contains color information based on a specific value in a single color format and supports easy conversion to other
 * formats.
 *
 * No validation is performed to ensure that the value conforms to the format, so it simply may not behave as expected
 * in such cases.
 *
 * @public
 */
export class Color {

  /**
   * @type {string}
   * @private
   */
  #format;
  /**
   * @type {?string}
   * @private
   */
  #name;
  /**
   * @type {number[]|string[]}
   * @private
   */
  #value;

  /**
   * Creates an instance of {@link Color} using the <code>options</code> provided.
   *
   * An error will occur if the <code>format</code> option is not supported.
   *
   * @param {Color~Options} options - the options to be used
   * @throws {Error} If the <code>format</code> option is not supported.
   * @public
   */
  constructor(options) {
    const format = trim(options.format).toLowerCase();
    if (!convert[format]) {
      throw new Error(`Unsupported color format: ${format}`);
    }

    this.#format = format;
    this.#name = trim(options.name) || null;
    this.#value = options.value == null ? [] : chain(options.value)
      .castArray()
      .map((v) => typeof v === 'string' ? trim(v) : v)
      .value();
  }

  /**
   * Converts this {@link Color} into the specified <code>format</code>.
   *
   * This method simply uses the handy conversion getter for <code>format</code> and creates a new instance of
   * {@link Color} based on the converted value.
   *
   * An error will occur if <code>format</code> is not supported.
   *
   * @param {string} format - the format to which this {@link Color} is to be converted
   * @return {Color} A {@link Color} instance containing the value converted into <code>format</code>.
   * @throws {Error} If <code>format</code> is not supported.
   * @public
   */
  convert(format) {
    return new Color({
      format,
      name: this.name,
      value: this[format]
    });
  }

  /**
   * Returns the format for this {@link Color}.
   *
   * @return {string} The format.
   * @public
   */
  get format() {
    return this.#format;
  }

  /**
   * Returns the name of this {@link Color}.
   *
   * The name is simply a user-defined identifier and is not necessarily a good/accurate indicator of this
   * {@link Color}.
   *
   * @return {?string} The name or <code>null</code> if unavailable.
   * @public
   */
  get name() {
    return this.#name;
  }

  /**
   * Returns the value for this {@link Color}.
   *
   * @return {number[]|string[]} The value.
   * @public
   */
  get value() {
    return [ ...this.#value ];
  }

}

Object.keys(convert).forEach((format) => {
  Object.defineProperty(Color.prototype, format, {
    configurable: true,
    enumerable: true,
    get() {
      // Return original value as color-convert does not expose convert methods for identical formats understandably
      if (this.format === format) {
        return this.value;
      }

      if (typeof convert[this.format][format] !== 'function') {
        throw new Error(`Unsupported color format: ${format}`);
      }

      let value = convert[this.format][format](...this.value);
      // Sometimes hex values don't contain hash prefix for some reason
      if (format === 'hex' && !value.startsWith('#')) {
        value = `#${value}`;
      }

      return value;
    }
  });
});

/**
 * The options that can be passed to the {@link Color} constructor.
 *
 * @typedef {Object} Color~Options
 * @property {string} format - The format.
 * @property {string} [name] - A user-defined name.
 * @property {number|number[]|string|string[]} value - The value.
 */
