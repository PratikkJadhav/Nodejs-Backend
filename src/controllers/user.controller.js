import {asyncHandler} from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadFile } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async (req , res) =>{
    const {fullName , email , userName , password} = req.body()                                      //Get username , email ,.. from user
    if([fullName , email , userName , password].some((field)=> field?.trim === "" )){                 //Check all the field if they are empty
        throw new ApiError(400 , "Full fields are required")
    }

    const existedUser = User.findOne({                                                            //check if email or username already exists
        $or : [{userName} , {email}],
    })
 
    if(existedUser){                                                                             //throw error if username/email already exists
        throw new ApiError(404 , "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0].path;
    const coverImageLocalPath = req.files?.coverImage[0].path;

    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar is not provided")
    }

    const avatarr = await uploadFile(avatarLocalPath)
    const coverImagee = await uploadFile(coverImageLocalPath)

    if(!avatarr){
        throw new ApiError(400 , "Avatar is not provided")
    }

    const user = await User.create({
        fullName,
        avatar : avatarr.url,
        coverImage : coverImagee?.url || "",
        email,
        password,
        userName:userName.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password  -refreshToken")

    if(!createdUser){
        throw new ApiError(500 , "something went wrong please register again")
    }

    res.status(201).json(
        new ApiResponse(200 , createdUser , "user registered successfully")
    )
})


export {registerUser}