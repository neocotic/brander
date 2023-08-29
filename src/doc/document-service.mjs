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

import Debug from 'debug';
import { trim } from 'lodash-es';
import { fileURLToPath } from 'node:url';

import { DocumentProvider } from './document-provider.mjs';
import { File } from '../file.mjs';

const debug = Debug('brander:doc');

/**
 * Manages {@link DocumentProvider} instances that are available.
 *
 * Built-in providers are automatically discovered and added to the service before the first CRUD operation is
 * performed.
 *
 * This class cannot be instantiated and {@link DocumentService.getInstance} must be used to gain a reference to the
 * globally available singleton instance.
 *
 * @public
 */
export class DocumentService {

  /**
   * @type {Symbol}
   * @private
   */
  static #privateKey = Symbol('privateKey');
  /**
   * @type {?DocumentService}
   * @private
   */
  static #singleton;

  /**
   * Returns a singleton instance of {@link DocumentService}.
   *
   * @return {DocumentService} The singleton instance.
   * @public
   */
  static getInstance() {
    if (!DocumentService.#singleton) {
      DocumentService.#singleton = new DocumentService(DocumentService.#privateKey);
    }

    return DocumentService.#singleton;
  }

  /**
   * @type {boolean}
   * @private
   */
  #builtInsAdded = false;
  /**
   * @type {Map<string, DocumentProvider>}
   * @private
   */
  #providers = new Map();

  /**
   * Creates an instance of {@link DocumentService}.
   *
   * Use {@link DocumentService.getInstance} to obtain an instance of {@link DocumentService}. Do not try to instantiate
   * this class directly.
   *
   * <code>privateKey</code> is used to ensure that {@link DocumentService} can only be instantiated within this module.
   *
   * An error will occur if <code>privateKey</code> is invalid.
   *
   * @param {Symbol} privateKey - a private symbol used to prevent external instantiation of {@link DocumentService}
   * @throws {Error} If <code>privateKey</code> is invalid.
   * @private
   */
  constructor(privateKey) {
    if (privateKey !== DocumentService.#privateKey) {
      throw new Error('DocumentService constructor is private');
    }
  }

  /**
   * Adds the specified <code>provider</code> to this {@link DocumentService}.
   *
   * An error will occur if there is a problem while loading any built-in {@link DocumentProvider} implementations,
   * which is only done once.
   *
   * @param {DocumentProvider} provider - the {@link DocumentProvider} to be added
   * @return {Promise<void>} A <code>Promise</code> for the asynchronous loading of any built-in
   * {@link DocumentProvider} implementations.
   * @public
   */
  async add(provider) {
    await this.#addBuiltIns();

    debug('Adding provider: %s', provider);

    this.#providers.set(provider.getType(), provider);
  }

  /**
   * Removes all providers from this {@link DocumentService}.
   *
   * If this method has been called before any built-in {@link DocumentProvider} implementations have been loaded, it
   * will prevent them from being loaded at any point in the future of this {@link DocumentService} instance.
   *
   * @return {void}
   * @public
   */
  clear() {
    this.#builtInsAdded = true;

    debug('Removing all providers');

    this.#providers.clear();
  }

  /**
   * Returns the provider that matches the specified <code>type</code> within this {@link DocumentService}.
   *
   * The matching ignores case and any leading/trailing whitespace on <code>type</code>.
   *
   * An error will occur if there is a problem while loading any built-in {@link DocumentProvider} implementations,
   * which is only done once.
   *
   * @param {string} type - the type whose associated {@link DocumentProvider} implementation is to be returned
   * @return {Promise<DocumentProvider>} A <code>Promise</code> for the asynchronous loading of any built-in
   * {@link DocumentProvider} implementations that is resolved with the {@link DocumentProvider} associated with
   * <code>type</code> or <code>null</code> if none could be found.
   * @public
   */
  async findByType(type) {
    type = trim(type).toLowerCase();

    await this.#addBuiltIns();

    return this.#providers.get(type);
  }

  /**
   * Returns all of the providers for this {@link DocumentService}.
   *
   * An error will occur if there is a problem while loading any built-in {@link DocumentProvider} implementations,
   * which is only done once.
   *
   * @return {Promise<DocumentProvider[]>} A <code>Promise</code> for the asynchronous loading of any built-in
   * {@link DocumentProvider} implementations that is resolved with each {@link DocumentProvider}.
   * @public
   */
  async getAll() {
    await this.#addBuiltIns();

    return Array.from(this.#providers.values());
  }

  /**
   * Removes the specified <code>provider</code> from this {@link DocumentService}.
   *
   * An error will occur  there is a problem while loading any built-in {@link DocumentProvider} implementations, which
   * is only done once.
   *
   * @param {DocumentProvider} provider - the {@link DocumentProvider} to be removed
   * @return {Promise<void>} A <code>Promise</code> for the asynchronous loading of any built-in
   * {@link DocumentProvider} implementations.
   * @public
   */
  async remove(provider) {
    await this.#addBuiltIns();

    debug('Removing provider: %s', provider);

    this.#providers.delete(provider.getType());
  }

  /**
   * Removes the provider that matches the specified <code>type</code> from this {@link DocumentService}.
   *
   * The matching ignores case and any leading/trailing whitespace on <code>type</code>.
   *
   * An error will occur if there is a problem while loading any built-in {@link DocumentProvider} implementations,
   * which is only done once.
   *
   * @param {string} type - the type whose associated {@link DocumentProvider} implementation is to be removed
   * @return {Promise<void>} A <code>Promise</code> for the asynchronous loading of any built-in
   * {@link DocumentProvider} implementations.
   * @public
   */
  async removeByType(type) {
    type = trim(type).toLowerCase();

    await this.#addBuiltIns();

    debug('Removing provider for type: %s', type);

    this.#providers.delete(type);
  }

  /**
   * @return {Promise<void>}
   * @private
   */
  async #addBuiltIns() {
    if (this.#builtInsAdded) {
      return;
    }

    this.#builtInsAdded = true;

    const filePaths = await File.findFiles('**/*-document-provider.mjs', {
      absolute: true,
      cwd: fileURLToPath(new URL('.', import.meta.url))
    });

    for (const filePath of filePaths) {
      const mod = await import(filePath);
      if (typeof mod.default !== 'function') {
        throw new TypeError(`Default export of module not DocumentProvider implementation constructor: ${filePath}`);
      }
      const provider = new mod.default();
      if (!(provider instanceof DocumentProvider)) {
        throw new TypeError(`Default export of module not DocumentProvider implementation constructor: ${filePath}`);
      }

      debug('Adding internal provider: %s', provider);

      this.#providers.set(provider.getType(), provider);
    }
  }

}
