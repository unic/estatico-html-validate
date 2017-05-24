const name = 'html:validate'

const defaults = {
  src: [
    './build/*.html',
    './build/modules/**/*.html',
    './build/pages/**/*.html'
  ],
  srcBase: './build/',
  plugins: {
    w3cjs: {
      // url: 'http://localhost:8888'
    }
  },
  errorHandler: (error) => {
    const util = require('gulp-util')

    util.log(error.plugin, util.colors.cyan(error.fileName), util.colors.red(error.message))
  },
  watch: [
    // Possibly needs to be disabled due to rate-limited w3c API
    // Altrnative: Use local validator instance
    './build/*.html'
  ]
}

const fn = (options, fileEvents, cb) => {
  const gulp = require('gulp')
  const merge = require('lodash.merge')
  const changed = require('gulp-changed-in-place')
  const w3cjs = require('gulp-w3cjs')
  const through = require('through2')

  const config = merge({}, defaults, options)

  if (typeof fileEvents === 'function') {
    cb = fileEvents
    fileEvents = null
  }

  return gulp.src(config.src, {
    base: config.srcBase
  })

    // Do not pass unchanged files
    .pipe(changed({
      firstPass: true
    }))

    // Send to validation API
    .pipe(w3cjs(config.plugins.w3cjs))

    // Handle errors
    .pipe(through.obj((file, enc, done) => {
      if (!file.w3cjs.success) {
        let error = new Error('Linting error (details above)')

        error.plugin = 'gulp-w3cjs'
        error.fileName = file.path

        config.errorHandler(error)
      }

      done(null, file)
    }))

    // (Optional) callback
    .on('end', cb || (() => {}))
}

module.exports = {
  name,
  fn,
  defaults
}
