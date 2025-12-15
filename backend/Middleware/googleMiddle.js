import jwt from "jsonwebtoken";

// Auth middleware with optional role check
function authMiddleware(requiredRole = null) {
  return (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({ message: "Access Denied: No token provided" });
    }

    console.log("🧾 Token Received:", token);
    console.log("🔐 JWT_SECRET being used:", process.env.JWT_SECRET);

    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token Verified Successfully!");
      console.log("👤 Decoded User:", verified);

      req.user = verified; // attach user info to request

      // Role-based check
      if (requiredRole && verified.Role !== requiredRole) {
        console.log("❌ Access denied for role:", verified.Role);
        return res.status(403).json({ message: "Access Denied: Unauthorized role" });
      }

      next();
    } catch (err) {
      console.log("❌ JWT Verification Error:", err.message);
      return res.status(403).json({ message: "Invalid or expired token", error: err.message });
    }
  };
}

export { authMiddleware };
