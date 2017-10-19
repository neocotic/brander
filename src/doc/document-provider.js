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

// TODO: complete

const pollock = require('pollock');

/**
 * TODO: document
 *
 * @public
 * @abstract
 */
class DocumentProvider {

  /**
   * @override
   */
  toString() {
    return `DocumentProvider(${this.getType()})`;
  }

}

/**
 * TODO: document
 *
 * All implementations of {@link DocumentProvider} <b>must</b> override this method.
 *
 * @param {Object} data -
 * @param {?DocumentContext} parent -
 * @param {Config} config -
 * @return {Promise.<DocumentContext, Error>}
 * @public
 * @abstract
 * @memberof DocumentProvider#
 * @method createContext
 */
pollock(DocumentProvider, 'createContext', { promise: true });

/**
 * TODO: document
 *
 * All implementations of {@link DocumentProvider} <b>must</b> override this method.
 *
 * @return {string}
 * @public
 * @abstract
 * @memberof DocumentProvider#
 * @method getType
 */
pollock(DocumentProvider, 'getType');

/**
 * TODO: document
 *
 * All implementations of {@link DocumentProvider} <b>must</b> override this method.
 *
 * @param {DocumentContext} context -
 * @return {Promise.<string, Error>}
 * @public
 * @abstract
 * @memberof DocumentProvider#
 * @method render
 */
pollock(DocumentProvider, 'render', { promise: true });

module.exports = DocumentProvider;
