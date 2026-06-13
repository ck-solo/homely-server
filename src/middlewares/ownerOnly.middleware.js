const ownerOnly = (req, res, next) => {
  try {
    // Check if user exists
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    // Check role
    if (req.user.role !== "OWNER") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only owners can perform this action.",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default ownerOnly;