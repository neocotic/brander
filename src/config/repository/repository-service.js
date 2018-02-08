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
const chalk = require('chalk');
const debug = require('debug')('brander:config:repository');

const GitRepositoryProvider = require('./git/git-repository-provider');

const _getProvider = Symbol('getProvider');
const _parseRepositoryInfo = Symbol('parseRepositoryInfo');
const _privateKey = Symbol('privateKey');
const _providers = Symbol('providers');
const _resolveInfo = Symbol('resolveInfo');
const _singleton = Symbol('singleton');

/**
 * Parses and resolves VCS repository information using the following supported types:
 *
 * <ul>
 *   <li>Git (default)</li>
 * </ul>
 *
 * This class cannot be instantiated and {@link RepositoryService.getInstance} must be used to gain a reference to the
 * globally available singleton instance.
 *
 * @public
 */
class RepositoryService {

  /**
   * Returns a singleton instance of {@link RepositoryService}.
   *
   * @return {RepositoryService} The singleton instance.
   * @public
   */
  static getInstance() {
    if (!RepositoryService[_singleton]) {
      RepositoryService[_singleton] = new RepositoryService(_privateKey);
    }

    return RepositoryService[_singleton];
  }

  /**
   * Returns the default repository type.
   *
   * @return {string} The default type.
   * @public
   */
  static get DEFAULT_TYPE() {
    return 'git';
  }

  /**
   * Creates an instance of {@link RepositoryService}.
   *
   * Use {@link RepositoryService.getInstance} to obtain an instance of {@link RepositoryService}. Do not try to
   * instantiate this class directly.
   *
   * <code>privateKey</code> is used to ensure that {@link RepositoryService} can only be instantiated within this
   * module.
   *
   * An error will occur if <code>privateKey</code> is invalid.
   *
   * @param {Symbol} privateKey - a private symbol used to prevent external instantiation of {@link RepositoryService}
   * @throws {Error} If <code>privateKey</code> is invalid.
   * @private
   */
  constructor(privateKey) {
    if (privateKey !== _privateKey) {
      throw new Error('RepositoryService constructor is private');
    }

    // TODO: Support more VCS types
    this[_providers] = [
      new GitRepositoryProvider()
    ];
  }

  /**
   * Attempts to create a {@link Repository} instance based on the repository <code>info</code> provided.
   *
   * If <code>info.type</code> is not available, then the default repository type (see
   * {@link RepositoryService.DEFAULT_TYPE}) will be used instead. However, if <code>info.url</code> is not available,
   * then this method will immediately return <code>null</code>.
   *
   * This method will attempt to lookup a suitable {@link RepositoryProvider} based on <code>info.type</code> and, if no
   * suitable provider is found, it will return <code>null</code>. Otherwise, the provider will be used to parse
   * <code>info.url</code> and the result will be returned.
   *
   * @param {RepositoryService~RepositoryInfo} info - the VCS repository information on which the {@link Repository} is
   * to be based
   * @return {?Repository} A {@link Repository} based on <code>info</code> or <code>null</code> if a suitable
   * {@link RepositoryProvider} could not be found for <code>info.type</code> or <code>info.url</code> is unavailable or
   * could not be parsed.
   * @public
   */
  getRepository(info) {
    let { type } = info;
    const { url } = info;

    if (!type) {
      type = RepositoryService.DEFAULT_TYPE;
    }
    if (!url) {
      debug('Repository unavailable as no repository URL was provided');

      return null;
    }

    const provider = this[_getProvider](type);
    if (!provider) {
      debug('Repository unavailable as unable to find repository provider for type: %s', type);

      return null;
    }

    debug('Parsing "%s" repository URL: %s', type, chalk.cyan(url));

    const repository = provider.parseURL(url);
    if (repository) {
      debug('Parsed "%s" repository from URL: %s', type, chalk.cyan(url));
    } else {
      debug('Repository unavailable as unable to parse "%s" repository from URL: %s', type, chalk.cyan(url));
    }

    return repository;
  }

