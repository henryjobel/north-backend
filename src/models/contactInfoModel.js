import mongoose from "mongoose";

const contactInfoSchema = new mongoose.Schema(
  {
    corporateOfficeTitle: { type: String, default: "Corporate Office" },
    corporateOfficeLines: { type: [String], default: ["16 Tower Hamlet, Level-07, 08 & 11th", "Kamal Ataturk Avenue, Banani", "Dhaka-1213, Bangladesh"] },
    dubaiOfficeTitle: { type: String, default: "Dubai Office" },
    dubaiOfficeLines: { type: [String], default: ["House-47, Street-12, Hamriya Deira", "Dubai — POBox: 83129"] },
    phones: { type: [String], default: ["+88 02222 274792", "+88 01894 801923", "+88 09642 801925"] },
    emails: { type: [String], default: ["northsouthgroupbd@gmail.com", "info@northsouthgroup.com"] },
    websites: { type: [String], default: ["www.northsouthgroup.com", "www.northsouthgroupbd.com"] },
  },
  { timestamps: true }
);

export const ContactInfo = mongoose.model("ContactInfo", contactInfoSchema);
