import jwt from "jsonwebtoken";

// Auth middleware with role-based access and admin ID support
function authMiddleware(requiredRoles = null) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    const adminId = req.headers['x-admin-id']; // Custom header for admin ID

    console.log("🔍 Auth Check:");
    console.log("  - Token:", token ? "Present" : "Missing");
    console.log("  - Admin ID:", adminId || "None");

    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({ message: "Access Denied: No token" });
    }

    try {
      // Try JWT verification first
      let verified;
      try {
        verified = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ JWT verified successfully");
      } catch (jwtErr) {
        // Fallback: try base64 decode for temporary tokens
        try {
          const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
          verified = decoded;
          console.log("⚠️ Using temporary token (base64)");
        } catch (decodeErr) {
          throw jwtErr; // Rethrow original JWT error
        }
      }

      console.log("👤 Decoded user:", verified);

      // 🔍 Detect role from token (multiple possibilities)
      const userRole =
        verified.role ||
        verified.Role ||
        verified.userRole ||
        verified.type;

      // Get user ID
      const userId = verified._id || verified.id || adminId;

      if (!userId) {
        return res.status(403).json({
          message: "Access Denied: User ID missing",
          tokenFields: Object.keys(verified)
        });
      }

      if (!userRole) {
        return res.status(403).json({
          message: "Access Denied: Role missing in token",
          tokenFields: Object.keys(verified)
        });
      }

      // Set req.user
      req.user = {
        id: userId,
        role: userRole.toLowerCase(),
        email: verified.Email || verified.email,
        ...verified
      };

      console.log("✅ User set:", {
        id: req.user.id,
        role: req.user.role
      });

      // No role restriction → allow
      if (!requiredRoles) {
        console.log("✅ No role restriction - access granted");
        return next();
      }

      // Convert requiredRoles to array if string
      const allowedRoles = Array.isArray(requiredRoles)
        ? requiredRoles.map(r => r.toLowerCase())
        : [requiredRoles.toLowerCase()];

      console.log("🔐 Role check:", req.user.role, "in", allowedRoles);

      if (!allowedRoles.includes(req.user.role)) {
        console.log("❌ Role not authorized");
        return res.status(403).json({
          message: "Access Denied: Unauthorized role",
          yourRole: userRole,
          allowedRoles
        });
      }

      console.log("✅ Role authorized - access granted");
      next();
    } catch (err) {
      console.log("❌ Auth Error:", err.message);
      return res.status(401).json({
        message: "Invalid or expired token",
        error: err.message
      });
    }
  };
}

export { authMiddleware };