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

/**
 * Appends the syntax for a Markdown link created using the <code>options</code> provided to the specified
 * <code>output</code>.
 *
 * @param {string[]} output - the array to which the Markdown link is to be appended
 * @param {appendMarkdownLink~Options} options - the options to be used
 * @public
 */
export function appendMarkdownLink(output, options) {
  output.push(createMarkdownLink(options));
}

/**
 * Creates the syntax for a Markdown link using the <code>options</code> provided.
 *
 * @param {createMarkdownLink~Options} options - the options to be used
 * @return {string} The Markdown link.
 * @public
 */
export function createMarkdownLink(options) {
  const content = options.content || '';
  const url = options.url || '';

  return `[${content}](${url})`;
}

/**
 * The options that can be passed to {@link appendMarkdownLink}.
 *
 * @typedef {createMarkdownLink~Options} appendMarkdownLink~Options
 */

/**
 * The options that can be passed to {@link createMarkdownLink}.
 *
 * @typedef {Object} createMarkdownLink~Options
 * @property {?string} content - The content for the Markdown link.
 * @property {?string} url - The URL for the Markdown link.
 */
