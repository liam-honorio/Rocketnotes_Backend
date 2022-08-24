const {hash, compare} = require("bcryptjs") 
const AppError = require('../utils/AppError')
const UserRepository = require('../repositories/UserRepository')

const sqliteConnection = require('../database/sqlite')
const UserCreateService = require('../services/UserCreateService')

class UsersController {
    /**
     * index - GET para listar vários registros
     * show - GET para exibir um registro específico
     * create - POST para criar um registro
     * update - PUT para atualizar um registro
     * delete - DELETE para remover um registro
     */

     async create(req, res) {
        const {name, email, password} = req.body

        const userRepository = new UserRepository()

        const userCreateService = new UserCreateService(userRepository)

        await userCreateService.execute({name, email, password})

        return res.status(201).json()

        //if (!name) {
        //    throw new AppError("O nome é obrigatório!")
        //}

        //res.status(201).json({name, email, password} )
    }

    async update(req, res) {
        const {name, email, password, old_password} = req.body
        const user_id = req.user.id

        const database = await sqliteConnection()

        const user = await database.get('SELECT * FROM users WHERE id = (?)', [user_id])

        if (!user) {
            throw new AppError("Usuário não encontrado.")
        }

        const userWithUpdatedEmail = await database.get('SELECT * FROM users WHERE email = (?)', [email])

        if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
            throw new AppError("O email já está em uso")
        }

        user.name = name ?? user.name
        user.email = email ?? user.email

        if(password && !old_password) {
            throw new AppError("Você precisa informar a senha antiga para definir a nova senha")
        }

        if(password && old_password) {
            const checkOldPassword = await compare(old_password, user.password)
            if(!checkOldPassword) {
                throw new AppError("A senha antiga não confere.")
            }

            user.password = await hash(password, 8)
        }

        await database.run(`
        UPDATE users SET
        name = ?,
        email = ?,
        password = ?,
        updated_at = DATETIME('now')
        WHERE id = ?`,
        [user.name, user.email, user.password, user_id])

        return res.json()
    }
}

module.exports = UsersController;