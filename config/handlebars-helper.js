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
  tweetCountReplies: function (tweet) {
    return tweet.Replies.length
  },
  tweetCountLikes: function (tweet) {
    return tweet.Likes.length
  },
  userCountTweets: function (user) {
    return user.Tweets.length
  },
  userCountLikes: function (user) {
    return user.Likes.length
  },
  userCountFollowings: function (user) {
    return user.Followings.length
  },
  userCountFollowers: function (user) {
    return user.Followers.length
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