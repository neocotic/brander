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

const debug = require('debug')('brander:doc:table');
const pluralize = require('pluralize');

const DocumentContext = require('../document-context');
const DocumentProvider = require('../document-provider');

const _renderRow = Symbol('renderRow');
const _renderSeparator = Symbol('renderSeparator');
const _validateAndGet = Symbol('validateAndGet');

/**
 * An implementation of {@link DocumentProvider} that handles documents of the "table" type.
 *
 * Here's a basic example of the configuration for a table document:
 *
 * <pre>
 * {
 *   "type": "table",
 *   "headers": [
 *     "A",
 *     "B",
 *     "C"
 *   ],
 *   "rows": [
 *     [
 *       "A1",
 *       "B1",
 *       "C1"
 *     ],
 *     [
 *       "A2",
 *       "B2",
 *       "C2"
 *     ],
 *     ...
 *   ]
 * }
 * </pre>
 *
 * @public
 */
class TableDocumentProvider extends DocumentProvider {

  /**
   * @inheritdoc
   * @override
   */
  createContext(data, parent, config) {
    const type = this.getType();

    debug('Creating context for %s document...', type);

    return new DocumentContext(type, data, parent, config);
  }

  /**
   * @inheritdoc
   * @override
   */
  getType() {
    return 'table';
  }

  /**
   * @inheritdoc
   * @override
   */
  render(context) {
    const { config } = context;
    const type = this.getType();

    config.logger.log('Rendering %s document...', type);

    const headers = this[_validateAndGet](context, 'headers');
    const rows = this[_validateAndGet](context, 'rows', true);
    const output = [];

    if (headers) {
      debug('Rendering %d %s for %s document', headers.length, pluralize('header', headers.length), type);

      output.push(this[_renderRow](headers));
      output.push(this[_renderSeparator](headers));
    }

    debug('Rendering %d %s for %s document', rows.length, pluralize('row', rows.length), type);

    for (const columns of rows) {
      output.push(this[_renderRow](columns));
    }

    return output.join(config.lineSeparator);
  }

  [_renderRow](columns) {
    const output = [];

    for (const column of columns) {
      output.push(` ${column} `);
    }

    return `|${output.join('|')}|`;
  }

  [_renderSeparator](columns) {
    const output = [];

    for (const column of columns) {
      const columnStr = String(column);

      output.push(` ${'-'.repeat(columnStr.length)} `);
    }

    return `|${output.join('|')}|`;
  }

  [_validateAndGet](context, name, required) {
    const value = context.get(name);
    if (!value && required) {
      throw new Error(`"${name}" configuration is required`);
    }
    if (value && !Array.isArray(value)) {
      throw new Error(`"${name}" configuration must be an array`);
    }

    return value;
  }

}

module.exports = TableDocumentProvider;
