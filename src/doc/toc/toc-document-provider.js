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

/* eslint "max-params": "off" */
/* istanbul ignore file */

const _ = require('lodash');
const chalk = require('chalk');
const debug = require('debug')('brander:doc:toc');
const pluralize = require('pluralize');

const DocumentContext = require('../document-context');
const DocumentProvider = require('../document-provider');
const { createMarkdownLink } = require('../../markdown/link');

const _getDocumentContexts = Symbol('getDocumentContexts');
const _renderAtDepth = Symbol('renderAtDepth');
const _renderTOCRow = Symbol('renderTOCRow');

/**
 * An implementation of {@link DocumentProvider} that handles documents of the "toc" type.
 *
 * Here's a basic example of the configuration for a toc document:
 *
 * <pre>
 * {
 *   "type": "toc",
 *   "maxDepth": 1
 * }
 * </pre>
 *
 * Alternatively, here's an example of generating the TOC for multiple documents:
 *
 * <pre>
 * {
 *   "type": "toc",
 *   "docs": [
 *     "guidelines.md",
 *     "colors.md",
 *     "assets.md"
 *   ],
 *   "minDepth": 0,
 *   "maxDepth": 1
 * }
 * </pre>
 *
 * @public
 */
class TOCDocumentProvider extends DocumentProvider {

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
    return 'toc';
  }

  /**
   * @inheritdoc
   * @override
   */
  render(context) {
    const { config } = context;
    const type = this.getType();

    config.logger.log('Rendering %s document...', type);

    let index = 0;
    const maxDepth = context.get('maxDepth', -1);
    const minDepth = context.get('minDepth', 1);
    const output = [];
    const titleMap = new Map();

    for (const rootContext of this[_getDocumentContexts](context)) {
      debug('Diving into %s document: %s', rootContext.type, chalk.blue(rootContext.file.name));

      output.push(...this[_renderAtDepth](rootContext, [ rootContext ], 0, index++, minDepth, maxDepth, titleMap));
    }

    return output.join(config.lineSeparator);
  }

  [_getDocumentContexts](context) {
    const docs = context.get('docs');
    if (!docs) {
      const { root } = context;
      if (root) {
        return [ root ];
      }
    }

    const rootMap = new Map();
    for (const availableContext of context.config.scope.docs) {
      if (availableContext.isRoot()) {
        rootMap.set(availableContext.file.base(), availableContext);
      }
    }

    debug('%d root %s found in configuration', rootMap.size, pluralize('document', rootMap.size));

    return docs.map((doc, index) => {
      doc = _.trim(doc);

      const rootContext = rootMap.get(doc);
      if (!rootContext) {
        throw new Error(`Unable to find root document[${index}]: ${doc}`);
      }

      return rootContext;
    });
  }

  [_renderAtDepth](root, contexts, depth, index, min, max, titleMap) {
    const output = [];
    const type = this.getType();

    for (const context of contexts) {
      if (context.depth < min) {
        debug('Depth of %s context too low so diving into children: %d', context.type, context.depth);

        output.push(...this[_renderAtDepth](root, context.children, depth, 0, min, max, titleMap));
      } else if (max === -1 || context.depth <= max) {
        if (context.title) {
          output.push(this[_renderTOCRow](root, context, depth, ++index, titleMap));
        } else {
          debug('%s context has no title so excluding from %s document', context.type, type);
        }

        output.push(...this[_renderAtDepth](root, context.children, depth + 1, 0, min, max, titleMap));
      } else {
        debug('Depth of %s context too high so ignoring: %d', context.type, context.depth);
      }
    }

    return output;
  }

  [_renderTOCRow](root, context, depth, index, titleMap) {
    const { title } = context;
    let titleFragment;

    if (!context.isRoot()) {
      let titleCount = titleMap.get(title) || 0;
      titleCount++;

      titleMap.set(title, titleCount);

      if (titleCount > 1) {
        titleFragment = `${title}-${titleCount}`;
      } else {
        titleFragment = title;
      }
    }

    const url = context.config.docURL(root.file.relative, titleFragment);
    const link = createMarkdownLink({
      content: title,
      url
    });

    return `${' '.repeat(depth * 4)}${index}. ${link}`;
  }

}

module.exports = TOCDocumentProvider;
