
import Task from "App/Models/Task"
import { DateTime } from "luxon"
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class DashboardController {

    public async dashboard({ auth }: HttpContextContract) {
        const userId = auth.user!.id
        const today = DateTime.now().toFormat('yyyy-LL-dd')

        const tasks = await Task
            .query()
            .where('user_id', userId)
            .andWhere('due_date', today)

        return tasks
    }

}
