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

import { DocumentContext } from '../document-context.mjs';

/**
 * An implementation of {@link DocumentContext} for root documents.
 *
 * While it's possible to create an instance using the constructor, it's highly recommended that
 * {@link DocumentContextParser} and/or {@link RootDocumentProvider} is used instead.
 *
 * @public
 */
export class RootDocumentContext extends DocumentContext {

  /**
   * @type {File}
   * @private
   */
  #file;

  /**
   * Creates an instance of {@link RootDocumentContext}.
   *
   * @param {string} type - the type to be used
   * @param {File} file - the {@link File} to which the document output is to be written
   * @param {Object} data - the data to be used
   * @param {Config} config - the {@link Config} to be used
   * @public
   */
  constructor(type, file, data, config) {
    super(type, data, null, config);

    this.#file = file;
  }

  /**
   * @inheritdoc
   * @override
   */
  isRoot() {
    return true;
  }

  /**
   * Returns the {@link File} to which the output for this {@link RootDocumentContext} is to be written.
   *
   * @return {File} The file.
   * @public
   */
  get file() {
    return this.#file;
  }

}
