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

const pollock = require('pollock');

const _type = Symbol('type');

/**
 * Provides information for a single VCS repository type. It has the potential to derive repository URLs from a
 * directory and parse hosted repository information from URLs.
 *
 * While it's possible to create an instance using the constructor of child implementations, it's highly recommended
 * that {@link RepositoryService} is used instead.
 *
 * @public
 */
class RepositoryProvider {

  /**
   * Creates an instance of {@link RepositoryProvider} with the specified <code>type</code>.
   *
   * @param {string} type - the type to be used
   * @protected
   */
  constructor(type) {
    this[_type] = type;
  }

  /**
   * Returns the type for this {@link RepositoryProvider}.
   *
   * @return {string} The type.
   * @public
   */
  getType() {
    return this[_type];
  }

}

/**
 * Attempts to parse a {@link Repository} from the specified <code>url</code>.
 *
 * This method will return <code>null</code> if <code>url</code> does not match that of any supported repository host.
 *
 * All implementations of {@link RepositoryProvider} <b>must</b> override this method.
 *
 * @param {string} url - the repository URL to be parsed
 * @return {?Repository} The {@link Repository} containing the parsed information or <code>null</code> if
 * <code>url</code> could not be parsed.
 * @public
 * @abstract
 * @memberof RepositoryProvider#
 * @method parseURL
 */
pollock(RepositoryProvider, 'parseURL');

/**
 * Attempts to resolve the repository URL from the specified <code>dirPath</code>.
 *
 * If no repository URL could be resolved, this method will be resolved with <code>null</code>.
 *
 * An error will occur if any problem arises while attempting to resolve the repository URL.
 *
 * All implementations of {@link RepositoryProvider} <b>must</b> override this method.
 *
 * @param {string} dirPath - the path of the directory from which the repository URL is to be resolved
 * @return {Promise.<string, Error>} A <code>Promise</code> that is resolved with the repository URL or
 * <code>null</code> if none could be found.
 * @public
 * @abstract
 * @memberof RepositoryProvider#
 * @method resolveURL
 */
pollock(RepositoryProvider, 'resolveURL');

module.exports = RepositoryProvider;
