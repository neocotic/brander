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

import chalk from 'chalk';
import Debug from 'debug';
import { get, trim } from 'lodash-es';

import { GitRepositoryProvider } from './git/git-repository-provider.mjs';

const debug = Debug('brander:config:repository');

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
export class RepositoryService {

  /**
   * @type {Symbol}
   * @private
   */
  static #privateKey = Symbol("privateKey");
  /**
   * @type {?RepositoryService}
   * @private
   */
  static #singleton;

  /**
   * Returns a singleton instance of {@link RepositoryService}.
   *
   * @return {RepositoryService} The singleton instance.
   * @public
   */
  static getInstance() {
    if (!RepositoryService.#singleton) {
      RepositoryService.#singleton = new RepositoryService(RepositoryService.#privateKey);
    }

    return RepositoryService.#singleton;
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
   * @type {RepositoryProvider[]}
   * @private
   */
  #providers = [new GitRepositoryProvider()];

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
    if (privateKey !== RepositoryService.#privateKey) {
      throw new Error('RepositoryService constructor is private');
    }
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
   * @param {?RepositoryService~RepositoryInfo} info - the VCS repository information on which the {@link Repository} is
   * to be based (may be <code>null</code>)
   * @return {?Repository} A {@link Repository} based on <code>info</code> or <code>null</code> if <code>info</code> is
   * <code>null</code> or a suitable {@link RepositoryProvider} could not be found for <code>info.type</code> or
   * <code>info.url</code> is unavailable or could not be parsed.
   * @public
   */
  getRepository(info) {
    if (!info) {
      return null;
    }

    let { type } = info;
    const { url } = info;

    if (!type) {
      type = RepositoryService.DEFAULT_TYPE;
    }
    if (!url) {
      debug('Repository unavailable as no repository URL was provided');

      return null;
    }

    const provider = this.#getProvider(type);
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
   * @return {Promise<RepositoryService~RepositoryInfo>} A <code>Promise</code> that is resolved with the repository
   * information or <code>null</code> if a suitable {@link RepositoryProvider} could not be found for the derived
   * repository type (where applicable) or the repository URL could not be derived.
   * @public
   */
  async getRepositoryInfo(dirPath, options = {}) {
    let info = this.#parseRepositoryInfo(options.info);
    if (!(info.type || info.url) && options.pkg) {
      info = this.#parseRepositoryInfo(options.pkg.get('repository'));
    }

    const { type, url } = info;

    if (url) {
      debug('Configured repository URL found: %s', chalk.cyan(url));

      return info;
    }

    if (type) {
      const provider = this.#getProvider(type);
      if (!provider) {
        debug('Repository info unavailable as unable to find repository provider for type: %s', type);

        return null;
      }

      const resolvedInfo = await this.#resolveInfo(provider, dirPath);
      if (!resolvedInfo) {
        debug('Repository info unavailable as unable to resolve "%s" repository URL from directory: %s', type,
          chalk.blue(dirPath));
      }

      return resolvedInfo;
    }

    debug('Attempting to resolve from all known types as repository type unknown for directory: %s',
      chalk.blue(dirPath));

    for (const provider of this.#providers) {
      const resolvedInfo = await this.#resolveInfo(provider, dirPath);
      if (resolvedInfo) {
        return resolvedInfo;
      }
    }

    debug('Repository info unavailable as unable to resolve repository URL of any type from directory: %s',
      chalk.blue(dirPath));

    return null;
  }

  /**
   * @param {string} type
   * @return {RepositoryProvider|any}
   * @private
   */
  #getProvider(type) {
    for (const provider of this.#providers) {
      if (provider.getType() === type) {
        return provider;
      }
    }

    return null;
  }

  /**
   * @param {RepositoryService~GetRepositoryInfoOptions|string} info
   * @return {RepositoryService~RepositoryInfo}
   * @private
   */
  #parseRepositoryInfo(info) {
    let type, url;

    if (typeof info === 'string') {
      url = trim(info) || null;
    } else {
      type = trim(get(info, 'type')).toLowerCase() || null;
      url = trim(get(info, 'url')) || null;
    }

    return { type, url };
  }

  /**
   * @param {RepositoryProvider} provider
   * @param {string} dirPath
   * @return {Promise<?RepositoryService~RepositoryInfo>}
   * @private
   */
  async #resolveInfo(provider, dirPath) {
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
