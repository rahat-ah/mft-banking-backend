import express from 'express'
import { adminSignin, isAdmin, isAuth, logout, officerDetails, sendVerifyOtp, signin, signUp, verifyOtp } from '../controller/authController.js'
import userAuth from '../middlewere/authMiddlewere.js'
import isAdminAuth from '../middlewere/isAdminMiddlewere.js'

const authRouter = express.Router()

authRouter.post("/signup",signUp)
authRouter.post("/signin",signin)
authRouter.post("/logout",userAuth,logout)
authRouter.post("/admin-signin",adminSignin)
authRouter.post("/send-verify-otp",sendVerifyOtp)
authRouter.post("/verify-otp",verifyOtp)
authRouter.get('/is-auth',userAuth,isAuth)
authRouter.get('/is-admin',isAdminAuth,isAdmin)
authRouter.get('/banking-officer/:id',userAuth,officerDetails)


export default authRouter;