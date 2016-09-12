'use strict'

var utils = require('lazy-cache')(require)
var fn = require
require = utils // eslint-disable-line no-undef, no-native-reassign, no-global-assign

/**
 * Lazily required module dependencies
 */

require('assemble-render-file', 'render')
require('base-fs', 'fs')
require('base-fs-conflicts', 'conflicts')
require('base-task', 'task')
require('lazy-utils', 'utils')
require('is-valid-app')
require = fn // eslint-disable-line no-undef, no-native-reassign, no-global-assign

/**
 * Expose `utils` modules
 */

module.exports = utils.utils.extend(utils, utils.utils)
