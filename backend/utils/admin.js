import UserModel from "../Models/User.js";
import bcrypt from "bcrypt";

const ensureAdminExists = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log("⚠️ Admin credentials missing in env");
      return;
    }

    const adminExists = await UserModel.findOne({
      Email: adminEmail,
      Role: "admin",
    });

    if (adminExists) {
      console.log("✅ Admin already exists");
      return;
    }
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = new UserModel({
      Email: adminEmail,
      Password: hashedPassword,
      Role: "admin",
      isActive: true,
    });

    await admin.save({ validateModifiedOnly: true });

    console.log("✅ Admin Created Successfully");
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
  }
};

export default ensureAdminExists;
