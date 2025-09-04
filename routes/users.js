import express from 'express';
import pgClient from "../configration/db.js"; 

//ALL ENDPOINTS WILL BE INCLUDED HERE

//USING THOSE METHODS FROM MY BROWSER --> IT SEND BODY(JSON)
// post to create new row in table
// put to replace an exsisting row full record  
// patch to replace spsific part of record

// get read only 
//delete to remove 


const router = express.Router();//Obejct to hold group od routs to be able to use methods 

// GET all users : localhost:5000/api/users
router.get("/", async (req, res) => { /* ... */ });

// GET one user : localhost:5000/api/users/5
router.get("/:id", async (req, res) => { /* ... */ });

// POST : localhost:5000/api/users/
//here the resul is body {nam:, age:}
router.post("/", async (req, res) => { /* ... */ });

// PUT : localhost:5000/api/users/5
router.put("/:id", async (req, res) => { /* ... */ });

// DELETE user : localhost:5000/api/users/5
router.delete("/:id", async (req, res) => { /* ... */ });

export default router;
