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

/* istanbul ignore file */

const _ = require('lodash');
const debug = require('debug')('brander:doc');

const DocumentProvider = require('./document-provider');
const File = require('../file');

const _addBuiltIns = Symbol('addBuiltIns');
const _builtInsAdded = Symbol('builtInsAdded');
const _privateKey = Symbol('privateKey');
const _providers = Symbol('providers');
const _singleton = Symbol('singleton');

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
class DocumentService {

  /**
   * Returns a singleton instance of {@link DocumentService}.
   *
   * @return {DocumentService} The singleton instance.
   * @public
   */
  static getInstance() {
    if (!DocumentService[_singleton]) {
      DocumentService[_singleton] = new DocumentService(_privateKey);
    }

    return DocumentService[_singleton];
  }

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
    if (privateKey !== _privateKey) {
      throw new Error('DocumentService constructor is private');
    }

    this[_builtInsAdded] = false;
    this[_providers] = new Map();
  }

  /**
   * Adds the specified <code>provider</code> to this {@link DocumentService}.
   *
   * An error will occur if there is a problem while loading any built-in {@link DocumentProvider} implementations,
   * which is only done once.
   *
   * @param {DocumentProvider} provider - the {@link DocumentProvider} to be added
   * @return {Promise.<void, Error>} A <code>Promise</code> for the asynchronous loading of any built-in
   * {@link DocumentProvider} implementations.
   * @public
   */
  async add(provider) {
    await this[_addBuiltIns]();

    debug('Adding provider: %s', provider);

    this[_providers].set(provider.getType(), provider);
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
    this[_builtInsAdded] = true;

    debug('Removing all providers');

    this[_providers].clear();
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
   * @return {Promise.<DocumentProvider, Error>} A <code>Promise</code> for the asynchronous loading of any built-in
   * {@link DocumentProvider} implementations that is resolved with the {@link DocumentProvider} associated with
   * <code>type</code> or <code>null</code> if none could be found.
   * @public
   */
  async findByType(type) {
    type = _.trim(type).toLowerCase();

    await this[_addBuiltIns]();

    return this[_providers].get(type);
  }

  /**
   * Returns all of the providers for this {@link DocumentService}.
   *
   * An error will occur if there is a problem while loading any built-in {@link DocumentProvider} implementations,
   * which is only done once.
   *
   * @return {Promise.<DocumentProvider[], Error>} A <code>Promise</code> for the asynchronous loading of any built-in
   * {@link DocumentProvider} implementations that is resolved with each {@link DocumentProvider}.
   * @public
   */
  async getAll() {
    await this[_addBuiltIns]();

    return Array.from(this[_providers]);
  }

  /**
   * Removes the specified <code>provider</code> from this {@link DocumentService}.
   *
   * An error will occur  there is a problem while loading any built-in {@link DocumentProvider} implementations, which
   * is only done once.
   *
   * @param {DocumentProvider} provider - the {@link DocumentProvider} to be removed
   * @return {Promise.<void, Error>} A <code>Promise</code> for the asynchronous loading of any built-in
   * {@link DocumentProvider} implementations.
   * @public
   */
  async remove(provider) {
    await this[_addBuiltIns]();

    debug('Removing provider: %s', provider);

    this[_providers].delete(provider.getType());
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
   * @return {Promise.<void, Error>} A <code>Promise</code> for the asynchronous loading of any built-in
   * {@link DocumentProvider} implementations.
   * @public
   */
  async removeByType(type) {
    type = _.trim(type).toLowerCase();

    await this[_addBuiltIns]();

    debug('Removing provider for type: %s', type);

    this[_providers].delete(type);
  }

  async [_addBuiltIns]() {
    if (this[_builtInsAdded]) {
      return;
    }

    this[_builtInsAdded] = true;

    const filePaths = await File.findFiles('**/*-document-provider.js', {
      absolute: true,
      cwd: __dirname
    });

    for (const filePath of filePaths) {
      /* eslint-disable global-require */
      const DocumentProviderImpl = require(filePath);
      /* eslint-enable global-require */
      const provider = new DocumentProviderImpl();
      if (!(provider instanceof DocumentProvider)) {
        throw new TypeError(`Non-document-provider implementation loaded from module: ${filePath}`);
      }

      debug('Adding internal provider: %s', provider);

      this[_providers].set(provider.getType(), provider);
    }
  }

}

module.exports = DocumentService;
