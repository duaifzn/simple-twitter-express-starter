const db = require('../models')
const User = db.User
const helpers = require('../_helpers')

const chatController = {
  chatPage: (req, res) => {
    User.findByPk(helpers.getUser(req).id)
      .then(user => {
        res.render('chat/chat', JSON.parse(JSON.stringify({ userData: user })))
      })
  }
}

module.exports = chatController
