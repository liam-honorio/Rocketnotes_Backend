const UserCreateService = require('./UserCreateService')
const UserRepositoryInMemory = require('../repositories/UserRepositoryInMemory')
const AppError = require('../utils/AppError')

describe('UserCreateService', () => {

    let userRepository = null
    let userCreateService = null

    beforeEach(()=>{
        userRepository = new UserRepositoryInMemory
        userCreateService = new UserCreateService(userRepository)
    })

    it("User should be created", async () => {
        const user = {
            name: "User Test",
            email: "user@example.com",
            password: "password",
        }
    
        const userCreated = await userCreateService.execute(user)
    
        console.log(userCreated)
    
    
        expect(userCreated).toHaveProperty('id')
    })

    it('User not should be created with existing email', async () => {
        const user1 = {
            name: "User Test 1",
            email:  "user@example.com",
            password: "123"
        }
        const user2 = {
            name: "User Test 2",
            email:  "user@example.com",
            password: "456"
        }

        await userCreateService.execute(user1)
        await expect(userCreateService.execute(user2)).rejects.toEqual(new AppError('Este email já está em uso.'))
    })
})

