import cron from "node-cron";
import { AdminModel } from "../config/mongoDb.js";

cron.schedule("* * * * *", async () => {
  try {
    const currentTime = Date.now();
    console.log(currentTime)

    await AdminModel.updateMany(
      {},
      {
        $pull: {
          "customerOtp.verifyOtp": {
            otpExpireAt: { $lte: currentTime }
          }
        }
      }
    );

    console.log("✅ Expired OTPs cleared");
  } catch (error) {
    console.error("❌ Cron error:", error);
  }
});
