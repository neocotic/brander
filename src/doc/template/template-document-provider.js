/*
 * Copyright (C) 2018 Alasdair Mercer, !ninja
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

const _ = require('lodash');
const chalk = require('chalk');
const debug = require('debug')('brander:doc:template');

const File = require('../../file');
const DocumentContext = require('../document-context');
const DocumentProvider = require('../document-provider');

/**
 * An implementation of {@link DocumentProvider} that handles documents of the "template" type.
 *
 * A very useful implementation which can be used to output strings evaluated as an {@link Expression}. The expression
 * string can be specified directly or read from a file.
 *
 * Here's a basic example of the configuration for a template document:
 *
 * <pre>
 * {
 *   "type": "template",
 *   "content": "Hello, we are <%= config.title %>!"
 * }
 * </pre>
 *
 * Alternatively, here's an example of loading the template from a file:
 *
 * <pre>
 * {
 *   "type": "template",
 *   "file": "_templates/greeting.md"
 * }
 * </pre>
 *
 * The extension/format of the file is ignored and the contents are simply read as plain text.
 *
 * @public
 */
class TemplateDocumentProvider extends DocumentProvider {

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
    return 'template';
  }

  /**
   * @inheritdoc
   * @override
   */
  async render(context) {
    const { config } = context;
    const type = this.getType();

    config.logger.log('Rendering %s document...', type);

    let content = context.get('content');
    const file = _.trim(context.get('file'));
    if (content == null && !file) {
      throw new Error('"content" or "file" configuration is required');
    }
    if (content != null && file) {
      throw new Error('"content" or "file" configurations cannot both be specified');
    }

    if (file) {
      const filePath = config.resolve(file);

      config.logger.log('Reading %s document content from file: %s', type, chalk.blue(config.relative(filePath)));

      content = await File.readFile(filePath, 'utf8');
    }

    return config.evaluate(content);
  }

}

module.exports = TemplateDocumentProvider;
