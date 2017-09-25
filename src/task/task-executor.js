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

const Task = require('./task');
const TaskContext = require('./task-context');
require('./clean');
require('./convert');
require('./optimize');

const _contexts = Symbol('contexts');

/**
 * TODO: document
 *
 * @public
 */
class TaskExecutor {

  /**
   * Creates an instance of {@link TaskExecutor} using {@link TaskContext} instances that are parsed from the tasks data
   * within the specified <code>config</code>.
   *
   * An error will occur if the tasks data within <code>config</code> is malformed or incomplete or if a problem occurs
   * while attempting to find input files.
   *
   * @param {Config} config - the {@link Config} to be used
   * @return {Promise.<Error, TaskExecutor>} A <code>Promise</code> for asynchronous parsing.
   * @public
   */
  static async create(config) {
    const contexts = await TaskContext.parse(config);

    return new TaskExecutor(contexts);
  }

  /**
   * Creates an instance of {@link TaskExecutor} with the <code>contexts</code> provided.
   *
   * {@link TaskExecutor.create} should be used to create instances.
   *
   * @param {TaskContext[]} contexts - the task contexts to be used
   * @protected
   */
  constructor(contexts) {
    this[_contexts] = contexts;
  }

  /**
   * Executes all of the task contexts within this {@link TaskExecutor}.
   *
   * An error will occur if no tasks can be found for a type found in the {@link Config}, or none that support a parsed
   * {@link TaskContext}, or a problem arises during the execution of any {@link Task}.
   *
   * @return {Promise.<Error>} A <code>Promise</code> for the asynchronous execution of each {@link Task}.
   * @public
   */
  async execute() {
    for (const context of this[_contexts]) {
      const { type } = context;
      const tasks = Task.getTasks(type);
      if (tasks.length === 0) {
        throw new Error(`"task" configuration is invalid: ${type}`);
      }

      const supportedTask = tasks.find((task) => task.supports(context));
      if (!supportedTask) {
        throw new Error(`Unable to find supporting task: ${type}`);
      }

      await supportedTask.execute(context);
    }
  }

  /**
   * Return the task contexts that are executed by this {@link TaskExecuted}.
   *
   * The array is a copy so any modifications to it will not be reflected in this {@link TaskExecutor}.
   *
   * @return {TaskContext[]} All of the {@link TaskContext} instances.
   * @public
   */
  get contexts() {
    return this[_contexts].slice();
  }

}

module.exports = TaskExecutor;
