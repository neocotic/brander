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

/* istanbul ignore file */

import _ from 'lodash';
import Debug from 'debug';
import pluralize from 'pluralize';

import { DocumentContext } from '../document-context.mjs';
import { DocumentContextParser } from '../document-context-parser.mjs';
import { DocumentContextRunner } from '../document-context-runner.mjs';
import { DocumentProvider } from '../document-provider.mjs';

const debug = Debug('brander:doc:container');

/**
 * An implementation of {@link DocumentProvider} that handles documents of the "container" type.
 *
 * This is very similar to {@link RootDocumentProvider}, however, it doesn't have the overheard of being written
 * directly to a file and can be nested at any level within a document.
 *
 * Here's a basic example of the configuration for a container document:
 *
 * <pre>
 * {
 *   "type": "container",
 *   "title": "Instructions",
 *   "sections": [
 *     {
 *       "type": "template",
 *       "file": "_templates/instructions/intro.md"
 *     },
 *     {
 *       "type": "hr"
 *     },
 *     {
 *       "type": "template",
 *       "title": "Usage",
 *       "file": "_templates/instructions/steps.md"
 *     },
 *     ...
 *   ]
 * }
 * </pre>
 *
 * @public
 */
export default class ContainerDocumentProvider extends DocumentProvider {

  /**
   * @inheritdoc
   * @override
   */
  async createContext(data, parent, config) {
    const type = this.getType();

    debug('Creating context for %s document...', type);

    const mainContext = new DocumentContext(type, data, parent, config);
    const sections = _.clone(mainContext.get('sections')) || [];

    debug('%d %s found for %s document', sections.length, pluralize('child', sections.length), type);

    if (!_.isEmpty(sections)) {
      debug('Creating child contexts for %s document', type);

      const documentContextParser = new DocumentContextParser(sections, config, null, mainContext);
      const childContexts = await documentContextParser.parseRemaining();

      mainContext.children.push(...childContexts);
    }

    return mainContext;
  }

  /**
   * @inheritdoc
   * @override
   */
  getType() {
    return 'container';
  }

  /**
   * @inheritdoc
   * @override
   */
  async render(context) {
    const { config } = context;
    const type = this.getType();

    config.logger.log('Rendering %s document...', type);

    debug('Rendering child contexts for %s document', type);

    const documentContextRunner = new DocumentContextRunner(context.children, config);
    const results = await documentContextRunner.run();
    const output = _.compact(results);

    return output.join(config.lineSeparator);
  }

}
