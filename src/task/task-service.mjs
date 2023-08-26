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

import Debug from 'debug';
import { fileURLToPath } from 'node:url';

import { File } from '../file.mjs';
import { Task } from './task.mjs';
import { TaskType } from './task-type.mjs';

const debug = Debug('brander:task');

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
export class TaskService {

  /**
   * @type {symbol}
   * @private
   */
  static #privateKey = Symbol('privateKey');
  /**
   * @type {?TaskService}
   * @private
   */
  static #singleton;

  /**
   * Returns a singleton instance of {@link TaskService}.
   *
   * @return {TaskService} The singleton instance.
   * @public
   */
  static getInstance() {
    if (!TaskService.#singleton) {
      TaskService.#singleton = new TaskService(TaskService.#privateKey);
    }

    return TaskService.#singleton;
  }

  /**
   * @type {boolean}
   * @private
   */
  #builtInsAdded = false;
  /**
   * @type {Map<string, Set<Task>>}
   * @private
   */
  #types = new Map();

  /**
   * Creates an instance of {@link TaskService}.
   *
   * Use {@link TaskService.getInstance} to obtain an instance of {@link TaskService}. Do not try to instantiate this
   * class directly.
   *
   * <code>privateKey</code> is used to ensure that {@link TaskService} can only be instantiated within this module.
   *
   * An error will occur if <code>privateKey</code> is invalid.
   *
   * @param {Symbol} privateKey - a private symbol used to prevent external instantiation of {@link TaskService}
   * @throws {Error} If <code>privateKey</code> is invalid.
   * @private
   */
  constructor(privateKey) {
    if (privateKey !== TaskService.#privateKey) {
      throw new Error('TaskService constructor is private');
    }
  }

  /**
   * Adds the specified <code>task</code> to this {@link TaskService}.
   *
   * An error will occur if {@link TaskType#getType} does not return a {@link TaskType} or if there is a problem while
   * loading any built-in {@link Task} implementations, which is only done once.
   *
   * @param {Task} task - the {@link Task} to be added
   * @return {Promise<void>} A <code>Promise</code> for the asynchronous loading of any built-in {@link Task}
   * implementations.
   * @public
   */
  async add(task) {
    await this.#addBuiltIns();

    debug('Adding task: %s', task);

    this.#add(task);
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
    this.#builtInsAdded = true;

    debug('Removing all tasks');

    for (const tasks of this.#types.values()) {
      tasks.clear();
    }
    this.#types.clear();
  }

  /**
   * Returns all of the tasks for this {@link TaskService} that belong to the specified <code>type</code>.
   *
   * An error will occur if <code>type</code> is not a {@link TaskType} or if there is a problem while loading any
   * built-in {@link Task} implementations, which is only done once.
   *
   * @param {TaskType} type - the {@link TaskType} whose associated {@link Task} implementations are to be returned
   * @return {Promise<Task[]>} A <code>Promise</code> for the asynchronous loading of any built-in {@link Task}
   * implementations that is resolved with each {@link Task} that belongs to <code>type</code>.
   * @public
   */
  async findByType(type) {
    if (!(type instanceof TaskType)) {
      throw new TypeError('type is not a TaskType');
    }

    await this.#addBuiltIns();

    const tasks = this.#types.get(type.name);

    return tasks ? Array.from(tasks) : [];
  }

  /**
   * Returns all of the tasks for this {@link TaskService}.
   *
   * An error will occur if there is a problem while loading any built-in {@link Task} implementations, which is only
   * done once.
   *
   * @return {Promise<Task[]>} A <code>Promise</code> for the asynchronous loading of any built-in {@link Task}
   * implementations that is resolved with each {@link Task}.
   * @public
   */
  async getAll() {
    await this.#addBuiltIns();

    const tasks = [];

    for (const typeTasks of this.#types.values()) {
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
   * @return {Promise<void>} A <code>Promise</code> for the asynchronous loading of any built-in {@link Task}
   * implementations.
   * @public
   */
  async remove(task) {
    await this.#addBuiltIns();

    debug('Removing task: %s', task);

    const type = task.getType();
    if (!(type instanceof TaskType)) {
      throw new TypeError('task#getType did not return a TaskType');
    }

    const tasks = this.#types.get(type.name);

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
   * @return {Promise<void>} A <code>Promise</code> for the asynchronous loading of any built-in {@link Task}
   * implementations.
   * @public
   */
  async removeByType(type) {
    if (!(type instanceof TaskType)) {
      throw new TypeError('type is not a TaskType');
    }

    await this.#addBuiltIns();

    debug('Removing all tasks for type: %s', type);

    this.#types.delete(type.name);
  }

  /**
   * @param {Task} task
   * @return {void}
   * @private
   */
  #add(task) {
    const type = task.getType();
    if (!(type instanceof TaskType)) {
      throw new TypeError('task#getType did not return a TaskType');
    }

    let tasks = this.#types.get(type.name);
    if (!tasks) {
      tasks = new Set();
      this.#types.set(type.name, tasks);
    }

    tasks.add(task);
  }

  /**
   * @return {Promise<void>}
   * @private
   */
  async #addBuiltIns() {
    if (this.#builtInsAdded) {
      return;
    }

    this.#builtInsAdded = true;

    const filePaths = await File.findFiles('**/*-task.mjs', {
      absolute: true,
      cwd: fileURLToPath(new URL('.', import.meta.url))
    });

    for (const filePath of filePaths) {
      const mod = await import(filePath);
      if (typeof mod.default !== 'function') {
        throw new TypeError(`Default export of module not Task implementation constructor: ${filePath}`);
      }
      const task = new mod.default();
      if (!(task instanceof Task)) {
        throw new TypeError(`Default export of module not Task implementation constructor: ${filePath}`);
      }

      debug('Adding internal task: %s', task);

      this.#add(task);
    }
  }

}
