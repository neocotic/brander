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

import chalk from 'chalk';
import Debug from 'debug';
import { castArray, isEmpty, orderBy, sortBy, trim } from 'lodash-es';
import path from 'node:path';
import pluralize from 'pluralize';

import { AssetFeatureDocumentContext } from './asset-feature-document-context.mjs';
import { DocumentContext } from '../document-context.mjs';
import { DocumentProvider } from '../document-provider.mjs';
import { File } from '../../file.mjs';
import { createMarkdownImage } from '../../markdown/image.mjs';
import { appendMarkdownLink, createMarkdownLink } from '../../markdown/link.mjs';
import { appendMarkdownTable } from '../../markdown/table.mjs';
import { Size } from '../../size.mjs';

const debug = Debug('brander:doc:asset-feature');

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
export default class AssetFeatureDocumentProvider extends DocumentProvider {

  /**
   * @param {string} dirPath
   * @param {string} pattern
   * @param {Config} config
   * @return {Promise<File[]>}
   * @private
   */
  static async #findFiles(dirPath, pattern, config) {
    dirPath = config.assetPath(dirPath);
    pattern = trim(pattern);

    const filePaths = pattern ? await File.findFiles(pattern, { cwd: dirPath }) : [];
    return filePaths.map((filePath) => {
      const dir = path.dirname(path.join(dirPath, filePath));
      const name = path.basename(filePath);
      const format = File.deriveFormat(name);

      return new File(dir, name, format, config, true);
    });
  }

  /**
   * @param {Object} data
   * @param {Config} config
   * @return {Promise<string[]>}
   * @private
   */
  static async #getDirPaths(data, config) {
    const assetsDir = config.resolve(config.assetsDir);
    const dirPattern = trim(data.dir);

    return dirPattern ? File.findFiles(dirPattern, { cwd: assetsDir }) : [ assetsDir ];
  }

  /**
   * @param {string} dirPath
   * @param {Object} data
   * @param {Config} config
   * @return {Promise<string[]>}
   * @private
   */
  static async #getFileGroups(dirPath, data, config) {
    const fileDescriptors = castArray(data.files) || [];
    const fileGroups = [];

    for (const fileDescriptor of fileDescriptors) {
      let mainFilePattern;
      let optimizedFilePattern;

      if (Array.isArray(fileDescriptor)) {
        [ mainFilePattern, optimizedFilePattern ] = fileDescriptor;
      } else {
        mainFilePattern = fileDescriptor;
      }

      const files = await AssetFeatureDocumentProvider.#findFiles(dirPath, mainFilePattern, config);
      if (isEmpty(files)) {
        continue;
      }

      const [ optimized ] = await AssetFeatureDocumentProvider.#findFiles(dirPath, optimizedFilePattern, config);
      const fileInfos = [];

      for (const file of files) {
        const sizes = Size.fromImage(file.absolute);

        fileInfos.push({
          file,
          sizes: sortBy(sizes, [ 'size.width', 'size.height' ])
        });
      }

      fileGroups.push({
        files: sortBy(fileInfos, [ 'sizes[0].width', 'sizes[0].height' ]),
        optimized
      });
    }


    let sortByValue, sortOrder;

    if (Array.isArray(data.sortBy)) {
      [ sortByValue, sortOrder ] = data.sortBy;
    } else {
      sortByValue = data.sortBy;
    }

    sortByValue = trim(sortByValue) || '<%= files[0].file.type %>';
    sortOrder = trim(sortOrder).toLowerCase() || 'asc';

    return orderBy(fileGroups, (fileGroup) => config.evaluate(sortByValue, fileGroup), sortOrder);
  }

  /**
   * @inheritdoc
   * @override
   */
  async createContext(data, parent, config) {
    const type = this.getType();

    debug('Creating context for %s document...', type);

    const childContexts = [];
    const dirPaths = await AssetFeatureDocumentProvider.#getDirPaths(data, config);
    const mainContext = new DocumentContext(type, data, parent, config);

    debug('Creating child contexts for %s document...', type);

    for (const dirPath of dirPaths) {
      const [ previewFile ] = await AssetFeatureDocumentProvider.#findFiles(dirPath, data.preview, config);
      const fileGroups = await AssetFeatureDocumentProvider.#getFileGroups(dirPath, data, config);

      debug('Creating child context for %s document containing %d file %s', type, fileGroups.length, pluralize('group',
        fileGroups.length));

      const context = new AssetFeatureDocumentContext(`${type}#child`, dirPath, fileGroups, previewFile, data,
        mainContext, config);

      childContexts.push(context);
    }

    mainContext.children.push(...sortBy(childContexts, 'title'));

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
  async render(context) {
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
            if (!isEmpty(rowOutput)) {
              rowOutput.push(' ');
            }

            appendMarkdownLink(rowOutput, {
              content: file.sizes.join('+'),
              url: config.assetURL(file.file.relative)
            });
          }

          return rowOutput.join('');
        }
      },
      {
        header: 'Optimized',
        render(fileGroup) {
          const { optimized } = fileGroup;

          return optimized ? createMarkdownLink({
            content: optimized.base(),
            url: config.assetURL(optimized.relative)
          }) : '';
        }
      }
    ];
    const output = [];
    const type = this.getType();

    config.logger.log('Rendering %s document...', type);

    debug('Rendering child contexts for %s document...', type);

    for (const childContext of context.children) {
      if (!isEmpty(output)) {
        output.push('');
      }

      output.push(...this.#renderChild(childContext, columns));
    }

    return output.join(config.lineSeparator);
  }

  /**
   * @param {AssetFeatureDocumentContext} context
   * @param {Object[]} columns
   * @return {string[]}
   * @private
   */
  #renderChild(context, columns) {
    const { fileGroups } = context;
    const title = this.renderTitle(context);
    const output = title ? [ title ] : [];

    if (context.previewFile) {
      debug('Rendering preview file for %s document: %s', context.type, chalk.blue(context.previewFile.relative));

      output.push(this.#renderPreview(context));
      output.push('');
    }

    const headers = columns.map((column) => column.header);
    const rows = fileGroups.map((fileGroup) => columns.map((column) => column.render(fileGroup)));

    debug('Rendering %d %s and %d %s for %s document', headers.length, pluralize('header', headers.length), rows.length,
      pluralize('row', rows.length), context.type);

    appendMarkdownTable(output, {
      headers,
      rows
    });

    return output;
  }

  /**
   * @param {AssetFeatureDocumentContext} context
   * @return {string}
   * @private
   */
  #renderPreview(context) {
    const { config, previewFile } = context;
    const image = createMarkdownImage({
      alt: previewFile.base(),
      url: config.assetURL(previewFile.relative)
    });

    const filePath = config.relative(path.join(config.assetsDir, context.dir)).replace(/\\/g, '/');
    const fileURL = config.docURL(filePath);

    return createMarkdownLink({
      content: image,
      url: fileURL
    });
  }

}
