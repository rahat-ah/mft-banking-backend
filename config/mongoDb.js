import mongoose from "mongoose";

export const connectToMongoDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

const mongoUserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    default: "",
  },
  fatherFirstName: {
    type: String,
    required: true,
  },
  fatherLastName: {
    type: String,
    default: "",
  },
  guardianFirstName: {
    type: String,
    default: "not exist",
  },
  guardianLastName: {
    type: String,
    default: "",
  },
  mobileNumber: {
    type: String,
    match: [/^01[3-9]\d{8}$/, "Invalid Bangladeshi mobile number"],
    trim: true,
    default: "not provided",
  },
  date: {
    type: String,
    required: true,
  },
  id:{
    type:Number,
  },
  villageName: {
    type: String,
    required: true,
  },
  fullAddress: {
    type: String,
    default: "not provided",
  },
  loanAmount: {
    type: Number,
    required: true,
  },
  customerStatus: {
    type: String,
    required: true,
    enum: ["new", "old"],
  },
  paymentStatus: {
    type: String,
    default: "active",
    enum: ["active", "inactive"],
  },
  loanAuditor: {
    type: String,
    required: true,
  },
  profilePhotoUrl: {
    type: String,
    default: "",
  },
  nidPhotoUrl: {
    type: String,
    default: "",
  },
  stampPaperPhotoUrl: {
    type: String,
    default: "",
  },
  payments: {
    type: [
      {
        amount: {
          type: Number,
          default: 0,
        },
        paymentDate: {
          type: String,
          default: new Date().toISOString().split("T")[0],
        },
      },
    ],
  },
  due: {
    type: [
      {
        dueAmount: {
          type: Number,
          default: 0,
        },
        dueDate: {
          type: String,
          default: `${new Date().toISOString().slice(0, 7)}-01`,
        },
      },
    ],
    default: [],
  },
  dueStatus:{
    type: String,
    default: "unpaid",
    enum: ["paid", "unpaid","ondate","non-recovery"],
  },
  dueComment:{
    type:String,
    default:""
  },
  advance: {
    type: [
      {
        amount: {
          type: Number,
          default: 0,
        },
        date: {
          type: String,
          default: new Date().toISOString().split("T")[0],
        },
      },
    ],
    default: [],
  },
});

const mongoAuthSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["manager", "loan_officer", "ceo"],
    required: true,
  },
  profileImageUrl: {
    type: String,
    default:"",
  },
  branch: {
    type: String,
    default:"Bazar Bhadraghat,kamarkhondo,sirajgonj",
  },
  joinDate: {
    type: String,
    default:"",
  },
  department: {
    type: String,
    default:"Bazar Bhadraghat",
  },
});
const mongoAdminSchema = new mongoose.Schema({
  profile: {
    fullName: {
      type: String,
    },
    email: {
      type: String,
    },
    mobileNumber: {
      type: String,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      default: "admin",
    },
    secretCode: {
      type: String,
    },
    adminCode: {
      type: String,
    },
  },
  customerOtp: {
    verifyOtp: [
      {
        otp: { type: String, default: "" },
        otpExpireAt:{type: Number, default: 0},
        email: {
          type: String,
          default:""
        }
      },
    ],
    resetOtp: [
      {
        otp: { type: String, default: "" },
        resetOtpExpireAt:{type: Number, default: 0},
        email: {
          type: String,
          default:""
        },
      },
    ],
    verifiedOfficersEemail:[{type: String, default: "" }],
  },
  customerLetestSerial: {
    type: Number,
    default: 0,
  },
  bankingCollectionTarget:{
    type:Number,
    default:400000
  }
});

export const UserModel = mongoose.model("customers", mongoUserSchema);
export const AuthModel = mongoose.model("officers", mongoAuthSchema);
export const AdminModel = mongoose.model("admin", mongoAdminSchema);

export default UserModel;
