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
const glob = require('glob');
const util = require('util');

const Task = require('./task');
const TaskType = require('./task-type');

const findFiles = util.promisify(glob);

const _add = Symbol('add');
const _addBuiltIns = Symbol('addBuiltIns');
const _builtInsAdded = Symbol('builtInsAdded');
const _privateKey = Symbol('privateKey');
const _singleton = Symbol('singleton');
const _types = Symbol('typeMap');

/**
 * Manages {@link Task} instances that are available for execution.
 *
 * Built-in tasks are automatically discovered and added to the service before the first CRUD operation is performed.
 *
 * This class cannot be instantiated and {@link TaskService.getInstance} must be used to gain a reference to the
 * globally available singleton instance.
 *
 * @public
 */
class TaskService {

  /**
   * Returns a singleton instance of {@link TaskService}.
   *
   * It is highly recommended that the singleton instance is used to ensure that all tasks are added to the same
   * instance and to improve performance as each instance has to lookup and cache built-in {@link Task} implementations.
   *
   * @return {TaskService} The single instance.
   * @public
   */
  static getInstance() {
    if (!TaskService[_singleton]) {
      TaskService[_singleton] = new TaskService(_privateKey);
    }

    return TaskService[_singleton];
  }

  /**
   * Creates an instance of {@link TaskService}.
   *
   * <code>privateKey</code> is used to ensure that {@link TaskService} can only be instantiated within this module.
   *
   * An error will occur if <code>privateKey</code> is invalid.
   *
   * @param {Symbol} privateKey - a private symbol used to prevent external instantiation of {@link TaskType}
   * @throws {Error} If <code>privateKey</code> is invalid.
   * @private
   */
  constructor(privateKey) {
    if (privateKey !== _privateKey) {
      throw new Error('TaskService constructor is private');
    }

    this[_builtInsAdded] = false;
    this[_types] = new Map();
  }

  /**
   * Adds the specified <code>task</code> to this {@link TaskService}.
   *
   * An error will occur if {@link TaskType#getType} does not return a {@link TaskType} or if there is a problem while
   * loading any built-in {@link Task} implementations, which is only done once.
   *
   * @param {Task} task - the {@link Task} to be added
   * @return {Promise.<void, Error>} A <code>Promise</code> for the asynchronous loading of any built-in {@link Task}
   * implementations.
   * @public
   */
  async add(task) {
    await this[_addBuiltIns]();

    debug('Adding task: %s', task);

    this[_add](task);
  }

  /**
   * Removes all tasks from this {@link TaskService}.
   *
   * If this method has been called before any built-in {@link Task} implementations have been loaded, it will prevent
   * them from being loaded at any point in the future of this {@link TaskService} instance.
   *
   * @return {void}
   * @public
   */
  clear() {
    this[_builtInsAdded] = true;

    debug('Removing all tasks');

    this[_types].clear();
  }

  /**
   * Returns all of the tasks for this {@link TaskService} that belong to the specified <code>type</code>.
   *
   * An error will occur if <code>type</code> is not a {@link TaskType} or if there is a problem while loading any
   * built-in {@link Task} implementations, which is only done once.
   *
   * @param {TaskType} type - the {@link TaskType} whose associated {@link Task} implementations are to be returned
   * @return {Promise.<Task[], Error>} A <code>Promise</code> for the asynchronous loading of any built-in {@link Task}
   * implementations that is resolved with each {@link Task} that belongs to <code>type</code>.
   * @public
   */
  async findByType(type) {
    if (!(type instanceof TaskType)) {
      throw new TypeError('type is not a TaskType');
    }

    await this[_addBuiltIns]();

    const tasks = this[_types].get(type.name);

    return tasks ? Array.from(tasks) : [];
  }

  /**
   * Returns all of the tasks for this {@link TaskService}.
   *
   * An error will occur if there is a problem while loading any built-in {@link Task} implementations, which is only
   * done once.
   *
   * @return {Promise.<Task[], Error>} A <code>Promise</code> for the asynchronous loading of any built-in {@link Task}
   * implementations that is resolved with each {@link Task}.
   * @public
   */
  async getAll() {
    await this[_addBuiltIns]();

    const tasks = [];

    for (const typeTasks of this[_types].values()) {
      tasks.push(...typeTasks);
    }

    return tasks;
  }

  /**
   * Removes the specified <code>task</code> from this {@link TaskService}.
   *
   * An error will occur if {@link TaskType#getType} does not return a {@link TaskType} or if there is a problem while
   * loading any built-in {@link Task} implementations, which is only done once.
   *
   * @param {Task} task - the {@link Task} to be removed
   * @return {Promise.<void, Error>} A <code>Promise</code> for the asynchronous loading of any built-in {@link Task}
   * implementations.
   * @public
   */
  async remove(task) {
    await this[_addBuiltIns]();

    debug('Removing task: %s', task);

    const type = task.getType();
    if (!(type instanceof TaskType)) {
      throw new TypeError('task#getType did not return a TaskType');
    }

    const tasks = this[_types].get(type.name);

    if (tasks) {
      tasks.delete(task);
    }
  }

  /**
   * Removes the all tasks from this {@link TaskService} that belong to the specified <code>type</code>.
   *
   * An error will occur if <code>type</code> is not a {@link TaskType} or if there is a problem while loading any
   * built-in {@link Task} implementations, which is only done once.
   *
   * @param {TaskType} type - the {@link TaskType} whose associated {@link Task} implementations are to be removed
   * @return {Promise.<void, Error>} A <code>Promise</code> for the asynchronous loading of any built-in {@link Task}
   * implementations.
   * @public
   */
  async removeByType(type) {
    if (!(type instanceof TaskType)) {
      throw new TypeError('type is not a TaskType');
    }

    await this[_addBuiltIns]();

    debug('Removing all tasks for type: %s', type);

    this[_types].delete(type.name);
  }

  [_add](task) {
    const type = task.getType();
    if (!(type instanceof TaskType)) {
      throw new TypeError('task#getType did not return a TaskType');
    }

    let tasks = this[_types].get(type.name);
    if (!tasks) {
      tasks = new Set();
      this[_types].set(type.name, tasks);
    }

    tasks.add(task);
  }

  async [_addBuiltIns]() {
    if (this[_builtInsAdded]) {
      return;
    }

    this[_builtInsAdded] = true;

    const filePaths = await findFiles('**/*-task.js', {
      absolute: true,
      cwd: __dirname
    });

    for (const filePath of filePaths) {
      /* eslint-disable global-require */
      const TaskImpl = require(filePath);
      /* eslint-enable global-require */
      const task = new TaskImpl();
      if (!(task instanceof Task)) {
        throw new TypeError(`Non-task implementation loaded from module: ${filePath}`);
      }

      debug('Adding internal task: %s', task);

      this[_add](task);
    }
  }

}

module.exports = TaskService;
