import pg from 'pg'; //pg library is needed to connect between pg and node 
import dotenv from 'dotenv';//to be able to read the .env file

dotenv.config();//read variebles in the .env

const { Client } = pg;

const pgClient = new pg.Client(process.env.DATABASE_URL);//create new clinet using data i have in the url 

export default pgClient;
