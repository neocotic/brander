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

const _contexts = Symbol('contexts');
const _taskService = Symbol('taskService');

/**
 * TODO: document
 *
 * @public
 */
class TaskExecutor {

  /**
   * Creates an instance of {@link TaskExecutor} with the specified <code>contexts</code> and <code>taskService</code>.
   *
   * {@link TaskService#createExecutor} should be used to create instances.
   *
   * @param {TaskContext[]} contexts - the task contexts to be used
   * @param {TaskService} taskService - the {@link TaskService} to be used
   * @protected
   */
  constructor(contexts, taskService) {
    this[_contexts] = contexts;
    this[_taskService] = taskService;
  }

  /**
   * Executes all of the task contexts within this {@link TaskExecutor}.
   *
   * An error will occur if no tasks can be found for a {@link TaskType} found in the {@link Config}, or none that
   * support a parsed {@link TaskContext}, or a problem arises during the execution of any {@link Task}.
   *
   * @return {Promise.<Error>} A <code>Promise</code> for the asynchronous execution of each {@link Task}.
   * @public
   */
  async execute() {
    for (const context of this[_contexts]) {
      const { type } = context;
      const tasks = await this[_taskService].findByType(type);
      if (tasks.length === 0) {
        throw new Error(`"task" configuration has no associated tasks: ${type}`);
      }

      const supportingTask = tasks.find((task) => task.supports(context));
      if (!supportingTask) {
        throw new Error(`"task" configuration has no supporting tasks: ${type}`);
      }

      await supportingTask.execute(context);
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
