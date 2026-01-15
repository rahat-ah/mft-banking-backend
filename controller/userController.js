import cloudinary from "../config/cloudinary.js";
import UserModel, { AdminModel } from "../config/mongoDb.js";
import { getCloudinaryPublicId } from "../utils/utils.js";



export const addCustomer = async (req, res) => {
  const {
    firstName,
    lastName,
    fatherFirstName,
    fatherLastName,
    guardianFirstName,
    guardianLastName,
    mobileNumber,
    date,
    villageName,
    fullAddress,
    loanAmount,
    loanAuditor,
    earlierDueAmount,
    customerStatus,
    paymentStatus,
    profilePhotoUrl,
    nidPhotoUrl,
    stampPaperPhotoUrl,
  } = req.body;

  if (
    !firstName ||
    !fatherFirstName ||
    !date ||
    !villageName ||
    !loanAmount ||
    !customerStatus ||
    !loanAuditor
  ) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  //making duedate
  const dateObj = new Date(date);
  const dueDate = `${dateObj.getFullYear()}-${String(
    dateObj.getMonth() + 1
  ).padStart(2, "0")}-01`;

  const earlierDue =
    earlierDueAmount === "" || earlierDueAmount === undefined
      ? 0
      : Number(earlierDueAmount);

  try {
    const adminLetestId = await AdminModel.findOne({"profile.role":"admin"},{ customerLetestSerial: 1 })

    console.log(adminLetestId)

    const newCustomer = new UserModel({
      firstName,
      lastName,
      fatherFirstName,
      fatherLastName,
      guardianFirstName,
      guardianLastName,
      mobileNumber,
      date,
      id:Number(adminLetestId.customerLetestSerial + 1),
      villageName,
      fullAddress,
      loanAmount,
      loanAuditor,
      customerStatus,
      paymentStatus,
      profilePhotoUrl: profilePhotoUrl || "",
      nidPhotoUrl: nidPhotoUrl || "",
      stampPaperPhotoUrl: stampPaperPhotoUrl || "",
      due: [
        {
          dueAmount: Number((loanAmount * 0.1).toFixed(1)) + Number(earlierDue),
          dueDate: dueDate,
        },
      ],
    });
    adminLetestId.customerLetestSerial+=1;
    await adminLetestId.save();
    await newCustomer.save();

    return res.status(201).json({
      success: true,
      message: "Customer added successfully",
      customer: newCustomer,
    });
  } catch (error) {
    console.error("Error adding customer:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await UserModel.find();
    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No customers found",
      });
    }
    return res.status(200).json({
      success: true,
      customers,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const getCustomerById = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await UserModel.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }
    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Error fetching customer by ID:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const signatureUploder = async (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: "secure_uploads",
    },
    process.env.CLOUDINARY_API_SECRET
  );

  res.json({
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
};

export const searchCustomers = async (req, res) => {
  const { wordSearch, dateSearch, searchBySegment } = req.body;

  try {
    let query = {};

    if (wordSearch) {
      query.$or = [
        { firstName: { $regex: wordSearch, $options: "i" } },
        { fatherFirstName: { $regex: wordSearch, $options: "i" } },
        { guardianFirstName: { $regex: wordSearch, $options: "i" } },
        { villageName: { $regex: wordSearch, $options: "i" } },
        { mobileNumber: { $regex: wordSearch, $options: "i" } },
      ];
    }

    if (dateSearch && dateSearch === "all") {
      if (
        searchBySegment &&
        (searchBySegment.toLowerCase() === "a" ||
          searchBySegment.toLowerCase() === "b" ||
          searchBySegment.toLowerCase() === "c")
      ) {
        let dayRange = { start: 1, end: 31 };

        if (searchBySegment.toLowerCase() === "a") {
          dayRange = { start: 1, end: 10 };
        } else if (searchBySegment.toLowerCase() === "b") {
          dayRange = { start: 11, end: 20 };
        } else if (searchBySegment.toLowerCase() === "c") {
          dayRange = { start: 21, end: 31 };
        }

        query.$expr = {
          $and: [
            {
              $gte: [{ $toInt: { $substr: ["$date", 8, 2] } }, dayRange.start],
            },
            { $lte: [{ $toInt: { $substr: ["$date", 8, 2] } }, dayRange.end] },
          ],
        };
      }
    } else {
      const day = parseInt(dateSearch, 10);
      if (isNaN(day)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid dateSearch value" });
      }

      if (day === 30) {
        query.$expr = {
          $or: [
            { $eq: [{ $toInt: { $substr: ["$date", 8, 2] } }, 30] },
            { $eq: [{ $toInt: { $substr: ["$date", 8, 2] } }, 31] },
          ],
        };
      } else {
        query.$expr = {
          $eq: [{ $toInt: { $substr: ["$date", 8, 2] } }, day],
        };
      }
    }

    const customers = await UserModel.find(query);
    return res.status(200).json({
      success: true,
      customers,
    });
  } catch (error) {
    console.error("Error searching customers:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addPayment = async (req, res) => {
  try {
    const { customerId, amount, paymentDate } = req.body;

    const customer = await UserModel.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found!",
      });
    }

    const latestDue = customer.due.find( item =>item.dueDate.slice(0, 7) === paymentDate.slice(0, 7));
    if (!latestDue) {
      return res.status(400).json({
        success: false,
        message: "No due found for this payment month",
      });
    }
    if (amount > latestDue.dueAmount) {
      const advanceAmount = amount - latestDue.dueAmount;

      customer.advance.push({
        amount: advanceAmount,
        date: paymentDate,
      });

      latestDue.dueAmount = 0;
    } else {
      latestDue.dueAmount -= amount;
    }

    customer.payments.push({
      amount,
      paymentDate,
    });

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Payment added successfully",
      updatedCustomer:customer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCustomer = async (req,res)=>{
  
  try {
    const { id } = req.params;

    const customer = await UserModel.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const imageUrls = [
      customer.profilePhotoUrl,
      customer.nidPhotoUrl,
      customer.stampPaperPhotoUrl,
    ];

    for (const url of imageUrls) {
      const publicId = getCloudinaryPublicId(url);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    await UserModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete customer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete customer",
    });
  }
};

export const getBankingTarget = async(req,res)=>{
  try {
    const response = await AdminModel.findOne({"profile.role":"admin"},{ bankingCollectionTarget: 1, _id: 0 })
    if (!response) {
        return res.status(404).json({
        success:false,
        message:"admin not found"
      })
    }
    return res.status(200).json({
      success:false,
      message:"get data successfully",
      bankingTarget:response.bankingCollectionTarget
    })
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:"server error"
    })
  }
}

