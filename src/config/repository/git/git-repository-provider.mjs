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
import hostedGitInfo from 'hosted-git-info';
import { chain, isEmpty, trim } from 'lodash-es';
import { spawn } from 'node:child_process';

import { GitRepository } from './git-repository.mjs';
import { RepositoryProvider } from '../repository-provider.mjs';

const debug = Debug('brander:config:repository:git');

/**
 * A {@link RepositoryProvider} implementation for Git.
 *
 * The <code>GitRepositoryProvider</code> uses the <code>hosted-git-info</code> module to build {@link GitRepository}
 * based on information derived from the repository URL and supports the following Git hosts:
 *
 * <ul>
 *   <li>Bitbucket</li>
 *   <li>GitHub (incl. Gist)</li>
 *   <li>GitLab</li>
 * </ul>
 *
 * It will attempt to use the <code>git</code> command to extract a repository URL from a directory based on the
 * configured remotes (giving precedence to <code>origin</code>).
 *
 * @public
 */
export class GitRepositoryProvider extends RepositoryProvider {

  /**
   * @type {string}
   * @private
   */
  static #preferredRemote = 'origin';

  /**
   * Creates an instance of {@link GitRepositoryProvider}.
   *
   * @public
   */
  constructor() {
    super('git');
  }

  /**
   * @inheritdoc
   * @override
   */
  parseURL(url) {
    const info = hostedGitInfo.fromUrl(url, { noGitPlus: true });
    if (!info) {
      return null;
    }

    return new GitRepository(info);
  }

  /**
   * @inheritdoc
   * @override
   */
  async resolveURL(dirPath) {
    debug('Resolving Git repository URL from directory: %s', chalk.blue(dirPath));

    const remotes = await this.#getRemoteNames(dirPath);
    if (isEmpty(remotes)) {
      debug('No remotes found in Git repository at directory: %s', chalk.blue(dirPath));

      return null;
    }

    let remote;
    const preferredIndex = remotes.indexOf(GitRepositoryProvider.#preferredRemote);
    if (preferredIndex >= 0) {
      remote = remotes[preferredIndex];
    } else {
      remote = remotes[0];

      debug('"%s" remote was not present so using first remote: %s', GitRepositoryProvider.#preferredRemote, remote);
    }

    let remoteUrl = await this.#getRemoteURL(remote, dirPath);
    if (remoteUrl) {
      const branchName = await this.#getBranchName(dirPath);
      if (branchName) {
        remoteUrl += `#${branchName}`;
      }

      debug('Git repository URL resolved using "%s" remote: %s', remote, chalk.cyan(remoteUrl));
    }

    return remoteUrl;
  }

  /**
   * @param {string} dirPath
   * @param {...string} [args]
   * @return {Promise<string>}
   * @private
   */
  #execGit(dirPath, ...args) {
    return new Promise((resolve, reject) => {
      debug('Executing git command with args %j in directory: %s', args, chalk.blue(dirPath));

      const git = spawn('git', args, { cwd: dirPath });
      let err = '';
      let out = '';

      git.stderr.on('data', (data) => {
        err += data;
      });
      git.stdout.on('data', (data) => {
        out += data;
      });

      git.on('close', (code) => {
        if (code) {
          reject(new Error(err));
        } else {
          resolve(out);
        }
      });
      git.on('error', reject);
    });
  }

  /**
   * @param {string} dirPath
   * @return {Promise<?string>}
   * @private
   */
  async #getBranchName(dirPath) {
    const output = await this.#execGit(dirPath, 'branch', '--show-current');

    return trim(output) || null;
  }

  /**
   * @param {string} dirPath
   * @return {Promise<string[]>}
   * @private
   */
  async #getRemoteNames(dirPath) {
    const output = await this.#execGit(dirPath, 'remote', 'show');

    return chain(output)
      .split(/\n/)
      .map(trim)
      .compact()
      .value();
  }

  /**
   * @param {string} name
   * @param {string} dirPath
   * @return {Promise<?string>}
   * @private
   */
  async #getRemoteURL(name, dirPath) {
    const output = await this.#execGit(dirPath, 'remote', 'get-url', name);

    return trim(output) || null;
  }

}
