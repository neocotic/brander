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

import chalk from 'chalk';
import { EOL } from 'node:os';
import util from 'node:util';

/**
 * Provides the ability to log messages to controllable streams.
 *
 * When a logger is disabled, any attempt to log a message via that logger will be ignored.
 *
 * @public
 */
export class Logger {

  /**
   * @type {boolean}
   * @private
   */
  #enabled;
  /**
   * @type {stream.Writable}
   * @private
   */
  #errorStream;
  /**
   * @type {stream.Writable}
   * @private
   */
  #outputStream;

  /**
   * Creates an instance of {@link Logger}.
   *
   * Optionally, <code>options</code> can be provided for more granular control.
   *
   * @param {Logger~Options} [options] - the options to be used
   * @public
   */
  constructor(options = {}) {
    this.#enabled = options.enabled !== false;
    this.#errorStream = options.errorStream || process.stderr;
    this.#outputStream = options.outputStream || process.stdout;
  }

  /**
   * Writes the specified error <code>message</code> to the error stream for this {@link Logger}.
   *
   * Optionally, <code>args</code> can be specified and used to format <code>message</code>.
   *
   * <code>message</code> will be preceded by an error indicator and proceeded with a new line character.
   *
   * Nothing happens if this {@link Logger} is disabled.
   *
   * @param {string} [message] - the error message to be logged
   * @param {...*} [args] - any arguments to be used to format <code>message</code>
   * @return {Logger} A reference to this {@link Logger} for chaining purposes.
   * @public
   */
  error(message, ...args) {
    if (!this.enabled) {
      return this;
    }

    let formatMessage = chalk.red('Error!');
    if (message) {
      formatMessage += ` ${message}`;
    }

    return this.#writeln(this.#errorStream, formatMessage, args);
  }

  /**
   * Writes the specified output <code>message</code> to the output stream for this {@link Logger}.
   *
   * Optionally, <code>args</code> can be specified and used to format <code>message</code>.
   *
   * <code>message</code> will be proceeded with a new line character.
   *
   * Nothing happens if this {@link Logger} is disabled.
   *
   * @param {string} [message] - the output message to be logged
   * @param {...*} [args] - any arguments to be used to format <code>message</code>
   * @return {Logger} A reference to this {@link Logger} for chaining purposes.
   * @public
   */
  log(message, ...args) {
    if (!this.enabled) {
      return this;
    }

    return this.#writeln(this.#outputStream, message || '', args);
  }

  /**
   * Writes the specified warning <code>message</code> to the output stream for this {@link Logger}.
   *
   * Optionally, <code>args</code> can be specified and used to format <code>message</code>.
   *
   * <code>message</code> will be preceded by an warning indicator and proceeded with a new line character.
   *
   * Nothing happens if this {@link Logger} is disabled.
   *
   * @param {string} [message] - the warning message to be logged
   * @param {...*} [args] - any arguments to be used to format <code>message</code>
   * @return {Logger} A reference to this {@link Logger} for chaining purposes.
   * @public
   */
  warn(message, ...args) {
    if (!this.enabled) {
      return this;
    }

    let formatMessage = chalk.yellow('Warning!');
    if (message) {
      formatMessage += ` ${message}`;
    }

    return this.#writeln(this.#outputStream, formatMessage, args);
  }

  /**
   * @param {stream.Writable} stream
   * @param {string} message
   * @param {Array} args
   * @return {Logger}
   * @private
   */
  #writeln(stream, message, args) {
    stream.write(`${util.format(message, ...args)}${EOL}`);

    return this;
  }

  /**
   * Returns whether output for this {@link Logger} should be logged.
   *
   * @return {boolean} <code>true</code> if logger is enabled; otherwise <code>false</code>.
   * @public
   */
  get enabled() {
    return this.#enabled;
  }

}

/**
 * The options that can be passed to the {@link Logger} constructor.
 *
 * @typedef {Object} Logger~Options
 * @property {boolean} [enabled=true] - <code>false</code> if no output should be logged; otherwise
 * <code>true</code>.
 * @property {stream.Writable} [errorStream=process.stderr] - The stream to which error messages are to be written.
 * @property {stream.Writable} [outputStream=process.stdout] - The stream to which output messages are to be written.
 */
