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
  countReplies: function (Replies) {
    return Replies.length
  },
  countLikes: function (Likes) {
    return Likes.length
  },
  countTweets: function (Tweets) {
    return Tweets.length
  },
  countFollowings: function (Followings) {
    return Followings.length
  },
  countFollowers: function (Followers) {
    return Followers.length
  },
  ifFollowed: function (a, b, options) {
    if (a === b) {
      return options.fn(this)
    }
    else {
      return options.inverse(this)
    }
  },

}