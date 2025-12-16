// Middleware/userAuth.js
import jwt from "jsonwebtoken";

// Auth middleware with role-based access (string OR array)
function authMiddleware(requiredRoles = null) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({ message: "Access Denied: No token" });
    }

    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified;

      console.log("✅ JWT verified");
      console.log("👤 Decoded user:", verified);

      // 🔍 Detect role from token (multiple possibilities)
      const userRole =
        verified.role ||
        verified.Role ||
        verified.userRole ||
        verified.type;

      if (!userRole) {
        return res.status(403).json({
          message: "Access Denied: Role missing in token",
          tokenFields: Object.keys(verified)
        });
      }

      // Normalize
      const normalizedUserRole = userRole.toLowerCase();

      // No role restriction → allow
      if (!requiredRoles) return next();

      // Convert requiredRoles to array if string
      const allowedRoles = Array.isArray(requiredRoles)
        ? requiredRoles.map(r => r.toLowerCase())
        : [requiredRoles.toLowerCase()];

      console.log("🔐 Role check:", normalizedUserRole, "in", allowedRoles);

      if (!allowedRoles.includes(normalizedUserRole)) {
        return res.status(403).json({
          message: "Access Denied: Unauthorized role",
          yourRole: userRole,
          allowedRoles
        });
      }

      console.log("✅ Role authorized");
      next();
    } catch (err) {
      console.log("❌ JWT Error:", err.message);
      return res.status(401).json({
        message: "Invalid or expired token",
        error: err.message
      });
    }
  };
}

export { authMiddleware };
