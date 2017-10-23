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

const _ = require('lodash');

const File = require('../../file');
const DocumentContext = require('../document-context');
const DocumentProvider = require('../document-provider');

// TODO: Add debug logging

/**
 * TODO: document
 *
 * @public
 */
class TemplateDocumentProvider extends DocumentProvider {

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
    return 'template';
  }

  /**
   * @inheritdoc
   * @override
   */
  async render(context) {
    let content = context.get('content');
    const file = _.trim(context.get('file'));
    if (content == null && !file) {
      throw new Error('"content" or "file" configuration is required');
    }
    if (content != null && file) {
      throw new Error('"content" or "file" configurations cannot both be specified');
    }

    if (file) {
      content = await File.readFile(context.config.docPath(file), 'utf8');
    }

    return context.config.evaluate(_.trim(content));
  }

}

module.exports = TemplateDocumentProvider;