export const getTotalPreviousMonthDueCustomer = async (req, res) => {
  try {
    const { section = "ALL" } = req.query;

    const now = new Date();

    // previous month
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthLabel = prevMonth.toLocaleString("en-US", {
      month: "long",
      year: "numeric"
    });

    const year = prevMonth.getFullYear();
    const month = String(prevMonth.getMonth() + 1).padStart(2, "0");

    //customer by loan date
    let startDay = 1;
    let endDay = 31;

    if (section === "A") {
      startDay = 1;
      endDay = 10;
    } else if (section === "B") {
      startDay = 11;
      endDay = 20;
    } else if (section === "C") {
      startDay = 21;
      endDay = 31;
    }

    

    // STRING date range
    const startDate = `${year}-${month}-01`;
    const endDate = `${year}-${month}-31`; // safe upper bound

    const customers = await UserModel.aggregate([
      { $unwind: "$due" }, // break due array
      {
        $match: {
          "due.dueAmount": { $gt: 0 },

          "due.dueDate": {
            $gte: startDate,
            $lt: endDate,
          },

          // 🆕 ONLY compare DAY from customer.date
          $expr: {
            $and: [
              {
                $gte: [
                  { $toInt: { $substr: ["$date", 8, 2] } },
                  startDay
                ]
              },
              {
                $lte: [
                  { $toInt: { $substr: ["$date", 8, 2] } },
                  endDay
                ]
              }
            ]
          }
        },
      },
      {
        $group: {
          _id: "$_id",
          customer: { $first: "$$ROOT" },
          totalPreviousMonthDue: { $sum: "$due.dueAmount" },
        },
      },
      {
        $project: {
          _id: 1,
          customerId: "$customer.id",
          customerName: "$customer.firstName",
          fatherName: "$customer.fatherFirstName",
          mobileNumber: "$customer.mobileNumber",
          totalPreviousMonthDue: 1,
          date:"$customer.date",
          dueStatus:"$customer.dueStatus",
          comment:"$customer.dueComment"
        },
      },
    ]);

    const allCustomers = await UserModel.aggregate([
      { $unwind: "$due" },
      {
        $match: {
          "due.dueAmount": { $gt: 0 },
          "due.dueDate": { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: "$_id",
          totalPreviousMonthDue: { $sum: "$due.dueAmount" },
        },
      },
    ]);

    const grandTotalPreviousMonthDue = allCustomers.reduce(
      (sum, customer) => sum + customer.totalPreviousMonthDue,
      0
    );
    
    const sectionTotalPreviousMonthDue = customers.reduce(
      (sum, customer) => sum + customer.totalPreviousMonthDue,
      0
    ); 

    res.json({
      success: true,
      count: customers.length,
      customers,
      sectionTotalPreviousMonthDue,
      grandTotalPreviousMonthDue,
      month: previousMonthLabel
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

export const updateDueComment = async (req, res) => {
  const { id } = req.params;     
  const { comment } = req.body;  
  if (!comment) {
    return res.status(400).json({success:false, message: "Comment is required" });
  }

  try {
    
    const updatedCustomer = await UserModel.findByIdAndUpdate(
      id,
      { dueComment: comment },
      { new: true , select: "dueComment"} // return the updated document
    );

    if (!updatedCustomer) {
      return res.status(404).json({success:false, message: "Customer not found" });
    }

    res.status(200).json({
      success:true,
      message: "Comment updated successfully",
      newComment : updatedCustomer.dueComment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({success:false, message: "Server error" });
  }
}