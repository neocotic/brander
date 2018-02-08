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

const pollock = require('pollock');

const _type = Symbol('type');

/**
 * Provides information related to a VCS repository. This information is generally derived from a repository URL which
 * may have been available within loaded configuration/package data, automatically discovered, or passed manually.
 *
 * Only repositories hosted on well known services (e.g. GitHub) are supported. This is because this information is
 * generally used to generate URLs for assets/docs.
 *
 * While it's possible to create an instance using the constructor of child implementations, it's highly recommended
 * that {@link RepositoryService} is used instead.
 *
 * @public
 * @abstract
 */
class Repository {

  /**
   * Creates an instance of {@link Repository} with the specified <code>type</code>.
   *
   * @param {string} type - the type to be used
   * @protected
   */
  constructor(type) {
    this[_type] = type;
  }

  /**
   * Returns the type of this {@link Repository}.
   *
   * @return {string} The type.
   * @public
   */
  getType() {
    return this[_type];
  }

}

/**
 * Returns the branch name for this {@link Repository}.
 *
 * If unknown, this method should return the name of the conventional default branch for its type.
 *
 * Although the branch name is expected, it can be any commit-ish value (e.g. commit hash or revision number).
 *
 * All implementations of {@link Repository} <b>must</b> override this method.
 *
 * @return {string} The branch name.
 * @public
 * @abstract
 * @memberof Repository#
 * @method getBranch
 */
pollock(Repository, 'getBranch');

/**
 * Returns the URL for viewing the file at the path provided within this {@link Repository}.
 *
 * Optionally, <code>fragment</code> can be provided to be included in the URL as a hash fragment that relates to
 * content on the file view page.
 *
 * <code>filePath</code> will always be treated as relative to the repository tree.
 *
 * This method is useful for generating URLs for linking file viewers. There is no requirement for this URL to point to
 * the same domain as the repository is hosted on (e.g. formatter, proxy, renderer, syntax highlighter).
 *
 * All implementations of {@link Repository} <b>must</b> override this method.
 *
 * @param {string} filePath - the path of the file for which a URL to view it's user-friendly contents is to be returned
 * @param {string} [fragment] - the hash fragment to be included
 * @return {string} The URL for viewing the file.
 * @public
 * @abstract
 * @memberof Repository#
 * @method getFileURL
 */
pollock(Repository, 'getFileURL');

/**
 * Returns the URL for the homepage of this {@link Repository}.
 *
 * All implementations of {@link Repository} <b>must</b> override this method.
 *
 * @return {string} The homepage URL.
 * @public
 * @abstract
 * @memberof Repository#
 * @method getHomepage
 */
pollock(Repository, 'getHomepage');

/**
 * Returns the name of this {@link Repository}.
 *
 * All implementations of {@link Repository} <b>must</b> override this method.
 *
 * @return {string} The name.
 * @public
 * @abstract
 * @memberof Repository#
 * @method getName
 */
pollock(Repository, 'getName');

/**
 * Returns the URL for retrieving the raw file at the path provided within this {@link Repository}.
 *
 * <code>filePath</code> will always be treated as relative to the repository tree.
 *
 * This method is useful for generating URLs for linking directly to raw files. There is no requirement for this URL to
 * point to the same domain as the repository is hosted on (e.g. CDN, proxy).
 *
 * All implementations of {@link Repository} <b>must</b> override this method.
 *
 * @param {string} filePath - the path of the file for which a URL to access its raw contents is to be returned
 * @return {string} The URL for retrieving the raw file.
 * @public
 * @abstract
 * @memberof Repository#
 * @method getRawFileURL
 */
pollock(Repository, 'getRawFileURL');

/**
 * Returns the URL for this {@link Repository}.
 *
 * All implementations of {@link Repository} <b>must</b> override this method.
 *
 * @return {string} The URL.
 * @public
 * @abstract
 * @memberof Repository#
 * @method getURL
 */
pollock(Repository, 'getURL');

/**
 * Returns the user name for this {@link Repository}.
 *
 * Not all repository types will contain user information. In such cases, this method will return <code>null</code>.
 *
 * All implementations of {@link Repository} <b>must</b> override this method.
 *
 * @return {?string} The user name or <code>null</code> if unavailable.
 * @public
 * @abstract
 * @memberof Repository#
 * @method getUser
 */
pollock(Repository, 'getUser');

module.exports = Repository;
