import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Task from 'App/Models/Task'
import { schema } from '@ioc:Adonis/Core/Validator'

export default class TasksController {
    /**
     * @getAll
     * @summary Отримати всі задачі користувача
     * @description Повертає всі задачі, прив'язані до користувача
     * @responseBody 200 - {"message": "Tasks retrieved", "tasks": [{"id": 1,"title": "Завершити таску","status": "done","due_date": "2025-05-10T00:00:00.000Z","user_id": 5,"created_at": "2025-05-01T12:00:00.000Z","updated_at": "2025-05-05T08:30:00.000Z"}]}
     */
    public async getAll({ auth }: HttpContextContract) {
        const user = auth.user!
        const tasks = await Task.query().where('user_id', user.id)
        return { message: 'Tasks retrieved', tasks }
    }

    /**
     * @store
     * @summary Створення задачі
     * @description Створює нову задачу для користувача
     * @requestBody {"title": "Нова задача","due_date": "2025-05-05"}
     * @responseBody 201 - {"id": 1,"title": "Нова задача","status": "toDo","due_date": "2025-05-05T00:00:00.000Z","user_id": 1,"created_at": "2025-05-05T10:00:00.000Z","updated_at": "2025-05-05T10:00:00.000Z"}
     * @responseBody 422 - {"errors": [{"message": "Validation failed"}]}
     */
    public async store({ request, auth, response }: HttpContextContract) {
        const taskSchema = schema.create({
            title: schema.string(),
            due_date: schema.date.optional()
        })
        const data = await request.validate({ schema: taskSchema })
        const task = await Task.create({ ...data, userId: auth.user!.id })
        return response.created(task)
    }

    /**
     * @getById
     * @summary Отримати задачу за ID
     * @paramPath id - ID задачі
     * @responseBody 200 - {"id": 1,"title": "Завершити таску","status": "done","due_date": "2025-05-10T00:00:00.000Z","user_id": 5,"created_at": "2025-05-01T12:00:00.000Z","updated_at": "2025-05-05T08:30:00.000Z"}
     * @responseBody 404 - {"message": "Task not found"}
     */
    public async getById({ auth, params }: HttpContextContract) {
        return await Task.query().where('id', params.id).where('user_id', auth.user!.id).firstOrFail()
    }

    /**
     * @update
     * @summary Оновлення задачі
     * @paramPath id - ID задачі
     * @requestBody {"title": "Оновлена назва","status": "done","due_date": "2025-05-07"}
     * @responseBody 200 - {"id": 1, "title":"Оновлена назва","status":"done","due_date": "2025-05-07T00:00:00.000Z","user_id": 5,"created_at": "2025-05-01T12:00:00.000Z","updated_at": "2025-05-05T08:30:00.000Z"}
     * @responseBody 404 - {"message": "Task not found"}
     */
    public async update({ request, params, auth, response }: HttpContextContract) {
        const task = await Task.query().where('id', params.id).where('user_id', auth.user!.id).firstOrFail()
        const updateSchema = schema.create({
            title: schema.string.optional(),
            status: schema.string.optional(),
            due_date: schema.date.optional(),
        })
        const data = await request.validate({ schema: updateSchema })
        task.merge(data)
        await task.save()
        return response.ok(task)
    }

    /**
     * @destroy
     * @summary Видалення задачі
     * @paramPath id - ID задачі
     * @responseBody 200 - {"message": "Task deleted"}
     * @responseBody 404 - {"message": "Task not found"}
     */
    public async destroy({ params, auth, response }: HttpContextContract) {
        const task = await Task.query().where('id', params.id).where('user_id', auth.user!.id).firstOrFail()
        await task.delete()
        return response.ok({ message: 'Task deleted' })
    }

    /**
     * @updateStatus
     * @summary Оновлення статусу задачі
     * @paramPath id - ID задачі
     * @paramQuery status - Статус задачі - @enum(toDo, inProgress, done)
     * @responseBody 200 - {"message": "Task status updated", "todo": {"id": 1,"title": "Завершити таску","status": "done","due_date": "2025-05-10T00:00:00.000Z","user_id": 5,"created_at": "2025-05-01T12:00:00.000Z","updated_at": "2025-05-05T08:30:00.000Z"} }
     * @responseBody 400 - {"message": "Invalid status. Valid values: toDo, inProgress, done."}
     * @responseBody 404 - {"message": "Task not found"}
     */
    public async updateStatus({ request, params, auth, response }: HttpContextContract) {
        const status = request.qs().status
        const validStatuses = ['toDo', 'inProgress', 'done']
        if (!validStatuses.includes(status)) {
            return response.badRequest({ message: 'Invalid status. Valid values: toDo, inProgress, done.' })
        }
        const todo = await Task.query()
            .where('id', params.id)
            .where('user_id', auth.user!.id)
            .firstOrFail()
        todo.status = status
        await todo.save()
        return response.ok({ message: 'Task status updated', todo })
    }
}
