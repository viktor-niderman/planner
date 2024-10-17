import AutomergeDatabaseManager from '../database/DatabaseManager.js'

const args = process.argv.slice(2)

if (args.length < 2) {
  console.error('node addUser.js <login> <password>')
  process.exit(1)
}

const [login, password] = args

const db = new AutomergeDatabaseManager()
db.users.add(login, password)
