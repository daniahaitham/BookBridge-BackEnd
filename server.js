import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import userRoutes from "./routes/users.js";  
import authRouter from "./routes/auth.js";   
import pgClient from "./configration/db.js"; 
import bookRoutes from "./routes/books.js";
import requestsRouter from "./routes/req.js"; 
import complaintsRouter from "./routes/complaints.js";





dotenv.config();//read variables in env 
const app = express();//calling this funcrion will create the app object where i can use all the methods like the gest and so one
 
//this will be changed soon cuz this is locally 
const PORT = 5000; 
//const PORT = process.env.PORT; //craete a port generation becouese i cant choose a spsisif cnumber for all of my isers to use

app.use(cors()); //my backend accept WHO can request it 
app.use(express.json()); //bodies of requests are read as JSON
app.use(morgan("dev")); //Just for logging for debugging 




app.use("/api/auth", authRouter);//to handle requests start with auth
 //api is called baseRoute.
app.use("/api/users", userRoutes);//this is like calling the ;ines of the routes i have in the users.js file

app.use("/api/books", bookRoutes);

app.use("/api/req", requestsRouter);
app.use("/api/complaints", complaintsRouter);

//END POINT : a url on my server using any method (get,post,..) req 
//req is from client and res is frrm server 
app.get('/', (req, res) => { //this is call back function ran ONLY when the server see that the needed rout is found 
    res.send('Hello World');
    // we always use .json becouse APIs respins in it 
});

//anything with .use is MIDDLWARE : any req to my server pass though all middlewars befor reachein the enpoitn 
app.use((req, res) => {
    res.status(404).send('Not Found');
});

//using the clinet i create thier , it opens a connection to pg
//Cuz it need time!!
pgClient.connect().then(()=>{
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});
 


