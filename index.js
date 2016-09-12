/*!
 * base-task-render <https://github.com/tunnckoCore/base-task-render>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

'use strict'

var path = require('path')
var utils = require('./utils')

/**
 * > Adds `.taskRender` method to your app
 * which makes it easier to create and run
 * tasks which need rendering. It uses
 * [base-fs-conflicts][] to detect file
 * conflicts.
 *
 * **Example**
 *
 * ```js
 * // Plugins
 * var fs = require('base-fs')
 * var tasks = require('base-task')
 * var render = require('assemble-render-file')
 * var conflicts = require('base-fs-conflicts')
 * var taskAlias = require('base-task-alias')
 * var taskRender = require('base-task-render')
 *
 * // Create app
 * var Base = require('base')
 * var app = new Base()
 *
 * // Load plugins
 * app.use(tasks())
 * app.use(render())
 * app.use(taskRender())
 * app.use(conflicts())
 * app.use(fs())
 *
 * // Tasks
 * app.taskAlias('foo', ['bar', 'qux'])
 * app.taskRender('foo', '*.md')
 *
 * // `.taskAlias` created `bar` and `qux` aliases
 * // of the `foo` task
 * app.build('qux', function (err) {
 *   if (err) return console.error(err)
 *
 *   // => render all markdown files from `templates/` dir
 *   // or pass `app.options.srcBase` if you want to change it
 * })
 * ```
 *
 * @param  {Object} `options` object to merge with `app.options`
 * @return {Function} plugin executed by `.use` method
 * @api public
 */

module.exports = function baseTaskAlias (options) {
  return function plugin (app) {
    if (!utils.isValid(app, 'base-task-render')) return

    app.options = utils.merge({}, app.options, options)

    /**
     * Ensure needed methods exists
     */

    app.use(utils.task())
    app.use(utils.conflics())
    app.use(utils.render())
    app.use(utils.fs())

    /**
     * > Creates a task with `name` to render glob
     * of `patterns` from `templates/` directory (default),
     * or from `app.options.srcBase` using `*` engine. It also
     * checks for file conflicts using [base-fs-conflicts][].
     *
     * **Example**
     *
     * ```js
     * app.use(taskRender())
     *
     * app.taskRender('foo', ['CONTRIBUTING.md', '*.md'])
     * app.build('foo', console.log)
     * // => will render all markdown files
     * // from `templates/` directory (default)
     * ```
     *
     * @name   .taskRender
     * @param  {String} `name` task name
     * @param  {Object|Array} `opts` options passed to `.task` or array of `deps`
     * @param  {Array|String} `deps` list of dependency tasks
     * @param  {Array|String} `patterns` list of patterns to pass to `.src` method
     * @return {Object} return `this` instance for chaining
     * @api public
     */

    app.define('taskRender', function taskRender (name, opts, deps, patterns) {
      var isOk = utils.isArray(opts)
      deps = isOk ? opts : deps
      patterns = isOk ? deps : patterns
      opts = !isOk && typeof opts === 'object' ? opts : {}

      app.task(name, opts, utils.arraify(deps), function (cb) {
        if (!utils.isArray(patterns) && typeof patterns !== 'string') {
          var message = 'expect `patterns` to be a string or an array.'
          cb(new TypeError(message))
          return
        }

        // lookup in global options or in task options
        var src = app.options.srcBase || opts.srcBase
        src = src || path.join(__dirname, 'templates')

        return app.src(utils.arraify(patterns), { cwd: src })
          .pipe(app.renderFile('*')).on('error', cb)
          .pipe(app.conflicts(app.cwd)).on('error', cb)
          .pipe(app.dest(app.cwd)).on('error', cb)
      })

      return this
    })

    return plugin
  }
}
