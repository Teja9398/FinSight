const jwt = require("jsonwebtoken");

const verifyToken = function(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("token from verify.js",token);
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_KEY,{algorithms: ['HS384']});
    // console.log("DECODED:",decoded);
    console.log(decoded);
    req.user = {id:decoded.sub,username:decoded.username};
    console.log(req.user);
    
  } catch (err) {
    console.log("Error in verifyToken middleware:", err.message);
    return res.status(401).send("Invalid Token");
  }
  // req.userid = decoded.id; 
  return next();
}

module.exports = verifyToken;