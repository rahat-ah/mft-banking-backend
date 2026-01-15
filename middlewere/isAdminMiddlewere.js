import jwt from "jsonwebtoken";
import { AdminModel } from "../config/mongoDb.js";

const isAdminAuth = async(req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, login again",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
        return res.status(400).json({
            success: false,
            message: "Faild, you are not admin",
        });
    }
    const admin = await AdminModel.find({'profile.role':"admin"},{'profile.adminCode':1,_id:0})

    const isAdminCodeValid = admin.some(item=> item.profile.adminCode === decoded.adminCode)
    if (!isAdminCodeValid) {
        return res.status(400).json({
            success: false,
            message: "Faild, you are not admin",
        });
    }

    req.userId = decoded.id;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token, login again",
    });
  }
};

export default isAdminAuth;
