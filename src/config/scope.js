/*
 * Copyright (C) 2018 Alasdair Mercer, !ninja
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

const _attributes = Symbol('attributes');
const _docs = Symbol('docs');
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
    this[_docs] = new Set();
    this[_tasks] = new Set();
  }

  /**
   * Adds all of the specified document contexts to this {@link Scope}.
   *
   * If any of the document contexts have any children, they will also be added to this {@link Scope}, as well as their
   * children, and so on.
   *
   * @param {DocumentContext[]} docs - the {@link DocumentContext} instances to be added
   * @return {void}
   * @public
   */
  addAllDocs(docs) {
    docs.forEach(this.addDoc.bind(this));
  }

  /**
   * Adds all of the specified task contexts to this {@link Scope}.
   *
   * @param {TaskContext[]} tasks - the {@link TaskContext} instances to be added
   * @return {void}
   * @public
   */
  addAllTasks(tasks) {
    tasks.forEach(this.addTask.bind(this));
  }

  /**
   * Adds the specified document context to this {@link Scope}.
   *
   * If the document context has any children, they will also be added to this {@link Scope}, as well as their children,
   * and so on.
   *
   * @param {DocumentContext} doc - the {@link DocumentContext} to be added
   * @return {void}
   * @public
   */
  addDoc(doc) {
    if (doc) {
      this[_docs].add(doc);

      this.addAllDocs(doc.children);
    }
  }

  /**
   * Adds the specified task context to this {@link Scope}.
   *
   * @param {TaskContext} task - the {@link TaskContext} to be added
   * @return {void}
   * @public
   */
  addTask(task) {
    if (task) {
      this[_tasks].add(task);
    }
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
    this[_docs].clear();
    this[_tasks].clear();
  }

  /**
   * Removes all of the specified document contexts from this {@link Scope}.
   *
   * If any of the document contexts have any children, they will also be remove from this {@link Scope}, as well as
   * their children, and so on.
   *
   * @param {DocumentContext[]} docs - the {@link DocumentContext} instances to be removed
   * @return {void}
   * @public
   */
  removeAllDocs(docs) {
    docs.forEach(this.removeDoc.bind(this));
  }

  /**
   * Removes all of the specified task contexts from this {@link Scope}.
   *
   * @param {TaskContext[]} tasks - the {@link TaskContext} instances to be removed
   * @return {void}
   * @public
   */
  removeAllTasks(tasks) {
    tasks.forEach(this.removeTask.bind(this));
  }

  /**
   * Removes the specified document context from this {@link Scope}.
   *
   * If the document context has any children, they will also be removed from this {@link Scope}, as well as their
   * children, and so on.
   *
   * @param {DocumentContext} doc - the {@link DocumentContext} to be removed
   * @return {void}
   * @public
   */
  removeDoc(doc) {
    if (doc) {
      this[_docs].delete(doc);

      this.removeAllDocs(doc.children);
    }
  }

  /**
   * Removes the specified task context from this {@link Scope}.
   *
   * @param {TaskContext} task - the {@link TaskContext} to be removed
   * @return {void}
   * @public
   */
  removeTask(task) {
    if (task) {
      this[_tasks].delete(task);
    }
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
   * Returns the document contexts stored within this {@link Scope}.
   *
   * @return {Iterator.<DocumentContext>} An <code>Iterator</code> for the stored {@link DocumentContext} instances.
   * @public
   */
  get docs() {
    return this[_docs].values();
  }

  /**
   * Returns the task contexts stored within this {@link Scope}.
   *
   * @return {Iterator.<TaskContext>} An <code>Iterator</code> for the stored {@link TaskContext} instances.
   * @public
   */
  get tasks() {
    return this[_tasks].values();
  }

}

module.exports = Scope;
