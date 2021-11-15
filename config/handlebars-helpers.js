const moment = require('moment')

module.exports = {
  ifCond: function (a, b, options) {
    if (a === b) {
      return options.fn(this)
    }
    return options.inverse(this)
  },

  moment: function (a) {
    return moment(a).fromNow()
  },

  showRole: function (number) {
    if (number === 1) {
      return 'admin'
    } else {
      return 'user'
    }
  },

  changeRole: function (number) {
    if (number === 1) {
      return 'set as user'
    } else {
      return 'set as admin'
    }
  }
}
