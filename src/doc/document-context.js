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

const _ = require('lodash');

const Context = require('../config/context');

const _children = Symbol('children');
const _data = Symbol('data');
const _parent = Symbol('parent');
const _title = Symbol('title');
const _type = Symbol('type');

/**
 * Contains contextual information that is based on document-related configuration data which can be rendered by a
 * supporting {@link DocumentProvider} to generate documentation.
 *
 * While it's possible to create an instance using the constructor, it's highly recommended that
 * {@link DocumentContextParser} and/or an associated {@link DocumentProvider} is used instead.
 *
 * @public
 */
class DocumentContext extends Context {

  /**
   * Creates an instance of {@link DocumentContext}.
   *
   * @param {string} type - the type to be used
   * @param {Object} data - the data to be used
   * @param {?DocumentContext} parent - the parent {@link DocumentContext} to be used (may be <code>null</code> if there
   * is no parent)
   * @param {Config} config - the {@link Config} to be used
   * @public
   */
  constructor(type, data, parent, config) {
    super(config);

    this[_type] = type;
    this[_data] = data;
    this[_parent] = parent;
    this[_children] = [];
    this[_title] = _.trim(data.title) || null;
  }

  /**
   * Resolves the value of the data with the specified <code>name</code> within this {@link DocumentContext}.
   *
   * Optionally, if <code>defaultValue</code> is specified and this {@link DocumentContext} contains no data, or the
   * desired data is missing, it will be returned instead. Otherwise, this method will return <code>undefined</code>.
   *
   * @param {string|string[]} name - the paths or path segments to the property within the data whose value is to be
   * returned
   * @param {*} [defaultValue] - the value to be returned for <code>undefined</code> resolved values
   * @return {*} The resolved value.
   * @public
   */
  get(name, defaultValue) {
    return _.get(this[_data], name, defaultValue);
  }

  /**
   * Returns whether this is a root {@link DocumentContext}.
   *
   * @return {boolean} <code>true</code> if this is a root {@link DocumentContext}; otherwise <code>false</code>.
   * @public
   */
  isRoot() {
    return false;
  }

  /**
   * Returns all of the children for this {@link DocumentContext}.
   *
   * The array will be empty if this {@link DocumentContext} contains no children.
   *
   * @return {DocumentContext[]} The children {@link DocumentContext} instances.
   * @public
   */
  get children() {
    return this[_children];
  }

  /**
   * Returns the depth of this {@link DocumentContext}.
   *
   * The value is an indicator of how deep this {@link DocumentContext} is within the root document and is based on the
   * depth of its parent {@link DocumentContext}. This can be useful when rendering headings and table of contents.
   *
   * Zero will be returned if this {@link DocumentContext} has no parent.
   *
   * @return {number} The depth.
   * @public
   */
  get depth() {
    return this.parent ? this.parent.depth + 1 : 0;
  }

  /**
   * Returns the parent for this {@link DocumentContext}.
   *
   * <code>null</code> will be returned if this {@link DocumentContext} has no parent (e.g. is a root document or
   * detached).
   *
   * @return {?DocumentContext} The parent {@link DocumentContext} or <code>null</code> if it has none.
   * @public
   */
  get parent() {
    return this[_parent];
  }

  /**
   * Traverses the document tree for this {@link DocumentContext} to find one whose type is "root".
   *
   * <code>null</code> will be returned if this {@link DocumentContext} has no parent or does not belong to a root
   * document (e.g. is detached).
   *
   * @return {?DocumentContext} The root {@link DocumentContext} or <code>null</code> if it has no parent or does not
   * belong to one.
   * @public
   */
  get root() {
    let context = this;
    let parent;

    while ((parent = context.parent) != null) {
      context = parent;

      if (context.isRoot()) {
        return context;
      }
    }

    return null;
  }

  /**
   * Returns the title for this {@link DocumentContext}.
   *
   * <code>null</code> is returned if this {@link DocumentContext} has no title.
   *
   * @return {?string} The title or <code>null</code> if it has none.
   * @public
   */
  get title() {
    return this[_title];
  }

  /**
   * Returns the type of this {@link DocumentContext}.
   *
   * @return {string} The type.
   * @public
   */
  get type() {
    return this[_type];
  }

}

module.exports = DocumentContext;
