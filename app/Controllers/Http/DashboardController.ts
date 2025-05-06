
import Task from "App/Models/Task"
import { DateTime } from "luxon"
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class DashboardController {

    /**
     * @dashboard
     * @summary Дашборд користувача
     * @description Повертає задачі користувача на сьогодні
     * @responseBody 200 - {"id": 1,"title": "Завершити таску","status": "done","due_date": "2025-05-10T00:00:00.000Z","user_id": 5,"created_at": "2025-05-01T12:00:00.000Z","updated_at": "2025-05-05T08:30:00.000Z"}
     * @responseHeader 200 - @use(paginated)
     */
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
