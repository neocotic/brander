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

const _ = require('lodash');
const chalk = require('chalk');
const debug = require('debug')('brander:doc:root');
const pluralize = require('pluralize');

const DocumentContextParser = require('../document-context-parser');
const DocumentContextRunner = require('../document-context-runner');
const DocumentProvider = require('../document-provider');
const File = require('../../file');
const RootDocumentContext = require('./root-document-context');
const { createMarkdownHorizontalRule } = require('../../markdown/horizontal-rule');
const { createMarkdownLink } = require('../../markdown/link');

const _getDefaultFooter = Symbol('getDefaultFooter');

/**
 * An implementation of {@link DocumentProvider} that handles documents of the "root" type.
 *
 * <code>RootDocumentProvider</code> instances will handle creating and rendering all {@link DocumentContext} children
 * and writing the rendered output to the configured file.
 *
 * Here's a basic example of the configuration for a root document:
 *
 * <pre>
 * {
 *   "doc": "guidelines.md",
 *   "title": "Guidelines",
 *   "sections": [
 *     {
 *       "type": "template",
 *       "file": "_templates/guidelines/intro.md"
 *     },
 *     {
 *       "type": "toc"
 *     },
 *     {
 *       "type": "template",
 *       "title": "Usage",
 *       "file": "_templates/guidelines/usage.md"
 *     },
 *     ...
 *   ]
 * }
 * </pre>
 *
 * @public
 */
class RootDocumentProvider extends DocumentProvider {

  /**
   * @inheritdoc
   * @override
   */
  async createContext(data, parent, config) {
    const type = this.getType();

    if (parent) {
      throw new Error(`"${type}" document cannot have parent`);
    }

    const dirPath = config.resolve(_.trim(data.dir) || config.docsDir);
    const fileName = _.trim(data.doc);
    if (!fileName) {
      throw new Error('"doc" configuration is required');
    }

    const format = File.deriveFormat(fileName, data.format);
    if (format !== 'md' && format !== 'markdown') {
      throw new Error(`"format" configuration unsupported: ${format}`);
    }

    debug('Applying "%s" format to %s document: %s', format, type, chalk.blue(fileName));

    const file = new File(dirPath, fileName, format, config)
      .evaluate();
    const rootContext = new RootDocumentContext(type, file, data, config);

    debug('Creating context for %s document: %s', type, chalk.blue(fileName));

    const footer = config.option('docs.footer') || this[_getDefaultFooter](config);
    const header = config.option('docs.header');
    const sections = _.clone(rootContext.get('sections')) || [];
    if (header) {
      debug('Header will be applied to %s document: %s', type, chalk.blue(fileName));

      sections.unshift(header);
    }
    if (footer) {
      debug('Footer will be applied to %s document: %s', type, chalk.blue(fileName));

      sections.push(footer);
    }

    debug('%d %s found for %s document: %s', sections.length, pluralize('child', sections.length), type,
      chalk.blue(fileName));

    if (!_.isEmpty(sections)) {
      debug('Creating child contexts for %s document: %s', type, chalk.blue(fileName));

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
    const { config, file } = context;
    const type = this.getType();

    config.logger.log('Rendering %s document file: %s', type, chalk.blue(file.relative));

    debug('Rendering child contexts for %s document: %s', type, chalk.blue(file.name));

    const documentContextRunner = new DocumentContextRunner(context.children, config);
    const results = await documentContextRunner.run();
    const title = this.renderTitle(context);
    const output = title ? [ title ] : [];

    output.push(..._.compact(results));

    config.logger.log('Writing rendered output to %s document file: %s', type, chalk.blue(file.relative));

    await File.writeFile(file.absolute, output.join(config.lineSeparator));

    return output;
  }

  [_getDefaultFooter](config) {
    if (config.option('docs.disableDefaultFooter')) {
      return null;
    }

    const hr = createMarkdownHorizontalRule();
    const link = createMarkdownLink({ content: 'Brander', url: 'https://github.com/neocotic/brander' });

    return {
      type: 'template',
      content: `${hr}<%= eol.repeat(2) %>Generated by ${link}`
    };
  }

}

module.exports = RootDocumentProvider;
