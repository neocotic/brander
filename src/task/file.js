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

const path = require('path');

const _config = Symbol('config');
const _dir = Symbol('dir');
const _evaluated = Symbol('evaluated');
const _format = Symbol('format');
const _name = Symbol('name');

/**
 * TODO: document
 *
 * @public
 */
class File {

  /**
   * Creates an instance of {@link File}.
   *
   * Optionally, <code>evaluated</code> should be set to <code>true</code> if <code>dir</code> and <code>name</code>
   * have already been evaluated (e.g. via {@link Config#evaluate}) to avoid double-evaluation.
   *
   * An error will occur if neither <code>dir</code>, <code>name</code>, or <code>format</code> have been provided.
   *
   * @param {?string} dir - the parent directory path to be used (may be <code>null</code>)
   * @param {?string} name - the name to be used (may be <code>null</code>)
   * @param {?string} format - the format to be used (may be <code>null</code>)
   * @param {Config} config - the {@link Config} to be used
   * @param {boolean} [evaluated] - <code>true</code> if <code>dir</code> and <code>name</code> have already been
   * evaluated; otherwise <code>false</code>
   * @throws {Error} If neither <code>dir</code>, <code>name</code>, or <code>format</code> have been provided.
   * @public
   */
  constructor(dir, name, format, config, evaluated = false) {
    if (!(dir || name || format)) {
      throw new Error('At least one configuration must be provided: "dir", "name", "format"');
    }

    this[_dir] = dir;
    this[_name] = name;
    this[_format] = format;
    this[_config] = config;
    this[_evaluated] = evaluated;
  }

  /**
   * Returns the base name for this {@link File}.
   *
   * Optionally, <code>excludeExtension</code> can be used to exclude the extension from the base name. The extension
   * will be derived from the name, where possible, falling back to the format, where available.
   *
   * <code>null</code> will be returned if the name of this {@link File} is unavailable.
   *
   * @param {boolean} [excludeExtension] - <code>true</code> to exclude the extension from the base name; otherwise
   * <code>false</code>.
   * @return {?string} The base name, potentially with the extension excluded, or <code>null</code> if it has no name.
   * @public
   */
  base(excludeExtension = false) {
    const { name } = this;
    if (!name) {
      return null;
    }

    return excludeExtension ? path.basename(name, this.extension || '') : path.basename(name);
  }

  /**
   * Creates an instance of {@link File} based on the directory, name, and format of this {@link File} while using the
   * default values provided for those fields when unavailable.
   *
   * Optionally, <code>evaluated</code> should be set to <code>true</code> if <code>defaultDir</code> and
   * <code>defaultName</code>, or the corresponding fields on this {@link File}, have already been evaluated (e.g. via
   * {@link Config#evaluate}) to avoid double-evaluation.
   *
   * @param {string} defaultDir - the default directory path to be used
   * @param {string} defaultName - the default name to be used
   * @param {string} defaultFormat - the default format to be used
   * @param {boolean} [evaluated] - <code>true</code> if <code>defaultDir</code> and <code>defaultName</code> (or the
   * corresponding fields on this {@link File}) have already been evaluated; otherwise <code>false</code>
   * @return {File} A {@link File} based on this instance that potentially used the default values.
   * @public
   */
  defaults(defaultDir, defaultName, defaultFormat, evaluated = false) {
    const dir = this.dir || defaultDir;
    const name = this.name || defaultName;
    const format = this.format || defaultFormat;

    return new File(dir, name, format, this.config, evaluated);
  }

  /**
   * Returns an instance of {@link File} based on this {@link File}, whose diretory and name have been evaluated, by
   * interpolating data properties and executing embedded JavaScript within those fields.
   *
   * Optionally, <code>additionalData</code> can be provided to expose more variables to <code>expression</code> during
   * evaluation.
   *
   * A <code>config</code> variable can be used within the expression to reference the {@link Config} for this
   * {@link File}.
   *
   * A reference to this {@link File} will be returned if it has previously been evluated in an attempt to prevent
   * double-evaluation.
   *
   * @param {Object} [additionalData] - an object whose properties will be exposed as variables when the expressions are
   * evaluated
   * @return {File} A {@link File} based on this instance but with the directory and name fields evaluated, or exactly
   * this instance, if previously evaluated.
   * @public
   */
  evaluate(additionalData) {
    if (this[_evaluated]) {
      return this;
    }

    const { config, dir, name } = this;
    const evaluatedDir = dir ? config.evaluate(dir, additionalData) : null;
    const evaluatedName = name ? config.evaluate(name, additionalData) : null;

    return new File(evaluatedDir, evaluatedName, this.format, config, true);
  }

  /**
   * Returns the extension for this {@link File}.
   *
   * The extension will be derived from the name, where possible, falling back to the format, where available.
   *
   * <code>null</code> will be returned if the name of this {@link File} is unavailable and/or the extension could not
   * be derived from the name and the format of this {@link File} is unavailable.
   *
   * @return {?string} The extension or <code>null</code> if it has no name or format and/or the extension could not be
   * dervied from the name.
   * @public
   */
  extension() {
    const { format, name } = this;
    if (!name) {
      return format ? `.${format}` : null;
    }

    return path.extname(name) || (format && `.${format}`) || null;
  }

  /**
   * Returns the {@link Config} for this {@link File}.
   *
   * @return {Config} The configuration.
   * @public
   */
  get config() {
    return this[_config];
  }

  /**
   * Returns the parent directory path of this {@link File}.
   *
   * The diretory may be <code>null</code> if it is unavailable.
   *
   * @return {?string} The directory path or <code>null</code> if unavailable.
   * @public
   */
  get dir() {
    return this[_dir];
  }

  /**
   * Returns the format of this {@link File}.
   *
   * The format may be <code>null</code> if it is unavailable.
   *
   * @return {?string} The format or <code>null</code> if unavailable.
   * @public
   */
  get format() {
    return this[_format];
  }

  /**
   * Returns the name of this {@link File}.
   *
   * The name may be <code>null</code> if it is unavailable.
   *
   * @return {?string} The name or <code>null</code> if unavailable.
   * @public
   */
  get name() {
    return this[_name];
  }

}

module.exports = File;
