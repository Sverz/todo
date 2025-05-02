/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/register', 'AuthController.register')
  Route.post('/login', 'AuthController.login')
  Route.post('/logout', 'AuthController.logout')
  Route.post('/forgot-password', 'AuthController.forgotPassword')
  Route.post('/reset-password', 'AuthController.resetPassword')
}).prefix('/api/auth')

Route.group(() => {
  Route.get('/', 'DashboardController.dashboard')
}).prefix('/api/dashboard').middleware(['auth'])

Route.group(() => {
  Route.get('/', 'TasksController.getAll')
  Route.get('/:id', 'TasksController.getById')
  Route.post('/', 'TasksController.store')
  Route.put('/:id', 'TasksController.update')
  Route.delete('/:id', 'TasksController.destroy')
  Route.put('/status/:id', 'TasksController.updateStatus')
}).prefix('/api/tasks').middleware(['auth'])

