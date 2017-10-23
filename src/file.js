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

const _ = require('lodash');
const fs = require('fs');
const glob = require('glob');
const mime = require('mime');
const mkdirp = require('mkdirp');
const path = require('path');
const rimraf = require('rimraf');
const util = require('util');

const access = util.promisify(fs.access);
const deleteFile = util.promisify(rimraf);
const findFiles = util.promisify(glob);
const makeDir = util.promisify(mkdirp);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const _config = Symbol('config');
const _dir = Symbol('dir');
const _evaluated = Symbol('evaluated');
const _format = Symbol('format');
const _name = Symbol('name');

/**
 * Contains information for a file.
 *
 * Care should be taken when using this information to generate file paths as the parent directory path and/or name may
 * contain a expression that needs to be evaluated beforehand.
 *
 * @public
 */
class File {

  /**
   * TODO: document
   *
   * @param {string} filePath -
   * @param {number} [mode] -
   * @return {Promise.<void, Error>}
   * @public
   */
  static access(filePath, mode) {
    return access(filePath, mode);
  }

  /**
   * TODO: document
   *
   * @param {string} filePath -
   * @param {Object} [options] -
   * @return {Promise.<void, Error>}
   * @public
   */
  static deleteFile(filePath, options) {
    return deleteFile(filePath, options);
  }

  /**
   * Attempts to derive the file format from the specified <code>fileName</code>.
   *
   * Optionally, <code>format</code> can be provided if there's an potential source of the file format already.
   *
   * <code>null</code> will be returned if the format could not be derived.
   *
   * @param {?string} fileName - the name of the file whose format is to be derived (may be <code>null</code>, in which
   * case <code>format</code> is the only chance at deriving the file format)
   * @param {string} [format] - a potential source of the file format
   * @return {?string} The derived file format or <code>null</code> if it is not possible to be derived based on the
   * information provided.
   * @public
   */
  static deriveFormat(fileName, format) {
    format = _.trim(format).toLowerCase();

    if (!format && fileName) {
      format = path.extname(fileName).substring(1).toLowerCase() || null;
    }

    return format || null;
  }

  /**
   * TODO: document
   *
   * @param {string} pattern -
   * @param {Object} [options] -
   * @return {Promise.<string[], Error>}
   * @public
   */
  static findFiles(pattern, options) {
    return findFiles(pattern, options);
  }

  /**
   * TODO: document
   *
   * @param {string} filePath -
   * @param {Object|string} [options] -
   * @return {Promise.<Buffer|string, Error>}
   * @public
   */
  static readFile(filePath, options) {
    return readFile(filePath, options);
  }

  /**
   * TODO: document
   *
   * @param {string} filePath -
   * @param {Buffer|string|Uint8Array} data -
   * @param {Object|string} [options] -
   * @return {Promise.<void, Error>}
   * @public
   */
  static async writeFile(filePath, data, options) {
    const dirPath = path.dirname(filePath);
    await makeDir(dirPath);

    return writeFile(filePath, data, options);
  }

  /**
   * Creates an instance of {@link File}.
   *
   * Optionally, <code>evaluated</code> should be set to <code>true</code> if <code>dir</code> and <code>name</code>
   * have already been evaluated (e.g. via {@link Config#evaluate}) to avoid double-evaluation.
   *
   * @param {?string} dir - the parent directory path to be used (may be <code>null</code>)
   * @param {?string} name - the name to be used (may be <code>null</code>)
   * @param {?string} format - the format to be used (may be <code>null</code>)
   * @param {Config} config - the {@link Config} to be used
   * @param {boolean} [evaluated] - <code>true</code> if <code>dir</code> and <code>name</code> have already been
   * evaluated; otherwise <code>false</code>
   * @public
   */
  constructor(dir, name, format, config, evaluated = false) {
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

    return excludeExtension ? path.basename(name, this.extension() || '') : path.basename(name);
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
   * derived from the name.
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
   * Resolves the specified sequence of <code>paths</code> or path segments into an absolute path relative to the parent
   * directory for this {@link File}.
   *
   * @param {...string} paths - the sequence of paths or path segments to be resolved
   * @return {string} An absolute file path.
   * @public
   */
  resolve(...paths) {
    return path.resolve(this.dir, ...paths);
  }

  /**
   * @override
   */
  toString() {
    return this.absolute;
  }

  /**
   * Returns the absolute path of this {@link File}.
   *
   * @return {string} The absolute file path.
   * @public
   */
  get absolute() {
    return path.join(this.dir, this.name);
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

  /**
   * Returns the path of this {@link File} relative to the base directory from where the data for the associated
   * {@link Config} was originally loaded.
   *
   * @return {string} The relative file path.
   * @public
   */
  get relative() {
    return this.config.relative(this.absolute);
  }

  /**
   * Returns the MIME type for this {@link File}.
   *
   * <code>null</code> will be returned if the name of this {@link File} is unavailable and/or the extension could not
   * be derived from the name and the format of this {@link File} is unavailable <b>or</b> a valid MIME could not be
   * derived from that extension.
   *
   * @return {?string} The MIME type or <code>null</code> if it has no name or format and/or the extension could not be
   * derived from the name or the MIME type could not be derived from either that extension.
   * @public
   */
  get type() {
    return mime.getType(this.extension());
  }

}

module.exports = File;
