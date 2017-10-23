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

/* eslint "max-params": "off" */

// TODO: complete

const DocumentContext = require('../document-context');

const _dir = Symbol('dir');
const _fileGroups = Symbol('fileGroups');
const _previewFile = Symbol('previewFile');

/**
 * TODO: document
 *
 * @public
 */
class AssetFeatureDocumentContext extends DocumentContext {

  // TODO: complete

  /**
   * Creates an instance of {@link AssetFeatureDocumentContext}.
   *
   * @param {DocumentProvider} provider - the associated {@link DocumentProvider} to be used
   * @param {string} dir - TODO: document
   * @param {AssetFeatureDocumentContext~FileGroup[]} fileGroups - TODO: document
   * @param {?File} previewFile - TODO: document
   * @param {Object} data - the data to be used
   * @param {?DocumentContext} parent - the parent {@link DocumentContext} to be used (may be <code>null</code> if there
   * is no parent)
   * @param {Config} config - the {@link Config} to be used
   * @public
   */
  constructor(provider, dir, fileGroups, previewFile, data, parent, config) {
    super(provider, data, parent, config);

    this[_dir] = dir;
    this[_fileGroups] = fileGroups;
    this[_previewFile] = previewFile;
  }

  /**
   * TODO: document
   *
   * @return {string}
   * @public
   */
  get dir() {
    return this[_dir];
  }

  /**
   * TODO: document
   *
   * @return {AssetFeatureDocumentContext~FileGroup[]}
   * @public
   */
  get fileGroups() {
    return this[_fileGroups].slice();
  }

  /**
   * TODO: document
   *
   * @return {?File}
   * @public
   */
  get previewFile() {
    return this[_previewFile];
  }

  /**
   * @inheritdoc
   * @override
   */
  get title() {
    const { previewFile } = this;
    if (!previewFile) {
      return super.title;
    }

    const base = previewFile.base();
    const titles = this.get('titles', {});

    return titles[base] || base;
  }

}

module.exports = AssetFeatureDocumentContext;

/**
 * TODO: document
 *
 * @typedef {Object} AssetFeatureDocumentContext~FileGroup
 * @property {AssetFeatureDocumentContext~FileInfo[]} files -
 * @property {File} [optimized] -
 */

/**
 * TODO: document
 *
 * @typedef {Object} AssetFeatureDocumentContext~FileInfo
 * @property {File} file -
 * @property {Size} size -
 */
