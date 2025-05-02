import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Task from 'App/Models/Task'
import { schema } from '@ioc:Adonis/Core/Validator'

export default class TasksController {
    public async getAll({ auth }: HttpContextContract) {
        const user = auth.user!
        return await Task.query().where('user_id', user.id)
    }

    public async store({ request, auth, response }: HttpContextContract) {
        const taskSchema = schema.create({
            title: schema.string(),
            due_date: schema.date.optional()
        })

        const data = await request.validate({ schema: taskSchema })
        const task = await Task.create({ ...data, userId: auth.user!.id })
        return response.created(task)
    }

    public async getById({ auth, params }: HttpContextContract) {
        return await Task.query().where('id', params.id).where('user_id', auth.user!.id)
    }

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

    public async destroy({ params, auth, response }: HttpContextContract) {
        const task = await Task.query().where('id', params.id).where('user_id', auth.user!.id).firstOrFail()
        await task.delete()
        return response.ok({ message: 'Task deleted' })
    }

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