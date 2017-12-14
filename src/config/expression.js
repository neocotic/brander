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

/* istanbul ignore file */

const _ = require('lodash');

const _compiled = Symbol('compiled');

/**
 * Compiles a raw expression string so that it can be evaluated, optionally using data passed in directly to it to
 * expose more variables during evaluation.
 *
 * @public
 */
class Expression {

  /**
   * Creates an instance of {@link Expression} for the raw expression string provided.
   *
   * @param {?string} str - the raw expression string to be compiled (may be <code>null</code>)
   * @public
   */
  constructor(str) {
    this[_compiled] = _.template(str);
  }

  /**
   * Evaluates this {@link Expression} by interpolating data properties and executing embedded JavaScript.
   *
   * Optionally, <code>data</code> can be provided to expose more variables during evaluation.
   *
   * A <code>_</code> variable will always be available that provides access to the Lodash library.
   *
   * @param {Object} [data] - an object whose properties will be exposed as variables
   * @return {string} The evaluated output.
   * @public
   */
  evaluate(data) {
    return this[_compiled](data);
  }

}

module.exports = Expression;
