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

const debug = require('debug')('brander:task');

const TaskParser = require('./task-parser');
const TaskService = require('./task-service');

const _taskParser = Symbol('taskParser');

/**
 * TODO: document
 *
 * @public
 */
class TaskExecutor {

  /**
   * Creates an instance of {@link TaskExecutor} with the specified <code>config</code>.
   *
   * @param {Config} config - the {@link Config} whose task data is to be parsed and executed
   * @public
   */
  constructor(config) {
    this[_taskParser] = new TaskParser(config);
  }

  /**
   * Parses the task data within the {@link Config} of this {@link TaskExecutor} using a {@link TaskParser} and then
   * executes these against their supporting {@link Task} implementations.
   *
   * An error will occur if a problem occurs while parsing task data in the {@link Config}, no tasks can be found for a
   * {@link TaskType} found in the {@link Config}, or none that support a parsed {@link TaskContext}, or a problem
   * arises during the execution of any {@link Task}.
   *
   * @return {Promise.<Error>} A <code>Promise</code> for the asynchronous execution of each {@link Task}.
   * @public
   */
  async execute() {
    let contexts;
    const taskService = TaskService.getInstance();

    debug('Executing configured tasks...');

    while ((contexts = await this[_taskParser].parseNext()) != null) {
      for (const context of contexts) {
        const { type } = context;

        debug('Finding task for type: %s', type);

        const tasks = await taskService.findByType(type);
        if (tasks.length === 0) {
          throw new Error(`"task" configuration has no associated tasks: ${type}`);
        }

        const supportingTask = tasks.find((task) => task.supports(context));
        if (!supportingTask) {
          throw new Error(`"task" configuration has no supporting tasks: ${type}`);
        }

        debug('Executing task: %s', supportingTask);

        await supportingTask.execute(context);
      }
    }
  }

}

module.exports = TaskExecutor;
