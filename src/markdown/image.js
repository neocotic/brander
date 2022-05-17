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

/**
 * Appends the syntax for a Markdown image created using the <code>options</code> provided to the specified
 * <code>output</code>.
 *
 * @param {string[]} output - the array to which the Markdown image is to be appended
 * @param {appendMarkdownImage~Options} options - the options to be used
 * @public
 */
function appendMarkdownImage(output, options) {
  output.push(createMarkdownImage(options));
}

/**
 * Creates the syntax for a Markdown image using the <code>options</code> provided.
 *
 * @param {createMarkdownImage~Options} options - the options to be used
 * @return {string} The Markdown image.
 * @public
 */
function createMarkdownImage(options) {
  const alt = options.alt || '';
  const title = options.title || '';
  const url = options.url || '';

  let markdown = `![${alt}](${url}`;
  if (title) {
    markdown += ` "${title}"`;
  }
  markdown += ')';

  return markdown;
}

module.exports = {
  appendMarkdownImage,
  createMarkdownImage
};

/**
 * The options that can be passed to {@link appendMarkdownImage}.
 *
 * @typedef {createMarkdownImage~Options} appendMarkdownImage~Options
 */

/**
 * The options that can be passed to {@link createMarkdownImage}.
 *
 * @typedef {Object} createMarkdownImage~Options
 * @property {?string} alt - The alternative text for the Markdown image.
 * @property {?string} [title] - The title for the Markdown image.
 * @property {?string} url - The URL for the Markdown image.
 */
