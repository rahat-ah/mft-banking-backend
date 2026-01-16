import 'dotenv/config';
import express from 'express';
import cookieParser from "cookie-parser";
import {connectToMongoDb} from './config/mongoDb.js';
import userRouter from './routes/userRouter.js';
import cors from 'cors';
import createDefaultAdmin from './utils/createAdmin.js';
import authRouter from './routes/authRoutes.js';
import "./cron/otpCleanup.js"


const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: [
      "http://localhost:5173",
      process.env.FRONTEND_URL
    ],
  credentials:true
}));
app.use(express.json());
app.use(cookieParser())
app.use('/auth',authRouter)
app.use('/user', userRouter);

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