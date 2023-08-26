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

import _ from 'lodash';

import { ContextParser } from '../config/context-parser.mjs';
import { DocumentService } from './document-service.mjs';

/**
 * Capable of parsing {@link DocumentContext} information within a data set extracted from configuration data.
 *
 * It is <b>highly recommended</b> that document-related data is parsed all at once via
 * {@link DocumentContextParser#parseRemaining} so that it can be run all together to support dependencies (e.g.
 * table of contents need to know all available information).
 *
 * @public
 */
export class DocumentContextParser extends ContextParser {

  /**
   * @type {?string}
   * @private
   */
  #defaultType;
  /**
   * @type {?DocumentContext}
   * @private
   */
  #parent;

  /**
   * Creates an instance of {@link DocumentContextParser} with the specified <code>dataSet</code> and
   * <code>config</code>.
   *
   * Optionally, <code>defaultType</code> and <code>parent</code> can be provided to control the default type and parent
   * {@link DocumentContext} to be used respectively.
   *
   * If no <code>defaultType</code> is provided and data is found with no "type" configuration during parsing, then an
   * error will be thrown.
   *
   * If no <code>parent</code> is provided, the parsed {@link DocumentContext} should be of type "root", otherwise they
   * will be detached and will not be included in any generated documentation.
   *
   * @param {Object[]} dataSet - the data set to be parsed
   * @param {Config} config - the {@link Config} to be used
   * @param {?string} [defaultType] - the default type to be used (may be <code>null</code>)
   * @param {?DocumentContext} [parent] - the parent {@link DocumentContext} to be used (may be <code>null</code>)
   * @public
   */
  constructor(dataSet, config, defaultType, parent) {
    super(dataSet, config);

    this.#defaultType = defaultType;
    this.#parent = parent;
  }

  /**
   * @inheritdoc
   * @override
   */
  async parseData(data) {
    const type = _.trim(data.type) || this.#defaultType;
    if (!type) {
      throw new Error('"type" configuration is required');
    }

    const documentService = DocumentService.getInstance();
    const documentProvider = await documentService.findByType(type);
    if (!documentProvider) {
      throw new Error(`Unable to find provider for type: ${type}`);
    }

    const documentContext = await documentProvider.createContext(data, this.#parent, this.config);

    return [ documentContext ];
  }

}
