## Version 0.4.1, 2023.08.29

* Add convert SVG to WEBP task
* Use `sharp` package for PNG resizing to avoid errors converting/packaging to ICO files
* Replace `lodash` package with `lodash-es` for better ESM support
* Bump dependencies

## Version 0.4.0, 2023.08.26

* **Breaking Change:** Switch from CommonJS to ECMAScript modules
* **Breaking Change:** Bump minimum supported Node.js version to LTS release 18
* Replace `to-ico` package dependency with `png-to-ico` to avoid audit problems with transient dependencies
* Replace broad use of Symbols with ES2022 private class fields
* Bump dependencies

## Version 0.3.2, 2022.05.17

* Fix bug where Git repository branch was not being detected

## Version 0.3.1, 2022.05.17

* Fix JSDoc syntax for Promise return types
* Remove branch name from Git repository URL
* Fix handling of CLI options
* Remove RawGit file URL generation
* Consolidate the majority of Markdown generation logic
* Remove redundant Todo comments
* Use `eslint:recommended` ESLint configuration

## Version 0.3.0, 2022.05.17

* **Breaking Change:** Change fallback Git repository branch to `main`
* Fix bug where Git branches were never being resolved
* Bump dependencies
* Change default branch to `main`

## Version 0.2.3, 2022.05.04

* Fix bug after upgrading mkdirp dependency

## Version 0.2.2, 2022.05.04

* Fix bug after upgrading svgo dependency

## Version 0.2.1, 2022.05.04

* Downgrade dependencies using ES Modules

## Version 0.2.0, 2022.04.29

* **Breaking Change:** Require Node.js version 12.20.0 or newer
* Move from !ninja to neocotic
* Bump dependencies & devDependencies

## Version 0.1.9, 2018.03.19

* Fails when repository info is not available or recognized [#35](https://github.com/neocotic/brander/issues/35)
* Pass puppeteer options to tasks using convert-svg packages [#36](https://github.com/neocotic/brander/issues/36)

## Version 0.1.8, 2018.03.09

* Multi-line template support not working correctly [#33](https://github.com/neocotic/brander/issues/33)

## Version 0.1.7, 2018.03.09

* Easy multi-line doc templates using array [#31](https://github.com/neocotic/brander/issues/31)

## Version 0.1.6, 2018.03.08

* Use hosted-git-info@^2.6.0 [#29](https://github.com/neocotic/brander/issues/29)

## Version 0.1.5, 2018.02.08

* Replace chai with assert [#26](https://github.com/neocotic/brander/issues/26)
* Update convert-svg-to-* to ^0.4.0 [#27](https://github.com/neocotic/brander/issues/27)

## Version 0.1.4, 2017.12.14

* Switch to latest version of istanbul [#22](https://github.com/neocotic/brander/issues/22)
* asset-feature preview should use not use Repository directly to generate link URL [#23](https://github.com/neocotic/brander/issues/23)

## Version 0.1.3, 2017.11.03

* Add background option for SVG conversions [#18](https://github.com/neocotic/brander/issues/18)
* Add task to convert SVG to JPEG [#20](https://github.com/neocotic/brander/issues/20)
* Update svgo to ^1.0.2 [#21](https://github.com/neocotic/brander/issues/21)

## Version 0.1.2, 2017.10.30

* Add default footer for docs [#7](https://github.com/neocotic/brander/issues/7) [#12](https://github.com/neocotic/brander/issues/12)
* Add scale option for SVG conversions [#10](https://github.com/neocotic/brander/issues/10) [#15](https://github.com/neocotic/brander/issues/15)
* Add baseFile and baseUrl options for SVG conversions [#11](https://github.com/neocotic/brander/issues/11) [#15](https://github.com/neocotic/brander/issues/15)
* Add quiet option to CLI [#14](https://github.com/neocotic/brander/issues/14) [#17](https://github.com/neocotic/brander/issues/17)

## Version 0.1.1, 2017.10.24

* Title not rendered for each file group within asset-feature document [#2](https://github.com/neocotic/brander/issues/2)
* Add "hr" document type for horizontal rule [#3](https://github.com/neocotic/brander/issues/3)
* Add "container" document type for wrapping other document sections [#4](https://github.com/neocotic/brander/issues/4)

## Version 0.1.0, 2017.10.24

* Initial release
