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
import pollock from 'pollock';

import { DocumentContext } from './document-context.mjs';

/**
 * Responsible for creating {@link DocumentContext} instances of an associated type based on configuration data and
 * rendering output based on those instances to generate documentation.
 *
 * @public
 * @abstract
 */
export class DocumentProvider {

  /**
   * Creates an instance of {@link DocumentContext} based on the information provided.
   *
   * It is <i>always</i> recommended that {@link DocumentProvider#getType} is called to be compared to the type of
   * <code>context</code> before calling this method to ensure that this {@link DocumentProvider} supports the document
   * type.
   *
   * An error will occur if there is a problem creating the {@link DocumentContext}.
   *
   * @param {Object} data - the data to be used
   * @param {?DocumentContext} parent - the parent {@link DocumentContext} to be used (may be <code>null</code> if there
   * is no parent)
   * @param {Config} config - the {@link Config} to be used
   * @return {Promise<DocumentContext>} A <code>Promise</code> for any asynchronous work that is resolved with the newly
   * created {@link DocumentContext}.
   * @public
   */
  async createContext(data, parent, config) {
    const type = this.getType();

    Debug(`brander:doc:${type}`)('Creating context for %s document...', type);

    return new DocumentContext(type, data, parent, config);
  }

  /**
   * Renders a title for the specified <code>context</code>, where possible.
   *
   * The title will only be rendered if <code>context</code> has one. Otherwise, this method will return an empty
   * string.
   *
   * @param {DocumentContext} context - the {@link DocumentContext} whose title is to be rendered
   * @return {string} The rendered title of <code>context</code> or an empty string if it has none.
   * @public
   */
  renderTitle(context) {
    return context.title ? `${'#'.repeat(context.depth + 1)} ${context.title}${context.config.lineSeparator}` : '';
  }

  /**
   * @override
   */
  toString() {
    return `DocumentProvider(${this.getType()})`;
  }

}

/**
 * Returns the type of this {@link DocumentProvider}.
 *
 * The type is used to categorize documents so that they can be easily and quickly looked up. This
 * {@link DocumentProvider} should only produce and render {@link DocumentContext} instances of the same type, however,
 * they may contain children of varying types.
 *
 * It is <i>always</i> recommended to called this method before calling {@link DocumentProvider#createContext} and
 * {@link DocumentProvider#render} to ensure that this {@link DocumentProvider} supports the document type.
 *
 * All implementations of {@link DocumentProvider} <b>must</b> override this method.
 *
 * @return {string} The type.
 * @public
 * @abstract
 * @memberof DocumentProvider#
 * @method getType
 */
pollock(DocumentProvider, 'getType');

/**
 * Renders the specified <code>context</code>.
 *
 * If <code>context</code> has any children, this {@link DocumentProvider} is also responsible for ensuring that they
 * are also rendered accordingly.
 *
 * It is <i>always</i> recommended that {@link DocumentProvider#getType} is called to be compared to the type of
 * <code>context</code> before calling this method to ensure that this {@link DocumentProvider} supports the document
 * type.
 *
 * An error will occur if a problem arises during rendering.
 *
 * All implementations of {@link DocumentProvider} <b>must</b> override this method.
 *
 * @param {DocumentContext} context - the {@link DocumentContext} to be rendered
 * @return {Promise<string>} A <code>Promise</code> for the asynchronous rendering that is resolved with the output
 * string.
 * @public
 * @abstract
 * @memberof DocumentProvider#
 * @method render
 */
pollock(DocumentProvider, 'render', { promise: true });
