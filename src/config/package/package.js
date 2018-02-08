/*
 * Copyright (C) 2018 Alasdair Mercer, !ninja
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

/* istanbul ignore file */

const _ = require('lodash');

const _data = Symbol('data');
const _filePath = Symbol('filePath');

/**
 * Contains parsed package data that has been loaded from a single package file.
 *
 * While it's possible to create an instance using the constructor, it's highly recommended that {@link PackageLoader}
 * is used instead.
 *
 * @public
 */
class Package {

  /**
   * Creates an instance of {@link Package}.
   *
   * Optionally, <code>options</code> can be provided when more information is available.
   *
   * @param {Package~Options} [options] - the options to be used
   * @public
   */
  constructor(options = {}) {
    this[_data] = options.data;
    this[_filePath] = options.filePath;
  }

  /**
   * Resolves the value of the data with the specified <code>name</code> within this {@link Package}.
   *
   * Optionally, if <code>defaultValue</code> is specified and this {@link Package} contains no data, or the desired
   * data is missing, it will be returned instead. Otherwise, this method will return <code>undefined</code>.
   *
   * @param {string|string[]} name - the paths or path segments to the property within the data whose value is to be
   * returned
   * @param {*} [defaultValue] - the value to be returned for <code>undefined</code> resolved values
   * @return {*} The resolved value.
   * @public
   */
  get(name, defaultValue) {
    return _.get(this[_data], name, defaultValue);
  }

  /**
   * @override
   */
  toString() {
    return `Package(${this.filePath})`;
  }

  /**
   * Returns the parsed data contained within this {@link Package}.
   *
   * The {@link Package#get} method can be used to retrieve values within the data while remaining null-safe.
   *
   * @return {?Object} The package data or <code>null</code> if unavailable.
   * @public
   */
  get data() {
    return this[_data];
  }

  /**
   * Returns the path of the <code>package.json</code> file from where the data for this {@link Package} was originally
   * loaded.
   *
   * @return {?string} The package file path or <code>null</code> if unavailable.
   * @public
   */
  get filePath() {
    return this[_filePath];
  }

}

module.exports = Package;

/**
 * The options that can be passed to the {@link Package} constructor.
 *
 * @typedef {Object} Package~Options
 * @property {Object} [data] - The package data.
 * @property {string} [filePath] - The path of the <code>package.json</code> file from where the package data was
 * loaded.
 */
