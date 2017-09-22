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

// TODO: complete

const _name = Symbol('name');
const _title = Symbol('title');

/**
 * TODO: document
 *
 * @public
 */
class Category {

  /**
   * Creates an instance of {@link Category} with the specified <code>name</code>.
   *
   * Optionally, <code>title</code> can be specified to be used when presenting the category.
   *
   * @param {string} name - the name to be used
   * @param {string} [title] - the title to be used
   * @public
   */
  constructor(name, title) {
    this[_name] = name;
    this[_title] = title;
  }

  /**
   * Returns the name of this {@link Category}.
   *
   * The name should be in a format that is suitable for file paths while the title should be used when presenting this
   * category.
   *
   * @return {string} The name.
   * @public
   */
  get name() {
    return this[_name];
  }

  /**
   * Returns the title of this {@link Category}.
   *
   * The title should be used when presenting this category while the name should be in a format that is suitable for
   * file paths. However, the name will be used where no title is available.
   *
   * @return {string} The title.
   * @public
   */
  get title() {
    return this[_title] || this[_name];
  }

}

module.exports = Category;
