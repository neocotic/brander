/*
 * Copyright (C) 2022 neocotic
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

const chalk = require('chalk');
const debug = require('debug')('brander:config');
const pkgUp = require('pkg-up');

const File = require('../../file');
const Package = require('./package');

const _cache = Symbol('cache');
const _getPackageFilePath = Symbol('getPackageFilePath');

/**
 * Responsible for finding, loading, and parsing <code>package.json</code> files and creating {@link Package} instances.
 *
 * A <code>PackageLoader</code> is be used to find the parent <code>package.json</code> file for a specified file, read
 * its contents, and finally parse it into a plain object that will be used as the package data.
 *
 * The file paths for all discovered <code>package.json</code> files are cached against the original file path request
 * in order to optimize subsequent lookups.
 *
 * @public
 */
class PackageLoader {

  /**
   * Creates an instance of {@link PackageLoader}.
   *
   * @public
   */
  constructor() {
    this[_cache] = new Map();
  }

  /**
   * Attempts to find and load the package data relevant to the specified <code>filePath</code>.
   *
   * If no <code>package.json</code> file is found or an error occurs while trying to read and parse it, this method
   * will be resolved with <code>null</code>.
   *
   * @param {string} filePath - the path of the file for which the related <code>package.json</code> file is to be found
   * and have their data loaded
   * @return {Promise.<Package>} A <code>Promise</code> for the asynchronous <code>package.json</code> file reading and
   * file traversal that is resolved with the {@link Package} loaded from the file or <code>null</code> if no
   * <code>package.json</code> file was found.
   * @public
   */
  async load(filePath) {
    const packageFilePath = await this[_getPackageFilePath](filePath);
    if (packageFilePath) {
      debug('Loading package file found at path: %s', chalk.blue(packageFilePath));

      try {
        const contents = await File.readFile(filePath, 'utf8');
        const data = JSON.parse(contents);
        if (!data) {
          debug('Package file contains no data: %s', chalk.blue(packageFilePath));
        }

        return new Package({
          data,
          filePath: packageFilePath
        });
      } catch (e) {
        debug('Package info unavailable as an error occurred while trying to load it: %s', e);
      }
    }

    debug('Unable to find package file for path: %s', chalk.blue(filePath));

    return null;
  }

  async [_getPackageFilePath](filePath) {
    if (this[_cache].has(filePath)) {
      return this[_cache].get(filePath);
    }

    debug('Searching for package file for path: %s', chalk.blue(filePath));

    const packageFilePath = await pkgUp(filePath);
    this[_cache].set(filePath, packageFilePath);

    return packageFilePath;
  }

}

module.exports = PackageLoader;
