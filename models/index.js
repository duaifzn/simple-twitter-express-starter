'use strict'

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const basename = path.basename(__filename)
let env = process.env.NODE_ENV || 'development' // Bob: 其他組員與個人Ubuntu上的設定

// if (env !== 'development') { // 因應自動化測試註解掉
//   env = process.env.NODE_ENV.parse || 'development' //  Bob:用if達成相容性設定，個人win10SP4得加上.parse，否則npm run dev就跳錯誤；並在config加上"operatorsAliases": false，才不會有錯誤訊息
// }

const config = require(path.join(__dirname, '/../config/config.json'))[env]
const db = {}

let sequelize
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config)
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config)
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
  })
  .forEach(file => {
    const model = sequelize.import(path.join(__dirname, file))
    db[model.name] = model
  })

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
