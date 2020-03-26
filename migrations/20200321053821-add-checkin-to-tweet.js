'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Tweets', 'CheckIn', {
      type: Sequelize.STRING
    })
 },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Tweets', 'CheckIn')
 }
}