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
const fs = require('fs');
const path = require('path');
const util = require('util');

const writeFile = util.promosify(fs.writeFile);

const DocumentContextParser = require('../document-context-parser');
const DocumentContextRunner = require('../document-context-runner');
const DocumentProvider = require('../document-provider');
const File = require('../../file');
const RootDocumentContext = require('./root-document-context');

// TODO: Add debug logging

/**
 * TODO: document
 *
 * @public
 */
class RootDocumentProvider extends DocumentProvider {

  /**
   * @inheritdoc
   * @override
   */
  async createContext(data, parent, config) {
    if (parent) {
      throw new Error('"root" document cannot have parent');
    }

    const dirPath = config.docPath(_.trim(data.dir) || '.');
    const fileName = _.trim(data.doc);
    if (!fileName) {
      throw new Error('"doc" configuration is required');
    }

    const format = _.trim(data.format).toLowerCase() || path.extname(fileName).substring(1).toLowerCase() || null;
    // TODO: Support more formats
    if (format !== 'md' && format !== 'markdown') {
      throw new Error(`"format" configuration unsupported: ${format}`);
    }

    const file = new File(dirPath, fileName, format, config)
      .evaluate();
    const rootContext = new RootDocumentContext(this, file, data, parent, config);

    const footer = config.option('docs.footer');
    const header = config.option('docs.header');
    const sections = _.clone(rootContext.get('sections')) || [];
    if (header) {
      sections.unshift(header);
    }
    if (footer) {
      sections.push(footer);
    }

    if (!_.isEmpty(sections)) {
      const documentContextParser = new DocumentContextParser(sections, config, null, rootContext);
      const childContexts = await documentContextParser.parseRemaining();

      rootContext.children.push(...childContexts);
    }

    return rootContext;
  }

  /**
   * @inheritdoc
   * @override
   */
  getType() {
    return 'root';
  }

  /**
   * @inheritdoc
   * @override
   */
  async render(context) {
    const documentContextRunner = new DocumentContextRunner(context.children);
    const results = await documentContextRunner.run();
    const output = results.join(context.config.lineSeparator);

    await writeFile(context.file.absolute, output);

    return output;
  }

}

module.exports = RootDocumentProvider;
