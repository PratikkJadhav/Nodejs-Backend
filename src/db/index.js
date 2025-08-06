import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDb = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\n MongDB connected , DB host : ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("DatabaseError:" , Error);
        console.log(error);
        
    }
}

export default connectDb