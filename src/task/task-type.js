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

const _name = Symbol('name');
const _outputRequired = Symbol('outputRequired');
const _privateKey = Symbol('privateKey');

/**
 * Describes a category for {@link Task} instances to help group and organize them.
 *
 * This class is enum-like for ease-of-use. It cannot be instantiated and built-in instances can only be referenced via
 * the static values (e.g. {@link TaskType.CLEAN}) or using {@link TaskType.valueOf}.
 *
 * @public
 */
class TaskType {

  /**
   * Returns the {@link TaskType} that matches the specified <code>name</code>.
   *
   * The matching ignores case and any leading/trailing whitespace on <code>name</code>.
   *
   * An error will occur if no {@link TaskType} could be found with a matching <code>name</code>.
   *
   * @param {string} name - the name of the {@link TaskType} to be returned
   * @return {TaskType} The matching {@link TaskType}.
   * @throws {Error} If no {@link TaskType} exists with a matching <code>name</code>.
   * @public
   */
  static valueOf(name) {
    name = _.trim(name).toLowerCase();

    for (const type of TaskType) {
      if (type.name === name) {
        return type;
      }
    }

    throw new Error(`No TaskType found for name: "${name}"`);
  }

  static *[Symbol.iterator]() {
    yield* Object.values(TaskType);
  }

  /**
   * Creates an instance of {@link TaskType} with the specified <code>name</code>.
   *
   * Optionally, <code>outputRequired</code> can be specified to control whether {@link Task} implementations for the
   * type require an output {@link File}.
   *
   * <code>privateKey</code> is used to ensure that {@link TaskType} can only be instantiated within this module.
   *
   * An error will occur if <code>privateKey</code> is invalid.
   *
   * @param {Symbol} privateKey - a private symbol used to prevent external instantiation of {@link TaskType}
   * @param {string} name - the name to be used
   * @param {boolean} [outputRequired] - <code>true</code> if tasks belong to the type require an output file; otherwise
   * <code>false</code>
   * @throws {Error} If <code>privateKey</code> is invalid.
   * @private
   */
  constructor(privateKey, name, outputRequired) {
    if (privateKey !== _privateKey) {
      throw new Error('TaskType constructor is private');
    }

    this[_name] = name;
    this[_outputRequired] = Boolean(outputRequired);
  }

  /**
   * @override
   */
  toString() {
    return this.name;
  }

  /**
   * Returns the name of this {@link TaskType}.
   *
   * @return {string} The name.
   * @public
   */
  get name() {
    return this[_name];
  }

  /**
   * Returns whether {@link Task} implementations for this {@link TaskType} require an output {@link File}.
   *
   * @return {boolean} <code>true</code> if tasks belong to this type require an output file; otherwise
   * <code>false</code>.
   * @public
   */
  get outputRequired() {
    return this[_outputRequired];
  }

}

/**
 * The {@link TaskType} for tasks that perform cleaning operations (e.g. deleting files).
 *
 * @public
 * @static
 * @memberof TaskType
 * @member {TaskType} CLEAN
 */
TaskType.CLEAN = new TaskType(_privateKey, 'clean');

/**
 * The {@link TaskType} for tasks that perform conversion operations (e.g. converting a file in one format into
 * another).
 *
 * @public
 * @static
 * @memberof TaskType
 * @member {TaskType} CONVERT
 */
TaskType.CONVERT = new TaskType(_privateKey, 'convert', true);

/**
 * The {@link TaskType} for tasks that perform optimization operations (e.g. reducing the size of a file).
 *
 * @public
 * @static
 * @memberof TaskType
 * @member {TaskType} OPTIMIZE
 */
TaskType.OPTIMIZE = new TaskType(_privateKey, 'optimize');

/**
 * The {@link TaskType} for tasks that perform packaging operations (e.g. bundling files into an archive). Such tasks
 * may well also support some conversion operations internally.
 *
 * @public
 * @static
 * @memberof TaskType
 * @member {TaskType} PACKAGE
 */
TaskType.PACKAGE = new TaskType(_privateKey, 'package', true);

module.exports = Object.freeze(TaskType);
