const moment = require('moment')
const helpers = require('../_helpers')
module.exports = {
  ifRole: function (role, options) {
    if (role === 'admin') {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  },
  moment: function (a) {
    return moment(a).fromNow()
  },
  count: function (data) {
    return data.length
  },
  ifCond: function (a, b, options) {
    if (a === b) {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  }

}
