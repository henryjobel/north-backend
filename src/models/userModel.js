import { model, Schema } from "mongoose";
import  bcrypt  from "bcryptjs";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: [true, 'Username must be Unique'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select:false,
    },
    profilePic: {
      public_id: {
        type: String,
        default: "This is sample",
      },
      url: {
        type: String,
        default: "image url",
      },
    },
    role: {
      type: String,
      default: "admin",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

//password hash
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});


export const User = model("user", userSchema);
