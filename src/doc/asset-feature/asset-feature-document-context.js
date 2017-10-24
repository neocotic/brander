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

const DocumentContext = require('../document-context');

const _dir = Symbol('dir');
const _fileGroups = Symbol('fileGroups');
const _previewFile = Symbol('previewFile');

/**
 * An implementation of {@link DocumentContext} for asset feature documents.
 *
 * While it's possible to create an instance using the constructor, it's highly recommended that
 * {@link DocumentContextParser} and/or {@link AssetFeatureDocumentProvider} is used instead.
 *
 * @public
 */
class AssetFeatureDocumentContext extends DocumentContext {

  /**
   * Creates an instance of {@link AssetFeatureDocumentContext}.
   *
   * @param {string} type - the type to be used
   * @param {string} dir - the directory to be used
   * @param {AssetFeatureDocumentContext~FileGroup[]} fileGroups - the file groups to be used
   * @param {?File} previewFile - the preview {@link File} to be used (may be <code>null</code>)
   * @param {Object} data - the data to be used
   * @param {?DocumentContext} parent - the parent {@link DocumentContext} to be used (may be <code>null</code> if there
   * is no parent)
   * @param {Config} config - the {@link Config} to be used
   * @public
   */
  constructor(type, dir, fileGroups, previewFile, data, parent, config) {
    super(type, data, parent, config);

    this[_dir] = dir;
    this[_fileGroups] = fileGroups;
    this[_previewFile] = previewFile;
  }

  /**
   * Returns the directory for this {@link AssetFeatureDocumentContext}.
   *
   * @return {string} The directory.
   * @public
   */
  get dir() {
    return this[_dir];
  }

  /**
   * Returns the file groups for this {@link AssetFeatureDocumentContext}.
   *
   * @return {AssetFeatureDocumentContext~FileGroup[]} The file groups.
   * @public
   */
  get fileGroups() {
    return this[_fileGroups].slice();
  }

  /**
   * Returns the preview {@link File} for this {@link AssetFeatureDocumentContext}.
   *
   * @return {?File} The preview file or <code>null</code> if unavailable.
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
 * Contains information on a group of files.
 *
 * @typedef {Object} AssetFeatureDocumentContext~FileGroup
 * @property {AssetFeatureDocumentContext~FileInfo[]} files - The information for all of the files within the group.
 * @property {File} [optimized] - The optimized {@link File} for the group (may be <code>null</code>).
 */

/**
 * Contains information for a specific file contained within a group.
 *
 * @typedef {Object} AssetFeatureDocumentContext~FileInfo
 * @property {File} file - The {@link File}.
 * @property {Size[]} sizes - The {@link Size} instances based on the images contained within <code>file</code>.
 */
