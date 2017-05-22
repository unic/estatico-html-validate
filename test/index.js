const fs = require('fs')
const should = require('should') // eslint-disable-line

let write
let log = ''

module.exports = {
  before: function (done) {
    this.timeout(5000)

    write = process.stdout.write

    // Overwrite stdout to grab validation error log
    process.stdout.write = (s) => {
      log += s.replace(/\[.*?\]/g, '')
    }

    const validate = require('../index.js')

    const config = {
      src: './test/fixtures/*.html',
      srcBase: './test/fixtures',
      dest: './test/results/'
    }

    validate.fn(config).on('finish', done)
  },

  default: function () {
    process.stdout.write = write

    const expected = fs.readFileSync('./test/expected/log.txt').toString()

    expected.should.be.eql(log)
  },

  after: function () {
  }
}
