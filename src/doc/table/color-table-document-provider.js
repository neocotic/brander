/*
 * Copyright (C) 2022 neocotic
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

const Color = require('../../color');
const DocumentContext = require('../document-context');
const DocumentProvider = require('../document-provider');
const { createMarkdownTable } = require('../../markdown/table');

const _validateAndGet = Symbol('validateAndGet');

/**
 * An implementation of {@link DocumentProvider} that handles documents of the "color-table" type.
 *
 * This is very similar to {@link TableDocumentProvider} in output but just as simple in configuration for creating a
 * table containing color information.
 *
 * Here's a basic example of the configuration for a color-table document:
 *
 * <pre>
 * {
 *   "type": "color-table",
 *   "colors": [
 *     {
 *       "name": "Black",
 *       "format": "hex",
 *       "value": "#000000"
 *     },
 *     {
 *       "name": "White",
 *       "format": "hex",
 *       "value": "#FFFFFF"
 *     },
 *     {
 *       "name": "Primary",
 *       "format": "cmyk",
 *       "value": [ 42, 100, 0, 49 ]
 *     },
 *     {
 *       "name": "Secondary",
 *       "format": "rgb",
 *       "value": [ 119, 0, 207 ]
 *     }
 *   ],
 *   "columns": [
 *     {
 *       "header": "Color",
 *       "content": "<%= color.name %>"
 *     },
 *     {
 *       "header": "Hex",
 *       "content": "<%= color.hex %>"
 *     },
 *     {
 *       "header": "RGB",
 *       "content": "<%= color.rgb %>"
 *     },
 *     {
 *       "header": "CMYK",
 *       "content": "<%= color.cmyk %>"
 *     }
 *   ]
 * }
 * </pre>
 *
 * @public
 */
class ColorTableDocumentProvider extends DocumentProvider {

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
    return 'color-table';
  }

  /**
   * @inheritdoc
   * @override
   */
  render(context) {
    const { config } = context;
    const type = this.getType();

    config.logger.log('Rendering %s document...', type);

    const colors = this[_validateAndGet](context, 'colors').map((color) => new Color(color));
    const columns = this[_validateAndGet](context, 'columns');
    const headers = columns.map((column) => column.header);
    const rows = colors.map((color) => columns.map((column) => context.config.evaluate(column.content, { color })));

    debug('Rendering %d %s and %d %s for %s document', headers.length, pluralize('header', headers.length), rows.length,
      pluralize('row', rows.length), type);

    return createMarkdownTable({
      headers,
      lineSeparator: config.lineSeparator,
      rows
    });
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
