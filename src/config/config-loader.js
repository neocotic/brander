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

const fs = require('fs-extra');
const path = require('path');
const stripJsonComments = require('strip-json-comments');

const Config = require('./config');

const _baseDir = Symbol('baseDir');
const _findFilePath = Symbol('findFilePath');

/**
 * TODO: Document
 *
 * @public
 */
class ConfigLoader {

  /**
   * Creates an instance of {@link ConfigLoader}.
   *
   * Optionally, <code>options</code> can be provided for more granular control.
   *
   * @param {ConfigLoader~Options} [options] - the options to be used
   * @public
   */
  constructor(options = {}) {
    this[_baseDir] = options.baseDir || process.cwd();
  }

  /**
   * Returns the names supported for configuration files.
   *
   * @return {string[]} The file names.
   * @protected
   */
  getFileNames() {
    return [
      '.branderrc',
      '.branderrc.js',
      '.branderrc.json'
    ];
  }

  /**
   * Returns whether the specified <code>filePath</code> is targetting a module that should be <code>require</code>'d
   * instead of having its contents read and parsed.
   *
   * This method should be a best guess based on the <code>filePath</code> and should avoid touching the file where at
   * all possible.
   *
   * @param {string} filePath - the path of the file to be checked
   * @return {boolean} <code>true</code> if <code>filePath</code> is a module; otherwise <code>false</code>.
   * @protected
   */
  isModule(filePath) {
    return path.extname(filePath) === '.js';
  }

  /**
   * Attempts to find and load the configuration data from a file.
   *
   * If <code>filePath</code> is specified, the configuration data will be read from that file. Otherwise, an attempt
   * will be made to find any file with a recognised name within the base directory and use the first one it finds.
   *
   * If the file denotes a module, it will be required and its exports will be used as the configuration data.
   * Otherwise, the contents of the file will be read using UTF-8 encoding and parsed based on its type.
   *
   * All file paths (specified or discovered) are resolve using the base directory unless where already absolute.
   *
   * An error will occur if no configuration file was specified and/or found, an error occurred while attempting to load
   * the configuration file, or the configuration file contained no data.
   *
   * @param {?string} filePath - the path of the file whose configuration data is to be loaded (may be <code>null</code>
   * to find and load configuration data from recognisable file within base directory)
   * @return {Promise.<Error, Config>} A <code>Promise</code> for the configuration loaded from a file.
   * @public
   */
  async load(filePath) {
    if (!filePath) {
      filePath = this[_findFilePath]();
    }
    if (!filePath) {
      throw new Error('Unable to find configuration file!');
    }

    filePath = path.resolve(this[_baseDir], filePath);

    if (this.isModule(filePath)) {
      /* eslint-disable global-require */
      return require(filePath);
      /* eslint-enable global-require */
    }

    const contents = await fs.readFile(filePath, 'utf8');
    const data = this.parse(contents, filePath);

    if (!data) {
      throw new Error(`Configuration file contains no data: ${filePath}`);
    }

    return new Config(filePath, data);
  }

  /**
   * Attempts to parse the specified <code>contents</code> of the <code>filePath</code> provided as configuration data.
   *
   * @param {string} contents - the UTF-8 encoded file contents to be parsed
   * @param {string} filePath - the path of the file being parsed
   * @return {?Object} The parsed configuration data or <code>null</code> if <code>contents</code> contained none.
   * @throws {Error} If an error occurred while attempting to parse <code>contents</code> or if <code>filePath</code>
   * denotes an unsupported file type.
   * @protected
   */
  parse(contents, filePath) {
    const extension = path.extname(filePath) || '.json';

    switch (extension) {
    case '.json':
      return JSON.parse(stripJsonComments(contents));
    default:
      throw new Error(`Unsupported configuration file type: ${filePath}`);
    }
  }

  async [_findFilePath]() {
    for (const fileName of this.getfileNames()) {
      const filePath = path.resolve(this[_baseDir], fileName);

      try {
        await fs.access(filePath);

        return filePath;
      } catch (e) {
        // Ignore ENOENT errors
        if (e.code !== 'ENOENT') {
          throw e;
        }
      }
    }

    return null;
  }

}

module.exports = ConfigLoader;

/**
 * The options that can be passed to the {@link ConfigLoader} constructor.
 *
 * @typedef {Object} ConfigLoader~Options
 * @property {string} [baseDir=process.cwd()] - The base directory.
 */
