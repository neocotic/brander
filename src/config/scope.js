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

const _attributes = Symbol('attributes');
const _tasks = Symbol('tasks');

/**
 * Contains a high-level overview of single generation process and to support the ability to share state between
 * different stages.
 *
 * The scope is cleared at the beginning of each generation cycle.
 *
 * Care should be taken when relying on information stored within the scope as it may not be reliable or complete and
 * can easily be modified.
 *
 * @public
 */
class Scope {

  /**
   * Creates an instance of {@link Scope}.
   *
   * @public
   */
  constructor() {
    this[_attributes] = new Map();
    this[_tasks] = new Set();
  }

  /**
   * Clears all state from this {@link Scope}.
   *
   * This should be called at the beginning of each generation process.
   *
   * @return {void}
   * @public
   */
  clear() {
    this.attributes.clear();
    this.tasks.clear();
  }

  /**
   * Returns the attribute mapping for this {@link Scope}.
   *
   * The map can be used to store any arbitrary information that can be then accessed anywhere throughout the generation
   * process.
   *
   * @return {Map} The attributes.
   * @public
   */
  get attributes() {
    return this[_attributes];
  }

  /**
   * Returns the task contexts stored within this {@link Scope}.
   *
   * @return {Set.<TaskContext>} The {@link TaskContext} instances.
   * @public
   */
  get tasks() {
    return this[_tasks];
  }

}

module.exports = Scope;
