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

/**
 * A wrapper for {@link Repository} that acts as a safe proxy by supporting the possibility that no {@link Repository}
 * was provided.
 *
 * This class is intended to be used along with {@link Config} so exposes a similar expression-friendly API.
 *
 * @public
 */
export class Repo {

  /**
   * @type {Repository}
   * @private
   */
  #repository;

  /**
   * Creates an instance of {@link Repo}.
   *
   * Optionally, <code>repository</code> can be provided when available.
   *
   * @param {Repository} [repository] - the {@link Repository} to be used
   * @public
   */
  constructor(repository) {
    this.#repository = repository;
  }

  /**
   * A null-safe shortcut for {@link Repository#getFileURL}.
   *
   * @param {string} filePath - the path of the file for which a URL to view it's user-friendly contents is to be
   * returned
   * @param {string} [fragment] - the hash fragment to be included
   * @return {?string} The URL for viewing the file or <code>null</code> if no {@link Repository} is available.
   * @public
   */
  fileURL(filePath, fragment) {
    return this.#get((repository) => repository.getFileURL(filePath, fragment));
  }

  /**
   * A null-safe shortcut for {@link Repository#getRawFileURL}.
   *
   * @param {string} filePath - the path of the file for which a URL to access its raw contents is to be returned
   * @return {?string} The URL for retrieving the raw file or <code>null</code> if no {@link Repository} is available.
   * @public
   */
  rawFileURL(filePath) {
    return this.#get((repository) => repository.getRawFileURL(filePath));
  }

  /**
   * @override
   */
  toString() {
    return this.url || super.toString();
  }

  /**
   * @param {Repo~getSupplier<T>} supplier
   * @return {T|null}
   * @private
   */
  #get(supplier) {
    const repository = this.#repository;

    return repository ? supplier(repository) : null;
  }

  /**
   * A null-safe shortcut for {@link Repository#getBranch}.
   *
   * @return {?string} The branch name or <code>null</code> if no {@link Repository} is available.
   * @public
   */
  get branch() {
    return this.#get((repository) => repository.getBranch());
  }

  /**
   * A null-safe shortcut for {@link Repository#getHomepage}.
   *
   * @return {?string} The homepage URL or <code>null</code> if no {@link Repository} is available.
   * @public
   */
  get homepage() {
    return this.#get((repository) => repository.getHomepage());
  }

  /**
   * A null-safe shortcut for {@link Repository#getName}.
   *
   * @return {?string} The name or <code>null</code> if no {@link Repository} is available.
   * @public
   */
  get name() {
    return this.#get((repository) => repository.getName());
  }

  /**
   * A null-safe shortcut for {@link Repository#getType}.
   *
   * @return {?string} The type or <code>null</code> if no {@link Repository} is available.
   * @public
   */
  get type() {
    return this.#get((repository) => repository.getType());
  }

  /**
   * A null-safe shortcut for {@link Repository#getURL}.
   *
   * @return {?string} The URL or <code>null</code> if no {@link Repository} is available.
   * @public
   */
  get url() {
    return this.#get((repository) => repository.getURL());
  }

  /**
   * A null-safe shortcut for {@link Repository#getUser}.
   *
   * @return {?string} The user name or <code>null</code> if unavailable or no {@link Repository} is available.
   * @public
   */
  get user() {
    return this.#get((repository) => repository.getUser());
  }

}

/**
 * @callback Repo~getSupplier<T>
 * @param {Repository} repository
 * @return
 * @private
 */