  /**
   * Attempts to derive (potentially partial) repository information from the specified <code>dirPath</code>.
   *
   * Optionally, <code>options</code> can be provided with some potential sources/hints at the repository information
   * before attempting to derive it from <code>dirPath</code>.
   *
   * If either the <code>info</code> or <code>pkg</code> options contain the repository URL, then their corresponding
   * information will be returned by this method immediately.
   *
   * If the repository type was derived at this stage, it will be used to lookup a suitable {@link RepositoryProvider}
   * and, if no suitable provider is found, this method will return <code>null</code>. Otherwise, the provider will be
   * used to derive the repository URL from <code>dirPath</code> and this information will be returned.
   *
   * However, if no repository type could be derived, <i>all</i> providers will be called upon to attempt to derive the
   * the repository URL from <code>dirPath</code> until one succeeds.
   *
   * If no repository URL could be derived at any stage or an error occurs while a provider attempts to derive the
   * repository information from <code>dirPath</code>, then this method will return <code>null</code>.
   *
   * @param {string} dirPath - the path of the directory from which the repository information may be derived
   * @param {RepositoryService~GetRepositoryInfoOptions} [options] - the options to be used
   * @return {Promise.<RepositoryService~RepositoryInfo>} A <code>Promise</code> that is resolved with the repository
   * information or <code>null</code> if a suitable {@link RepositoryProvider} could not be found for the derived
   * repository type (where applicable) or the repository URL could not be derived.
   * @public
   */
  async getRepositoryInfo(dirPath, options = {}) {
    let info = this[_parseRepositoryInfo](options.info);
    if (!(info.type || info.url) && options.pkg) {
      info = this[_parseRepositoryInfo](options.pkg.get('repository'));
    }

    const { type, url } = info;

    if (url) {
      debug('Configured repository URL found: %s', chalk.cyan(url));

      return info;
    }

    if (type) {
      const provider = this[_getProvider](type);
      if (!provider) {
        debug('Repository info unavailable as unable to find repository provider for type: %s', type);

        return null;
      }

      const resolvedInfo = await this[_resolveInfo](provider, dirPath);
      if (!resolvedInfo) {
        debug('Repository info unavailable as unable to resolve "%s" repository URL from directory: %s', type,
          chalk.blue(dirPath));
      }

      return resolvedInfo;
    }

    debug('Attempting to resolve from all known types as repository type unknown for directory: %s',
      chalk.blue(dirPath));

    for (const provider of this[_providers]) {
      const resolvedInfo = await this[_resolveInfo](provider, dirPath);
      if (resolvedInfo) {
        return resolvedInfo;
      }
    }

    debug('Repository info unavailable as unable to resolve repository URL of any type from directory: %s',
      chalk.blue(dirPath));

    return null;
  }

  [_getProvider](type) {
    for (const provider of this[_providers]) {
      if (provider.getType() === type) {
        return provider;
      }
    }

    return null;
  }

  [_parseRepositoryInfo](info) {
    let type;
    let url;

    if (typeof info === 'string') {
      url = _.trim(info) || null;
    } else {
      type = _.trim(_.get(info, 'type')).toLowerCase() || null;
      url = _.trim(_.get(info, 'url')) || null;
    }

    return { type, url };
  }

  async [_resolveInfo](provider, dirPath) {
    const type = provider.getType();
    let url;

    debug('Resolving "%s" repository URL from directory: %s', type, chalk.blue(dirPath));

    try {
      url = await provider.resolveURL(dirPath);
    } catch (e) {
      debug('Could not resolve "%s" repository URL as an error occurred while trying to retrieve it: %s', type, e);
    }

    if (url) {
      debug('Resolved "%s" repository URL: %s', type, chalk.cyan(url));

      return { type, url };
    }

    debug('Unable to resolve "%s" repository URL from directory: %s', type, chalk.blue(dirPath));

    return null;
  }

}

module.exports = RepositoryService;

/**
 * The options that can be passed to {@link RepositoryService#getRepositoryInfo}.
 *
 * @typedef {Object} RepositoryService~GetRepositoryInfoOptions
 * @property {string|RepositoryService~RepositoryInfo} [info] - A potential repository information or repository URL.
 * @property {Package} [pkg] - The {@link Package} that could potentially contain fallback repository information.
 */

/**
 * Contains (potentially partial) VCS repository information.
 *
 * @typedef {Object} RepositoryService~RepositoryInfo
 * @property {string} [type] - The repository type.
 * @property {string} [url] - The repository URL.
 */
