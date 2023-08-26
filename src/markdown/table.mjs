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

import { EOL } from 'node:os';

/**
 * Appends the syntax for a Markdown table created using the <code>options</code> provided to the specified
 * <code>output</code>.
 *
 * @param {string[]} output - the array to which the Markdown table is to be appended
 * @param {appendMarkdownTable~Options} options - the options to be used
 * @public
 */
export function appendMarkdownTable(output, options) {
  const headers = options.headers || [];
  const rows = options.rows || [];

  if (headers.length) {
    output.push(createMarkdownTableRow(headers));
    output.push(createMarkdownTableDivider(headers));
  }

  for (const columns of rows) {
    output.push(createMarkdownTableRow(columns));
  }
}

/**
 * Creates the syntax for a Markdown table using the <code>options</code> provided.
 *
 * @param {createMarkdownTable~Options} options - the options to be used
 * @return {string} The Markdown table.
 * @public
 */
export function createMarkdownTable(options) {
  const lineSeparator = options.lineSeparator || EOL;
  const output = [];

  appendMarkdownTable(output, options);

  return output.join(lineSeparator);
}

/**
 * Creates the syntax for a Markdown table divider with each column matching the width of the <code>headers</code>
 * provided.
 *
 * @param {*[]} headers - the header column values to be used
 * @return {string} The Markdown table divider.
 * @private
 */
function createMarkdownTableDivider(headers) {
  const output = [];

  for (const header of headers) {
    const headerStr = `${header}`;

    output.push(` ${'-'.repeat(headerStr.length)} `);
  }

  return `|${output.join('|')}|`;
}

/**
 * Creates the syntax for a Markdown table row using the <code>columns</code> provided.
 *
 * @param {*[]} columns - the column values to be used
 * @return {string} The Markdown table row.
 * @private
 */
function createMarkdownTableRow(columns) {
  const output = [];

  for (const column of columns) {
    output.push(` ${column} `);
  }

  return `|${output.join('|')}|`;
}

/**
 * The options that can be passed to {@link appendMarkdownTable}.
 *
 * @typedef {Object} appendMarkdownTable~Options
 * @property {?Array} [headers] - The header columns for the Markdown table.
 * @property {?Array<Array>} [rows] - The row columns for the Markdown table.
 */

/**
 * The options that can be passed to {@link createMarkdownTable}.
 *
 * @typedef {appendMarkdownTable~Options} createMarkdownTable~Options
 * @property {?string} [lineSeparator] - The line separator for the Markdown table.
 */
