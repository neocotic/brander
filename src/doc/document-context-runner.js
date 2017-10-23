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

const ContextRunner = require('../config/context-runner');

/**
 * Capable of running {@link DocumentContext} instances sequentially which can either be provided directly or extracted
 * iteratively via a {@link DocumentContextParser}, however, it's <b>highly recommended</b> to use the former as this
 * can help ensure that document -related data is parsed all together so that it can be run all together to support
 * dependencies (e.g. table of contents need to know all available information).
 *
 * @public
 */
class DocumentContextRunner extends ContextRunner {

  /**
   * @inheritdoc
   * @override
   */
  runContext(context) {
    const { provider } = context;

    // TODO: should this render titles on behalf of the context?

    return provider.render(context);
  }

}

module.exports = DocumentContextRunner;
