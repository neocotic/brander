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

const debug = require('debug')('brander:task');

const ContextRunner = require('../config/context-runner');
const TaskService = require('./task-service');

/**
 * Capable of running {@link TaskContext} instances sequentially which can either be provided directly or extracted
 * iteratively via a {@link TaskContextParser}, however, it's <b>highly recommended</b> to use the latter as this can
 * help ensure that task-related data is parsed iteratively so that they can be run step-by-step to support dependencies
 * (e.g. task 2 may depend on files generated by task 1).
 *
 * @public
 */
class TaskContextRunner extends ContextRunner {

  /**
   * @inheritdoc
   * @override
   */
  async runAfter(config) {
    const taskService = TaskService.getInstance();
    const tasks = await taskService.getAll();

    for (const task of tasks) {
      try {
        await task.afterAll(config);
      } catch (e) {
        config.logger.warn('Task#afterAll failed for "%s" task: %s', task, e);
      }
    }
  }

  /**
   * @inheritdoc
   * @override
   */
  async runBefore(config) {
    const taskService = TaskService.getInstance();
    const tasks = await taskService.getAll();

    for (const task of tasks) {
      await task.beforeAll(config);
    }
  }

  /**
   * @inheritdoc
   * @override
   */
  async runContext(context) {
    const taskService = TaskService.getInstance();
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

    await supportingTask.before(context);

    try {
      await supportingTask.execute(context);
    } finally {
      await supportingTask.after(context);
    }
  }

}

module.exports = TaskContextRunner;
