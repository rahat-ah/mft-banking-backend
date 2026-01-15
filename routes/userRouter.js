import express from 'express';
import { addCustomer, addPayment, deleteCustomer, getAllCustomers , getBankingTarget, getCustomerById ,getTotalPreviousMonthDueCustomer,searchCustomers,signatureUploder, updateDueComment } from '../controller/userController.js';
import userAuth from '../middlewere/authMiddlewere.js';
import isAdminAuth from '../middlewere/isAdminMiddlewere.js';

const userRouter = express.Router();

userRouter.get('/all-customers',userAuth, getAllCustomers);
userRouter.get('/customer/:id',userAuth, getCustomerById);
userRouter.delete('/delete-customer/:id',isAdminAuth, deleteCustomer);
userRouter.post('/add-customer',isAdminAuth, addCustomer);
userRouter.get("/cloudinary-signature", signatureUploder);
userRouter.post("/search-customers",userAuth, searchCustomers);
userRouter.post("/add-payment",isAdminAuth, addPayment);
userRouter.get("/get-banking-collection-target",userAuth,getBankingTarget);
userRouter.get("/get-total-previous-month-due",userAuth,getTotalPreviousMonthDueCustomer);
userRouter.put("/add-due-comment/:id",isAdminAuth,updateDueComment);


export default userRouter;