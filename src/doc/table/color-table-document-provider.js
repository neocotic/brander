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

const Color = require('../../color');
const DocumentContext = require('../document-context');
const DocumentProvider = require('../document-provider');

const _renderHeaders = Symbol('renderHeaders');
const _renderRow = Symbol('renderRow');
const _renderSeparator = Symbol('renderSeparator');
const _validateAndGet = Symbol('validateAndGet');

// TODO: Add debug logging

/**
 * TODO: document
 *
 * @public
 */
class ColorTableDocumentProvider extends DocumentProvider {

  /**
   * @inheritdoc
   * @override
   */
  async createContext(data, parent, config) {
    return new DocumentContext(this, data, parent, config);
  }

  /**
   * @inheritdoc
   * @override
   */
  getType() {
    return 'color-table';
  }

  /**
   * @inheritdoc
   * @override
   */
  async render(context) {
    const colors = this[_validateAndGet](context, 'colors')
      .map((color) => new Color(color));
    const columns = this[_validateAndGet](context, 'columns');
    const output = [];

    output.push(this[_renderHeaders](columns));
    output.push(this[_renderSeparator](columns));

    for (const color of colors) {
      output.push(this[_renderRow](color, context, columns));
    }

    return output.join(context.config.lineSeparator);
  }

  [_renderHeaders](columns) {
    const output = [];

    for (const column of columns) {
      output.push(` ${column.header} `);
    }

    return `|${output.join('|')}|`;
  }

  [_renderRow](color, context, columns) {
    const output = [];

    for (const column of columns) {
      output.push(` ${context.evaluate(column.content, { color })} `);
    }

    return `|${output.join('|')}|`;
  }

  [_renderSeparator](columns) {
    const output = [];

    for (const column of columns) {
      output.push('-'.repeat(column.header.length + 2));
    }

    return `|${output.join('|')}|`;
  }

  [_validateAndGet](context, name) {
    const value = context.get(name);
    if (!value) {
      throw new Error(`"${name}" configuration is required`);
    }
    if (value && !Array.isArray(value)) {
      throw new Error(`"${name}" configuration must be an array`);
    }

    return value;
  }

}

module.exports = ColorTableDocumentProvider;
