//this file is a middle ware meaning that before reueqt fot to routes it went thourgh it 
export default function adminAuth(req, res, next) {
  const role = req.headers["x-role"];//read the header 
  if (role === "admin") return next();//next here allaws the reuqrst to contenuie to the ROUTS 
  return res.status(403).json({ message: "Admin access only" }); 
}
//this file return to the get call : next --> move dont response 
//or : meassage fail 

