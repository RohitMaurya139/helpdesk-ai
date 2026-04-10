import mongoose, { model, Schema } from "mongoose";

interface ISettings {
  ownerId: string;
  apiKey: string;
  businessName: string;
  supportEmail: string;
  knowledge: string;
}

const settingsSchema = new Schema<ISettings>(
  {
    ownerId: {
      type: String,
      required: true,
      unique: true,
    },
    apiKey: {
      type: String,
      unique: true,
      index: true,
    },
    businessName: {
      type: String,
      maxlength: 200,
    },
    supportEmail: {
      type: String,
      maxlength: 320,
    },
    knowledge: {
      type: String,
      maxlength: 50000,
    },
  },
  { timestamps: true },
);

const Settings = mongoose.models.Settings || model("Settings", settingsSchema);
export default Settings;
