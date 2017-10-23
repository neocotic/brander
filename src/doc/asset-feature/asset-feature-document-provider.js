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

const _ = require('lodash');
const path = require('path');

const AssetFeatureDocumentContext = require('./asset-feature-document-context');
const DocumentProvider = require('../document-provider');
const File = require('../../file');
const Size = require('../../size');

const _findFiles = Symbol('findFiles');
const _getDirPaths = Symbol('getDirPaths');
const _getFileGroups = Symbol('getFileGroups');
const _renderHeaders = Symbol('renderHeaders');
const _renderPreview = Symbol('renderPreview');
const _renderRow = Symbol('renderRow');
const _renderSeparator = Symbol('renderSeparator');

// TODO: Add debug logging

/**
 * TODO: document
 *
 * @public
 */
class AssetFeatureDocumentProvider extends DocumentProvider {

  static async [_findFiles](dirPath, pattern, config) {
    dirPath = config.assetPath(dirPath);
    pattern = _.trim(pattern);

    const filePaths = pattern ? await File.findFiles(pattern, { cwd: dirPath }) : [];
    if (_.isEmpty(filePaths)) {
      return [];
    }

    return filePaths.map((filePath) => {
      const dir = path.dirname(path.join(dirPath, filePath));
      const name = path.basename(filePath);
      const format = File.deriveFormat(name);

      return new File(dir, name, format, config, true);
    });
  }

  static [_getDirPaths](data, config) {
    const assetsDir = config.resolve(config.assetsDir);
    const dirPattern = _.trim(data.dir);

    return dirPattern ? File.findFiles(dirPattern, { cwd: assetsDir }) : [ assetsDir ];
  }

  static async [_getFileGroups](dirPath, data, config) {
    const fileDescriptors = _.castArray(data.files) || [];
    const fileGroups = [];

    for (const fileDescriptor of fileDescriptors) {
      let mainFilePattern;
      let optimizedFilePattern;

      if (Array.isArray(fileDescriptor)) {
        [ mainFilePattern, optimizedFilePattern ] = fileDescriptor;
      } else {
        mainFilePattern = fileDescriptor;
      }

      const files = await AssetFeatureDocumentProvider[_findFiles](dirPath, mainFilePattern, config);
      if (_.isEmpty(files)) {
        continue;
      }

      const [ optimized ] = await AssetFeatureDocumentProvider[_findFiles](dirPath, optimizedFilePattern, config);
      const fileInfos = [];

      for (const file of files) {
        const size = await Size.fromImage(file.absolute);

        fileInfos.push({ file, size });
      }

      fileGroups.push({
        files: _.sortBy(fileInfos, [ 'size.width', 'size.height' ]),
        optimized
      });
    }


    let sortBy;
    let sortOrder;

    if (Array.isArray(data.sortBy)) {
      [ sortBy, sortOrder ] = data.sortBy;
    } else {
      sortBy = data.sortBy;
    }

    sortBy = _.trim(sortBy) || '<%= files[0].type %>';
    sortOrder = _.trim(sortOrder).toLowerCase() || 'asc';

    return _.orderBy(fileGroups, (fileGroup) => config.evaluate(sortBy, fileGroup), sortOrder);
  }

  /**
   * @inheritdoc
   * @override
   */
  async createContexts(data, parent, config) {
    const contexts = [];
    const dirPaths = await AssetFeatureDocumentProvider[_getDirPaths](data, config);

    for (const dirPath of dirPaths) {
      const [ previewFile ] = await AssetFeatureDocumentProvider[_findFiles](dirPath, data.preview, config);
      const fileGroups = await AssetFeatureDocumentProvider[_getFileGroups](dirPath, data, config);
      const context = new AssetFeatureDocumentContext(this, dirPath, fileGroups, previewFile, data, parent, config);

      contexts.push(context);
    }

    return _.sortBy(contexts, 'title');
  }

  /**
   * @inheritdoc
   * @override
   */
  getType() {
    return 'asset-feature';
  }

  /**
   * @inheritdoc
   * @override
   */
  render(context) {
    const columns = [
      {
        header: 'Type',
        render(fileGroup) {
          return fileGroup.files[0].type;
        }
      },
      {
        header: 'Sizes',
        render(fileGroup) {
          const rowOutput = [];

          for (const file of fileGroup.files) {
            rowOutput.push('[');
            rowOutput.push(file.size);
            rowOutput.push('](');

            const fileURL = context.config.assetURL(file.file.relative);

            rowOutput.push(fileURL);
            rowOutput.push(')');
          }

          return rowOutput.join('');
        }
      },
      {
        header: 'Optimized',
        render(fileGroup) {
          const { optimized } = fileGroup;
          const rowOutput = [];

          if (optimized) {
            rowOutput.push('([optimized](');

            const fileURL = context.config.assetURL(optimized.relative);

            rowOutput.push(fileURL);
            rowOutput.push('))');
          }

          return rowOutput.join('');
        }
      }
    ];
    const output = [];

    if (context.previewFile) {
      output.push(this[_renderPreview](context));
      output.push('');
    }

    output.push(this[_renderHeaders](columns));
    output.push(this[_renderSeparator](columns));

    for (const fileGroup of context.fileGroups) {
      output.push(this[_renderRow](columns, fileGroup));
    }

    return output.join(context.config.lineSeparator);
  }

  [_renderHeaders](columns) {
    const output = [];

    for (const column of columns) {
      output.push(` ${column.header} `);
    }

    return `|${output.join('|')}|`;
  }

  [_renderPreview](context) {
    const { config, previewFile } = context;
    const output = [];
    output.push('[![');
    output.push(previewFile.base());
    output.push('](');
    output.push(config.assetURL(previewFile.relative));
    output.push(')](');

    const filePath = config.relative(context.dir).replace(/\\/g, '/');
    const fileURL = config.repository.fileURL(filePath);

    output.push(fileURL);
    output.push(')');

    return output.join('');
  }

  [_renderRow](columns, fileGroup) {
    const output = [];

    for (const column of columns) {
      output.push(` ${column.render(fileGroup)} `);
    }

    return `|${output.join('|')}|`;
  }

  [_renderSeparator](columns) {
    const output = [];

    for (const column of columns) {
      const columnStr = String(column);

      output.push('-'.repeat(columnStr.length + 2));
    }

    return `|${output.join('|')}|`;
  }

}

module.exports = AssetFeatureDocumentProvider;
