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

const pollock = require('pollock');

const typeMap = new Map();

/**
 * TODO: document
 *
 * @public
 */
class Task {

  /**
   * Unregisters all tasks.
   *
   * Use with caution as, in order to make {@link TaskExecutor} fully functional again, tasks will will need to be
   * (re-)registered.
   *
   * @return {void}
   * @public
   */
  static clear() {
    typeMap.clear();
  }

  /**
   * Returns all tasks that have been registered for the specified <code>type</code>.
   *
   * An empty array will be returned if no tasks have been registered for <code>type</code>.
   *
   * @param {?string} type - the type of tasks to be returned (may be <code>null</code>)
   * @return {Task[]} All registered tasks for <code>type</code>.
   * @public
   */
  static getTasks(type) {
    const tasks = typeMap.get(type);

    return tasks ? Array.from(tasks) : [];
  }

  /**
   * Registers the specified <code>task</code> for the <code>type</code> provided.
   *
   * This needs to be done per {@link Task} implementation, otherwise they will not be detected by the
   * {@link TaskExecutor}.
   *
   * Nothing happens if either <code>type</code> or <code>task</code> are not specified.
   *
   * @param {?string} type - the type of <code>task</code> to be registered (may be <code>null</code>)
   * @param {?Task} task - the {@link Task} instance to be registered (may be <code>null</code>)
   * @return {void}
   * @public
   */
  static register(type, task) {
    if (!(type && task)) {
      return;
    }

    let tasks = typeMap.get(type);
    if (!tasks) {
      tasks = new Set();
      typeMap.set(type, tasks);
    }

    tasks.add(task);
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
 * @return {Promise.<Error>} A <code>Promise</code> for the asynchronous execution.
 * @public
 * @abstract
 * @memberof Task#
 * @method execute
 */
pollock(Task, 'execute', { promise: true });

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

module.exports = Task;
