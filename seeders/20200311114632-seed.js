'use strict'
const bcrypt = require('bcryptjs')
const faker = require('faker')

function randomDate (start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.bulkInsert('Users', [{
      email: 'root@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      role: 'admin',
      name: 'root',
      avatar: faker.image.imageUrl(),
      introduction: faker.lorem.sentences(),
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      email: 'user1@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      role: 'user',
      name: 'user1',
      avatar: faker.image.imageUrl(),
      introduction: faker.lorem.sentences(),
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      email: 'user2@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      role: 'user',
      name: 'user2',
      avatar: faker.image.imageUrl(),
      introduction: faker.lorem.sentences(),
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      email: 'duaifzn@gmail.com',
      password: bcrypt.hashSync('aaa', bcrypt.genSaltSync(10), null),
      role: 'admin',
      name: 'dabon',
      avatar: faker.image.imageUrl(),
      introduction: faker.lorem.sentences(),
      createdAt: new Date(),
      updatedAt: new Date()
    }], {})

    queryInterface.bulkInsert('Tweets',
      Array.from({ length: 100 }).map(d =>
        ({
          UserId: Math.floor(Math.random() * 4) + 1,
          description: faker.lorem.text(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
      ), {})

    return queryInterface.bulkInsert('Replies',
      Array.from({ length: 300 }).map(d =>
        ({
          UserId: Math.floor(Math.random() * 4) + 1,
          TweetId: Math.floor(Math.random() * 100) + 1,
          comment: faker.lorem.text(),
          createdAt: randomDate(new Date(2020, 2, 9), new Date(2020, 2, 11)),
          updatedAt: randomDate(new Date(2020, 2, 12), new Date())
        })
      ), {})
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('Users', null, {})
    queryInterface.bulkDelete('Tweets', null, {})
    return queryInterface.bulkDelete('Replies', null, {})
  }
}
