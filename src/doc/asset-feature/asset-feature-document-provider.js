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

const _ = require('lodash');
const chalk = require('chalk');
const debug = require('debug')('brander:doc:asset-feature');
const path = require('path');
const pluralize = require('pluralize');

const AssetFeatureDocumentContext = require('./asset-feature-document-context');
const DocumentContext = require('../document-context');
const DocumentProvider = require('../document-provider');
const File = require('../../file');
const Size = require('../../size');

const _findFiles = Symbol('findFiles');
const _getDirPaths = Symbol('getDirPaths');
const _getFileGroups = Symbol('getFileGroups');
const _renderChild = Symbol('renderChild');
const _renderHeaders = Symbol('renderHeaders');
const _renderPreview = Symbol('renderPreview');
const _renderRow = Symbol('renderRow');
const _renderSeparator = Symbol('renderSeparator');

/**
 * An implementation of {@link DocumentProvider} that handles documents of the "asset-feature" type.
 *
 * One of the most complex and yet, hopefully, simple implementations to use that showcases brand assets.
 *
 * Here's a basic example of the configuration for a asset-feature document:
 *
 * <pre>
 * {
 *   "type": "asset-feature",
 *   "dir": "logo/&#42;/",
 *   "preview": "!(&#42;.min).svg",
 *   "files": [
 *     "&#42;.png",
 *     [ "!(&#42;.min).svg", "&#42;.min.svg" ]
 *   ],
 *   "titles": {
 *     "my-brand-logo.svg": "Logo",
 *     "my-brand-logo-fill.svg": "Logo (Inverted)"
 *   }
 * }
 * </pre>
 *
 * When an item within the "files" configuration is an array, the second item within that array is treated as an
 * optimized version and its link is displayed in a separate column.
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
        const sizes = await Size.fromImage(file.absolute);

        fileInfos.push({
          file,
          sizes: _.sortBy(sizes, [ 'size.width', 'size.height' ])
        });
      }

      fileGroups.push({
        files: _.sortBy(fileInfos, [ 'sizes[0].width', 'sizes[0].height' ]),
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

    sortBy = _.trim(sortBy) || '<%= files[0].file.type %>';
    sortOrder = _.trim(sortOrder).toLowerCase() || 'asc';

    return _.orderBy(fileGroups, (fileGroup) => config.evaluate(sortBy, fileGroup), sortOrder);
  }

  /**
   * @inheritdoc
   * @override
   */
  async createContext(data, parent, config) {
    const type = this.getType();

    debug('Creating context for %s document...', type);

    const childContexts = [];
    const dirPaths = await AssetFeatureDocumentProvider[_getDirPaths](data, config);
    const mainContext = new DocumentContext(type, data, parent, config);

    debug('Creating child contexts for %s document...', type);

    for (const dirPath of dirPaths) {
      const [ previewFile ] = await AssetFeatureDocumentProvider[_findFiles](dirPath, data.preview, config);
      const fileGroups = await AssetFeatureDocumentProvider[_getFileGroups](dirPath, data, config);

      debug('Creating child context for %s document containing %d file %s', type, fileGroups.length, pluralize('group',
        fileGroups.length));

      const context = new AssetFeatureDocumentContext(`${type}#child`, dirPath, fileGroups, previewFile, data,
        mainContext, config);

      childContexts.push(context);
    }

    mainContext.children.push(..._.sortBy(childContexts, 'title'));

    return mainContext;
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
    const { config } = context;
    const columns = [
      {
        header: 'Type',
        render(fileGroup) {
          return fileGroup.files[0].file.type;
        }
      },
      {
        header: 'Sizes',
        render(fileGroup) {
          const rowOutput = [];

          for (const file of fileGroup.files) {
            if (!_.isEmpty(rowOutput)) {
              rowOutput.push(' ');
            }

            rowOutput.push('[');
            rowOutput.push(file.sizes.join('+'));
            rowOutput.push('](');

            const fileURL = config.assetURL(file.file.relative);

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
            rowOutput.push('[');
            rowOutput.push(optimized.base());
            rowOutput.push('](');

            const fileURL = config.assetURL(optimized.relative);

            rowOutput.push(fileURL);
            rowOutput.push(')');
          }

          return rowOutput.join('');
        }
      }
    ];
    const output = [];
    const type = this.getType();

    config.logger.log('Rendering %s document...', type);

    debug('Rendering child contexts for %s document...', type);

    for (const childContext of context.children) {
      if (!_.isEmpty(output)) {
        output.push('');
      }

      output.push(...this[_renderChild](childContext, columns));
    }

    return output.join(config.lineSeparator);
  }

  [_renderChild](context, columns) {
    const { fileGroups } = context;
    const title = this.renderTitle(context);
    const output = title ? [ title ] : [];

    if (context.previewFile) {
      debug('Rendering preview file for %s document: %s', context.type, chalk.blue(context.previewFile.relative));

      output.push(this[_renderPreview](context));
      output.push('');
    }

    debug('Rendering %d %s for %s document', columns.length, pluralize('header', columns.length), context.type);

    output.push(this[_renderHeaders](columns));
    output.push(this[_renderSeparator](columns));

    debug('Rendering %d %s for %s document', fileGroups.length, pluralize('row', fileGroups.length), context.type);

    for (const fileGroup of fileGroups) {
      output.push(this[_renderRow](fileGroup, columns));
    }

    return output;
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

    const filePath = config.relative(path.join(config.assetsDir, context.dir)).replace(/\\/g, '/');
    const fileURL = config.docURL(filePath);

    output.push(fileURL);
    output.push(')');

    return output.join('');
  }

  [_renderRow](fileGroup, columns) {
    const output = [];

    for (const column of columns) {
      output.push(` ${column.render(fileGroup)} `);
    }

    return `|${output.join('|')}|`;
  }

  [_renderSeparator](columns) {
    const output = [];

    for (const column of columns) {
      output.push(` ${'-'.repeat(column.header.length)} `);
    }

    return `|${output.join('|')}|`;
  }

}

module.exports = AssetFeatureDocumentProvider;
