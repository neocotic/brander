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

/* eslint "max-params": "off" */

// TODO: complete

const _ = require('lodash');

const DocumentContext = require('../document-context');
const DocumentProvider = require('../document-provider');

const _getDocumentContexts = Symbol('getDocumentContexts');
const _renderAtDepth = Symbol('renderAtDepth');
const _renderTOCRow = Symbol('renderTOCRow');

// TODO: Add debug logging

/**
 * TODO: document
 *
 * @public
 */
class TOCDocumentProvider extends DocumentProvider {

  /**
   * @inheritdoc
   * @override
   */
  createContext(data, parent, config) {
    return new DocumentContext(this.getType(), data, parent, config);
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
    let index = 0;
    const maxDepth = context.get('maxDepth', -1);
    const minDepth = context.get('minDepth', 1);
    const output = [];
    const titleMap = new Map();

    for (const rootContext of this[_getDocumentContexts](context)) {
      output.push(...this[_renderAtDepth](rootContext, [ rootContext ], 0, index++, minDepth, maxDepth, titleMap));
    }

    return output.join(context.config.lineSeparator);
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

    for (const context of contexts) {
      if (context.depth < min) {
        output.push(...this[_renderAtDepth](root, context.children, depth, 0, min, max, titleMap));
      } else if (max === -1 || context.depth <= max) {
        if (context.title) {
          output.push(this[_renderTOCRow](root, context, depth, ++index, titleMap));
        }

        output.push(...this[_renderAtDepth](root, context.children, depth + 1, 0, min, max, titleMap));
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

    return `${' '.repeat(depth * 4)}${index}. [${title}](${url})`;
  }

}

module.exports = TOCDocumentProvider;
