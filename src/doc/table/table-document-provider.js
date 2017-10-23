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

const DocumentContext = require('../document-context');
const DocumentProvider = require('../document-provider');

const _renderRow = Symbol('renderRow');
const _renderSeparator = Symbol('renderSeparator');
const _validateAndGet = Symbol('validateAndGet');

// TODO: Add debug logging

/**
 * TODO: document
 *
 * @public
 */
class TableDocumentProvider extends DocumentProvider {

  /**
   * @inheritdoc
   * @override
   */
  createContexts(data, parent, config) {
    const context = new DocumentContext(this, data, parent, config);

    return [ context ];
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
    const headers = this[_validateAndGet](context, 'headers');
    const rows = this[_validateAndGet](context, 'rows', true);
    const output = [];

    if (headers) {
      output.push(this[_renderRow](headers));
      output.push(this[_renderSeparator](headers));
    }

    for (const columns of rows) {
      output.push(this[_renderRow](columns));
    }

    return output.join(context.config.lineSeparator);
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

      output.push('-'.repeat(columnStr.length + 2));
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
