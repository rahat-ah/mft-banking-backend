import 'dotenv/config';
import express from 'express';
import cookieParser from "cookie-parser";
import {connectToMongoDb} from './config/mongoDb.js';
import userRouter from './routes/userRouter.js';
import cors from 'cors';
import createDefaultAdmin from './utils/createAdmin.js';
import authRouter from './routes/authRoutes.js';
import "./cron/otpCleanup.js"
import path from 'path';


const app = express();
const PORT = process.env.PORT || 5000;

const _dirname = path.resolve()

const corsOption = {
  origin:process.env.FRONTEND_URL,
  credentials:true
}

app.use(cors(corsOption));

app.use(express.json());
app.use(cookieParser())
app.use('/auth',authRouter)
app.use('/user', userRouter);

app.use(express.static(path.join(_dirname,"/mft-banking-frontend/dist")))
app.all(/.*/,(_,res)=>{
  res.sendFile(path.resolve(_dirname,"mft-banking-frontend","dist","index.html"))
})

const startServer = async () => {
  try {
    await connectToMongoDb();
    await createDefaultAdmin();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Startup error:", error);
    process.exit(1);
  }
};

startServer();