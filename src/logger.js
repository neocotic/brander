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

const chalk = require('chalk');
const { EOL } = require('os');
const util = require('util');

const _errorStream = Symbol('errorStream');
const _outputStream = Symbol('outputStream');
const _writeln = Symbol('writeln');

/**
 * Provides the ability to log messages to controllable streams.
 *
 * If not streams are provided, then any attempt to log a message will be ignored.
 *
 * @public
 */
class Logger {

  /**
   * Creates an instance of {@link Logger}.
   *
   * Optionally, <code>outputStream</code> and/or <code>errorStream</code> can be specified to control where
   * output/error messages are written to respectively. If omitted/<code>null</code>, such messages will not be written
   * at all.
   *
   * @param {Writable} [outputStream] - the stream to which output messages are to be written
   * @param {Writable} [errorStream] - the stream to which error messages are to be written
   * @public
   */
  constructor(outputStream, errorStream) {
    this[_outputStream] = outputStream;
    this[_errorStream] = errorStream;
  }

  /**
   * Writes the specified error <code>message</code> to the error stream for this {@link Logger}.
   *
   * Optionally, <code>args</code> can be specified and used to format <code>message</code>.
   *
   * <code>message</code> will be preceded by an error indicator and proceeded with a new line character.
   *
   * Nothing happens if this {@link Logger} has no error stream.
   *
   * @param {string} [message] - the error message to be logged
   * @param {...*} [args] - any arguments to be used to format <code>message</code>
   * @return {Logger} A reference to this {@link Logger} for chaining purposes.
   * @public
   */
  error(message, ...args) {
    let formatMessage = chalk.red('Error!');
    if (message) {
      formatMessage += ` ${message}`;
    }

    return this[_writeln](this[_errorStream], formatMessage, args);
  }

  /**
   * Writes the specified output <code>message</code> to the output stream for this {@link Logger}.
   *
   * Optionally, <code>args</code> can be specified and used to format <code>message</code>.
   *
   * <code>message</code> will be proceeded with a new line character.
   *
   * Nothing happens if this {@link Logger} has no output stream.
   *
   * @param {string} [message] - the output message to be logged
   * @param {...*} [args] - any arguments to be used to format <code>message</code>
   * @return {Logger} A reference to this {@link Logger} for chaining purposes.
   * @public
   */
  log(message, ...args) {
    return this[_writeln](this[_outputStream], message || '', args);
  }

  /**
   * Writes the specified warning <code>message</code> to the output stream for this {@link Logger}.
   *
   * Optionally, <code>args</code> can be specified and used to format <code>message</code>.
   *
   * <code>message</code> will be preceded by an warning indicator and proceeded with a new line character.
   *
   * Nothing happens if this {@link Logger} has no output stream.
   *
   * @param {string} [message] - the warning message to be logged
   * @param {...*} [args] - any arguments to be used to format <code>message</code>
   * @return {Logger} A reference to this {@link Logger} for chaining purposes.
   * @public
   */
  warn(message, ...args) {
    let formatMessage = chalk.yellow('Warning!');
    if (message) {
      formatMessage += ` ${message}`;
    }

    return this[_writeln](this[_outputStream], formatMessage, args);
  }

  [_writeln](stream, message, args) {
    if (stream) {
      stream.write(`${util.format(message, ...args)}${EOL}`);
    }

    return this;
  }

}

module.exports = Logger;
