import { Router } from 'express'
import { login, register } from '../controllers/controller.js'
export const authRouter = Router()

authRouter.post('/login',    login)
authRouter.post('/register', register)