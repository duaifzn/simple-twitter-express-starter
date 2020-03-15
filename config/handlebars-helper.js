const moment = require('moment')
module.exports = {
  ifRole: function (role, options) {
    if (role === 'admin') {
      return options.fn(this)
    }
    else {
      return options.inverse(this)
    }
  },
  moment: function (a) {
    return moment(a).fromNow()
  },
  count: function (data) {
    return data.length
  },
  ifFollowed: function (a, b, options) {
    if (a === b) {
      return options.fn(this)
    }
    else {
      return options.inverse(this)
    }
  },
  ifLiked: function (a, b, options) {
    if (a === b) {
      return options.fn(this)
    }
    else {
      return options.inverse(this)
    }
  },

}