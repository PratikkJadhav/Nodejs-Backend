import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"



export const verifyUser = asyncHandler(async(req ,res , next) =>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer: " , "")
    
        if(!token){
            throw new ApiError(401 , "Unauthorized Request")
        }
    
        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
    
        const user = User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401 , "Invalid Access Token")
        }
    
        req.user = user,
        nect()
    } catch (error) {
        throw new ApiError(401 , error?.message || "No access Token")
    }
})