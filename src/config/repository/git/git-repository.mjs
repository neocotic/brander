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

import { Repository } from '../repository.mjs';

/**
 * A {@link Repository} implementation for Git.
 *
 * @public
 */
export class GitRepository extends Repository {

  /**
   * @type {GitHost}
   * @private
   */
  #host;

  /**
   * Creates an instance of {@link GitRepository} based on the <code>host</code> provided.
   *
   * <code>host</code> is expected to be generated by the <code>hosted-git-info</code> module.
   *
   * @param {GitHost} host - the host information to be used
   * @public
   */
  constructor(host) {
    super('git');

    this.#host = host;
  }

  /**
   * @inheritdoc
   * @override
   */
  getBranch() {
    return this.#host.committish || 'main';
  }

  /**
   * @inheritdoc
   * @override
   */
  getFileURL(filePath, fragment) {
    return this.#host.browse(filePath, fragment);
  }

  /**
   * @inheritdoc
   * @override
   */
  getHomepage() {
    return this.#host.browse({ noCommittish: true });
  }

  /**
   * @inheritdoc
   * @override
   */
  getName() {
    return this.#host.project;
  }

  /**
   * @inheritdoc
   * @override
   */
  getRawFileURL(filePath) {
    return this.#host.file(filePath);
  }

  /**
   * @inheritdoc
   * @override
   */
  getURL() {
    return this.#host.https({ noCommittish: true });
  }

  /**
   * @inheritdoc
   * @override
   */
  getUser() {
    return this.#host.user;
  }

}
