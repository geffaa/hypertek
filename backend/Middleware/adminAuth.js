import jwt from "jsonwebtoken";

/**
 * Admin-only middleware.
 * Verifies JWT and checks that role === "admin".
 */
function adminAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access Denied: No token provided" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Map payload to req.user for downstream controllers
    req.user = {
      _id: verified.id,
      email: verified.email,
      role: verified.role,
    };

    const role = (verified.role || "").toLowerCase();
    if (role !== "admin") {
      return res.status(403).json({ message: "Access Denied: Admins only" });
    }

    next();
  } catch (err) {
    return res.status(403).json({ message: "Token expired or invalid", error: err.message });
  }
}

export { adminAuth };
