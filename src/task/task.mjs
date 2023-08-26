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

import pollock from 'pollock';

/**
 * Performs a single operation relating to an associated {@link TaskType} that is executed for {@link TaskContext}
 * instances created based on configuration data to generate assets.
 *
 * @public
 * @abstract
 */
export class Task {

  /**
   * Called immediately after this {@link Task} has executed the specified <code>context</code>, regardless of whether
   * an error occurred while doing so.
   *
   * This method does nothing by default.
   *
   * @param {TaskContext} context - the {@link TaskContext} that was just executed
   * @return {Promise<void>} A <code>Promise</code> for any asynchronous work needed after executing
   * <code>context</code>.
   * @public
   */
  after(context) {}

  /**
   * Called after all tasks have been executed for the specified <code>config</code>, regardless of whether an error
   * occurred while doing so.
   *
   * This method does nothing by default.
   *
   * @param {Config} config - the {@link Config} for which the tasks were executed
   * @return {Promise<void>} A <code>Promise</code> for any asynchronous work needed after executing all tasks.
   * @public
   */
  afterAll(config) {}

  /**
   * Called immediately before this {@link Task} will execute the specified <code>context</code>.
   *
   * This method does nothing by default.
   *
   * @param {TaskContext} context - the {@link TaskContext} that is going to be executed
   * @return {Promise<void>} A <code>Promise</code> for any asynchronous work needed before executing
   * <code>context</code>.
   * @public
   */
  before(context) {}

  /**
   * Called before any tasks are executed for the specified <code>config</code>.
   *
   * This method does nothing by default.
   *
   * @param {Config} config - the {@link Config} for which the tasks are going to be executed
   * @return {Promise<void>} A <code>Promise</code> for any asynchronous work needed before executing any tasks.
   * @public
   */
  beforeAll(config) {}

  /**
   * @override
   */
  toString() {
    return `Task(${this.getType()})`;
  }

}

/**
 * Executes this {@link Task} using the specified <code>context</code>.
 *
 * It is <i>always</i> recommended that {@link Task#supports} is called with <code>context</code> before calling this
 * method to ensure that this {@link Task} supports it.
 *
 * An error will occur if a problem arises during the execution.
 *
 * All implementations of {@link Task} <b>must</b> override this method.
 *
 * @param {TaskContext} context - the {@link TaskContext} to be executed
 * @return {Promise<void>} A <code>Promise</code> for the asynchronous execution.
 * @public
 * @abstract
 * @memberof Task#
 * @method execute
 */
pollock(Task, 'execute', { promise: true });

/**
 * Returns the {@link TaskType} of this {@link Task}.
 *
 * The type is used to categorize tasks when they are added to the {@link TaskService} so that they can be easily and
 * quickly looked up as well as provides additional information that is useful when parsing and validating data within
 * the {@link Config}.
 *
 * All implementations of {@link Task} <b>must</b> override this method.
 *
 * @return {TaskType} The type.
 * @public
 * @abstract
 * @memberof Task#
 * @method getType
 */
pollock(Task, 'getType');

/**
 * Returns whether this {@link Task} supports the specified <code>context</code>.
 *
 * It is <i>always</i> recommended to called this method before calling {@link Task#execute} to ensure that this
 * {@link Task} supports it.
 *
 * All implementations of {@link Task} <b>must</b> override this method.
 *
 * @param {TaskContext} context - the {@link TaskContext} to be checked
 * @return {boolean} <code>true</code> if this task can be executed using <code>context</code>; otherwise
 * <code>false</code>.
 * @public
 * @abstract
 * @memberof Task#
 * @method supports
 */
pollock(Task, 'supports');
