import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  sendSigninMailHtml,
  sendSignupMailHtml,
  sendLogoutMailHtml,
  transporter,
  sendOtpMailHtml,
} from "../config/nodemailer.js";
import { AdminModel, AuthModel } from "../config/mongoDb.js";

export const signUp = async (req, res) => {
  const { fullName, email,mobileNumber , password , role,secretCode } = req.body;

  if (!fullName || !email || !mobileNumber || !password ||!role || !secretCode) {
    return res.json({
      success: false,
      message: "all fields are required",
    });
  }
  try {
    const isUserExist = await AuthModel.findOne({ email });
    if (isUserExist) {
      return res.json({
        success: false,
        message: "user alredy exist",
      });
    }
    const admin = await AdminModel.findOne({"profile.role":"admin"})
    if (!admin) {
      return res.json({
        success: false,
        message: "admin not found",
      });
    }
    const isVerified = admin.customerOtp.verifiedOfficersEemail.some(
      item=>item === email
    )
    if(!isVerified){
      return res.json({
        success: false,
        message: "user not verified !",
      });
    }
    const isSecretCodeValid = await bcrypt.compare(secretCode,admin.profile.secretCode)
    if (!isSecretCodeValid) {
      return res.json({
        success: false,
        message: "wrong secret code given!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await AuthModel.create({
      fullName,
      email,
      password: hashedPassword,
      mobileNumber,
      role,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.APP_ENVIRONMENT === "production",
      sameSite:process.env.APP_ENVIRONMENT === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 1000,
    });
    // SEND SIGN UP EMAIL TO USER
    await transporter.sendMail({
      from: `"The author of mern auth" <${process.env.BREVO_SENDER_EMAIL}>`,
      to: email,
      subject: "welcome to rahats mern auth ✔",
      text: "You are very welcome here",
      html: sendSignupMailHtml(fullName),
    });
    console.log("message sent!!!!");
    return res.status(200).json({
      success: true,
      message: "sign up succesfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "server error!",
    });
  }
};

export const sendVerifyOtp = async (req, res) => {
  const {email} = req.body;

  if (!email) {
    return res.json({ success: false, message: "email not given" });
  }
  
  try {
    const admin = await AdminModel.findOne({"profile.role":"admin"});

    if (!admin) {
      return res.json({ success: false, message: "admin not found" });
    }

    const otpAlreadyExists = admin.customerOtp?.verifyOtp?.some(
      (itme)=>itme.email === email);
    
    if (otpAlreadyExists) {
      return res.json({
        success: false,
        message: "OTP already sent. Please wait until it expires.",
      });
    }
    
    const otp = Math.floor(10000 + Math.random() * 90000);
  
    const otpEntry = {
      otp: otp.toString(),
      otpExpireAt:Date.now() + 3 * 60 * 1000,
      email: email,
    };
    
    admin.customerOtp.verifyOtp.push(otpEntry);

    await admin.save();

    await transporter.sendMail({
      from: `"The author of MFT" <${process.env.BREVO_SENDER_EMAIL}>`,
      to: email,
      subject: "thanks from MFT||Banking",
      text: "verify with otp",
      html: sendOtpMailHtml( otp, "Verify Otp", "3"),
    });
    
    res.json({
      success: true,
      message: "send verify otp succesfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "server error!",
    });
  }
};

export const verifyOtp = async (req, res) => {
  const { givenOtp , email } = req.body;

  if (!email || !givenOtp) {
    return res.json({ success: false, message: "missing details" });
  }

  try {
    const adminWithEmail = await AdminModel.findOne({
      "customerOtp.verifyOtp.email": email
    })

    if (!adminWithEmail) {
      return res.json({ success: false, message: "OTP not found. It may have expired." });
    }

    const otpObj = adminWithEmail.customerOtp.verifyOtp.find(
      item=>item.email === email
    )

    if (!otpObj) {
      return res.json({ success: false, message: "OTP not found. It may have expired." });
    }
    
    if(otpObj.otpExpireAt < Date.now()){
      return res.json({ success: false, message: "OTP expired" });
    }

    if (otpObj.otp !== givenOtp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    
    adminWithEmail.customerOtp.verifyOtp =  adminWithEmail.customerOtp.verifyOtp.filter(
      (item) => item.email !== email
    );

    adminWithEmail.customerOtp.verifiedOfficersEemail.push(email)

    await  adminWithEmail.save();

    res.json({
      success: true,
      message: "OTP verified succesfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "server error!",
    });
  }
};

export const signin = async (req, res) => {
  const { email, password , mobileNumber , officerSecret} = req.body;

  if (!email || !password || !mobileNumber || !officerSecret) {
    return res.json({
      success: false,
      message: "all fields are required!!",
    });
  }
  try {
    const user = await AuthModel.findOne({email})
    if (!user) {
      return res.json({
        success: false,
        message: "user not found",
      });
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return res.json({
        success: false,
        message: "password is incorrect",
      });
    }
    const isMobileNumberMatched = user.mobileNumber === mobileNumber;
    if (!isMobileNumberMatched) {
      return res.json({
        success: false,
        message: "mobile number not matching",
      });
    }
    const admin = await AdminModel.findOne({"profile.role":"admin"});
    if (!admin) {
      return res.json({
        success: false,
        message: "admin not found",
      });
    }
    const isSecretCodeValid = await bcrypt.compare(officerSecret,admin.profile.secretCode);
    if (!isSecretCodeValid) {
      return res.json({
        success: false,
        message: "invalid secret code",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.APP_ENVIRONMENT === "production",
      sameSite:
        process.env.APP_ENVIRONMENT === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 1000,
    });
    await transporter.sendMail({
      from: `"The author of MFT" <${process.env.BREVO_SENDER_EMAIL}>`,
      to: user.email,
      subject: "welcome to MFT || Banking ✔",
      text: "You are very welcome here",
      html: sendSigninMailHtml(user.fullName),
    });
    return res.status(200).json({
      success: true,
      message: "log in succesfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "server error!",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success:false,
        message:"token not found!"
      })
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await AuthModel.findById(decodedToken.id);
    if(!user){
      return res.status(404).json({
      success: false,
      message: "user not found!",
    });
    }
    //SEND LOGOUT MAIL
    await transporter.sendMail({
      from: `"The author of MFT" <${process.env.BREVO_SENDER_EMAIL}>`,
      to: user.email,
      subject: "thanks from MFT Banking ✔",
      text: "come again leter please",
      html: sendLogoutMailHtml(user.role),
    });
   
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.APP_ENVIRONMENT === "production",
      sameSite:
        process.env.APP_ENVIRONMENT === "production" ? "none" : "lax",
    });
    res.json({
      success: true,
      message: "log out succesfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "server error!",
    });
  }
};

export const isAuth = (req, res) => {
  const userId = req.userId;
  try {
    return res.json({
      success: true,
      message: "this account is authorized !",
      officerId : userId
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "server error!",
    });
  }
};
export const officerDetails = async (req, res) => {
  const {id} = req.params;
  if(!id || !mongoose.Types.ObjectId.isValid(id) ){
    return res.status(400).json({
      success: false,
      message: "invalid id!",
    });
  }
  try {
    const officer = await AuthModel.findById(id)
    if(!officer){
       return res.status(404).json({
      success: false,
      message: "officer not found!",
    });
    }
    return res.json({
      success: true,
      message: "this is the officers details !",
      officer : officer
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "server error!",
    });
  }
};

export const adminSignin = async (req, res) => {
  const { email, password , mobileNumber , officerSecret,adminCode} = req.body;

  if (!email || !password || !mobileNumber || !officerSecret ||!adminCode) {
    return res.json({
      success: false,
      message: "all fields are required!!",
    });
  }
  try {
    const admin = await AdminModel.findOne({"profile.role":"admin"});
    if (!admin) {
      return res.json({
        success: false,
        message: "admin not found",
      });
    }
    const isPasswordMatched = await bcrypt.compare(password,admin.profile.password);
    if (!isPasswordMatched) {
      return res.json({
        success: false,
        message: "password is incorrect",
      });
    }
    const isMobileNumberMatched = admin.profile.mobileNumber === mobileNumber;
    if (!isMobileNumberMatched) {
      return res.json({
        success: false,
        message: "mobile number not matching",
      });
    }
    

    const isSecretCodeValid = await bcrypt.compare(officerSecret,admin.profile.secretCode);
    
    if (!isSecretCodeValid) {
      return res.json({
        success: false,
        message: "invalid secret code",
      });
    }

    const isAdminCodeValid = await bcrypt.compare(adminCode,admin.profile.adminCode);

    if (!isAdminCodeValid) {
      return res.json({
        success: false,
        message: "invalid secret code",
      });
    }

    const token = jwt.sign({ id: admin._id ,adminCode:admin.profile.adminCode,role:admin.profile.role }, process.env.JWT_SECRET, {
      expiresIn: "30m",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.APP_ENVIRONMENT === "production",
      sameSite:
        process.env.APP_ENVIRONMENT === "production" ? "none" : "lax",
      maxAge: 30 * 60 * 1000,
    });

    await transporter.sendMail({
      from: `"The author of MFT" <${process.env.BREVO_SENDER_EMAIL}>`,
      to: admin.profile.email,
      subject: "welcome to MFT || Banking ✔",
      text: "You are very welcome here",
      html: sendSigninMailHtml(admin.profile.fullName),
    });
    return res.status(200).json({
      success: true,
      message: "log in succesfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "server error!",
    });
  }
};
export const isAdmin = (req, res) => {
  try {
    return res.json({
      success: true,
      message: "Admin is authorized !",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "server error!",
    });
  }
};

// export const sendResetOtp = async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     return res.json({
//       success: false,
//       message: "email is required",
//     });
//   }

//   try {
//     const user = await UserModel.findOne({email:email});
//     if (!user) {
//       return res.json({
//         success: false,
//         message: "user not found",
//       });
//     }

//     const otp = Math.floor(10000 + Math.random() * 90000);

//     user.resetOtp = otp;
//     user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
//     await user.save();

//     await transporter.sendMail({
//       from: `"The author of mern auth" <${process.env.BREVO_SENDER_EMAIL}>`,
//       to: user.email,
//       subject: "thanks from rahats mern auth ✔",
//       text: "verify with otp",
//       html: sendOtpMailHtml(user.name, otp, "Reset Otp", "15"),
//     });
//     console.log("message senttt");
//     res.json({
//       success: true,
//       message: "send reset otp succesfully!",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: "server error!",
//     });
//   }
// };

// export const verifyResetOtp = async (req, res) => {
//   const { email, givenOtp, newPassword } = req.body;

//   if (!email || !givenOtp || !newPassword) {
//     return res.json({
//       success: false,
//       message: "missing details",
//     });
//   }

//   try {
//     const user = await UserModel.findOne({email});
//     if (!user) {
//       return res.json({
//         success: false,
//         message: "user not found",
//       });
//     }
//     if (user.resetOtp === "" || user.resetOtp !== givenOtp) {
//       return res.json({
//         success: false,
//         message: "invalid otp",
//       });
//     }
//     if (user.resetOtpExpireAt < Date.now()) {
//       return res.json({
//         success: false,
//         message: "otp expires , try again",
//       });
//     }
//     const hashedPassword =await bcrypt.hash(newPassword,10);

//     user.password = hashedPassword;
//     user.resetOtp = "";
//     user.resetOtpExpireAt = 0 ;
//     await user.save();

//     res.json({
//       success: true,
//       message: "verify reset otp and reset password succesfully!",
//     });

//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: "server error!",
//     });
//   }
// };
