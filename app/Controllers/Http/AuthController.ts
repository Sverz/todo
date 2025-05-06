import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import Mail from '@ioc:Adonis/Addons/Mail'
import Env from '@ioc:Adonis/Core/Env'

export default class AuthController {

    /**
     * @register
     * @summary Реєстрація нового користувача
     * @description Реєструє нового користувача за email та паролем
     * @requestBody {"email": "user@example.com", "password": "string123"}
     * @responseBody 201 - {"message": "User registered", "user": {"id": 1, "email": "user@example.com"}}
     * @responseBody 422 - {"errors": ["Validation error"]}
     */
    public async register({ request, auth, response }: HttpContextContract) {
        const userSchema = schema.create({
            email: schema.string([rules.email(), rules.unique({ table: 'users', column: 'email' })]),
            password: schema.string([rules.minLength(8), rules.regex(/[0-9]/)])
        })

        const data = await request.validate({ schema: userSchema })
        const user = await User.create(data)
        await auth.use('web').login(user)
        return response.created({ message: 'User registered', user })
    }

    /**
     * @login
     * @summary Логін користувача
     * @description Аутентифікація за email та паролем
     * @requestBody {"email": "user@example.com", "password": "string123"}
     * @responseBody 200 - {"message": "Login successful"}
     * @responseBody 401 - {"message": "Invalid credentials"}
     */
    public async login({ request, auth, response }: HttpContextContract) {
        const loginSchema = schema.create({
            email: schema.string([rules.email()]),
            password: schema.string()
        })

        const { email, password } = await request.validate({ schema: loginSchema })
        await auth.use('web').attempt(email, password)
        return response.ok({ message: 'Login successful' })
    }

    /**
     * @logout
     * @summary Вихід користувача
     * @description Вихід з поточної сесії
     * @responseBody 200 - {"message": "Logout successful"}
     */
    public async logout({ auth, response }: HttpContextContract) {
        await auth.use('web').logout()
        return response.ok({ message: 'Logout successful' })
    }

    /**
     * @forgotPassword
     * @summary Запит на скидання пароля
     * @description Надсилає email з токеном для скидання пароля
     * @requestBody {"email": "user@example.com"}
     * @responseBody 200 - {"message": "Інструкція надіслана на email"}
     * @responseBody 400 - {"message": "Користувача не знайдено"}
     */
    public async forgotPassword({ request, response }: HttpContextContract) {
        const email = request.input('email')
        if (!email) return response.badRequest('Email is empty')

        const user = await User.findBy('email', email)

        if (!user) return response.badRequest({ message: 'Користувача не знайдено' })

        const token = uuidv4()

        user.resetToken = token
        user.resetTokenExpiresAt = DateTime.now().plus({ hours: 1 })
        await user.save()

        await Mail.send((message) => {
            message
                .from('hello@demomailtrap.co')
                .to(user.email)
                .subject('Скидання пароля')
                .html(`
                <p>Привіт!</p>
                <p>Натисни на лінк нижче, щоб скинути пароль:</p>
                <a href="http://${Env.get('HOST')}:${Env.get('PORT')}/api/auth/reset-password?token=${token}">Скинути пароль</a>
              `)
        })

        return { message: 'Інструкція надіслана на email' }
    }

    /**
     * @resetPassword
     * @summary Скидання пароля
     * @description Оновлює пароль користувача за токеном
     * @requestBody {"token": "uuid-token", "password": "newPassword123"}
     * @responseBody 200 - {"message": "Пароль змінено"}
     * @responseBody 400 - {"message": "Невалідний або прострочений токен"}
     */
    public async resetPassword({ request, response }: HttpContextContract) {
        const token = request.input('token')
        const password = request.input('password')

        const user = await User.query().where('reset_token', token).first()

        if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < DateTime.now()) {
            return response.badRequest({ message: 'Невалідний або прострочений токен' })
        }

        user.password = password
        user.resetToken = null
        user.resetTokenExpiresAt = null
        await user.save()

        return { message: 'Пароль змінено' }
    }

}