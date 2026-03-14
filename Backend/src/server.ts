import "reflect-metadata"
import { app } from "./app"
import { AppDataSource } from "./config/database"

const PORT = process.env.PORT ?? 3000

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully")
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err: Error) => {
    console.error("Failed to connect to database:", err.message)
    process.exit(1)
  })
