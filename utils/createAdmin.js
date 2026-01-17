import bcrypt from "bcrypt";
import UserModel, { AdminModel } from "../config/mongoDb.js";

const createDefaultAdmin = async() => {
  const adminExists = await AdminModel.findOne({ "profile.role": "admin" });

  if (adminExists)  return;

  try {
    const users = await UserModel.find()
  
  await AdminModel.create({
    profile: {
      fullName: process.env.ADMIN_FULL_NAME,
      email: process.env.ADMIN_EMAIL,
      mobileNumber: process.env.ADMIN_PHONE,
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
      secretCode: await bcrypt.hash(process.env.ADMIN_SECRET, 10),
      adminCode: await bcrypt.hash(process.env.ADMIN_CODE, 10),
      role: "admin",
    },
    customerLetestSerial:users.length
  });

  console.log("✅ Admin created from ENV");
  } catch (error) {
    console.log(error.message)
    
  }

  
};

export default createDefaultAdmin;
