import 'dotenv/config'
import { app } from './app.js'
import { connectDatabase } from './db.js'

const port = process.env.PORT || 5000

connectDatabase()
  .then(() => {
    app.listen(port, () => console.log(`Gatherwell API listening on port ${port}`))
  })
  .catch((error) => {
    console.error('Unable to connect to MongoDB', error)
    process.exitCode = 1
  })