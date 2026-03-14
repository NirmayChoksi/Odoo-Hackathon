import { AppDataSource } from "../../config/database"
import { User } from "../../entities/User"

const userRepo = () => AppDataSource.getRepository(User)

export const AuthRepository = {
  findByEmail(email: string) {
    return userRepo().findOne({ where: { email } })
  },

  findByLoginId(loginId: string) {
    return userRepo().findOne({ where: { loginId } })
  },

  createUser(data: Partial<User>) {
    const user = userRepo().create(data)
    return userRepo().save(user)
  },

  saveUser(user: User) {
    return userRepo().save(user)
  },
}
