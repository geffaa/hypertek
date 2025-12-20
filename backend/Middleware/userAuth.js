import jwt from "jsonwebtoken";

function auth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access Denied: No token provided" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Map payload id to _id for Mongoose
    req.user = { _id: verified.id, email: verified.email }; 
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token expired or invalid", error: err.message });
  }
}


export { auth };
