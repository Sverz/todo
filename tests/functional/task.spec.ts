import { test } from '@japa/runner'
import User from 'App/Models/User'
import Task from 'App/Models/Task'
import { DateTime } from 'luxon'
import supertest from 'supertest'
import { Ignitor } from '@adonisjs/core/build/standalone'

let httpServer: any

test.group('TasksController (cookie auth)', (group) => {
  let cookie: string
  let userId: number

  group.setup(async () => {
    const ignitor = new Ignitor(__dirname + '/../..')
    const app = await ignitor.httpServer().start()
    httpServer = app
  })

  group.each.setup(async () => {
    await Task.query().delete()
    await User.query().delete()

    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
    })
    userId = user.id

    const { header } = await supertest(httpServer)
      .post('/api/auth/login')
      .type('form')
      .send({
        email: user.email,
        password: 'password123',
      })

    cookie = header['set-cookie'][0]
  })

  group.teardown(async () => {
    await httpServer.close()
  })

  test('неавторизований доступ до задач повертає 401', async ({ client }) => {
    const response = await client.get('/api/tasks')
    response.assertStatus(401)
    response.assertBodyContains({ message: 'Unauthenticated' })
  })

  test('отримання задач користувача', async ({ client }) => {
    await Task.createMany([
      {
        title: 'Task 1',
        userId,
        dueDate: DateTime.now(),
      },
      {
        title: 'Task 2',
        userId,
        dueDate: DateTime.now(),
      },
    ])

    const response = await client
      .get('/api/tasks')
      .header('cookie', cookie)
    response.assertStatus(200)
    response.assertBodyContains([{ title: 'Task 1' }, { title: 'Task 2' }])
  })

  test('створення задачі', async ({ client }) => {
    const response = await client
      .post('/api/tasks')
      .form({
        title: 'Нова задача',
        due_date: DateTime.now().toISODate(),
      })
      .header('cookie', cookie)
    response.assertStatus(201)
    response.assertBodyContains({ title: 'Нова задача' })
  })

  test('валидація обовʼязкових полів при створенні задачі', async ({ client }) => {
    const response = await client
      .post('/api/tasks')
      .form({})
      .header('cookie', cookie)
    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        { field: 'title' },
        { field: 'due_date' },
      ],
    })
  })

  test('оновлення задачі', async ({ client }) => {
    const task = await Task.create({
      title: 'Стара назва',
      userId,
      dueDate: DateTime.now(),
    })

    const response = await client
      .put(`/api/tasks/${task.id}`)
      .form({ title: 'Нова назва' })
      .header('cookie', cookie)
    response.assertStatus(200)
    response.assertBodyContains({ title: 'Нова назва' })
  })

  test('видалення задачі', async ({ client }) => {
    const task = await Task.create({
      title: 'Для видалення',
      userId,
      dueDate: DateTime.now(),
    })

    const response = await client
      .delete(`/api/tasks/${task.id}`)
      .header('cookie', cookie)
    response.assertStatus(200)
    response.assertBodyContains({ message: 'Task deleted' })
  })
})
