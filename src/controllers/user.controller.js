import {asyncHandler} from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadFile } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"




import { ApiResponse } from "../utils/ApiResponse.js"

const GenerateTokens = async(userID)=>{
    try {
        const user = await User.findById(userID)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken , refreshToken}
    } catch (error) {
        throw new ApiError(401 , "Something went wrong while generating tokens");
        
    }
}




const registerUser = asyncHandler( async (req , res) =>{

    const {fullName , email , userName , password} = req.body                                      //Get username , email ,.. from user
    if([fullName , email , userName , password].some((field)=> field?.trim() === "" )){                 //Check all the field if they are empty
        throw new ApiError(400 , "Full fields are required")
    }

    const existedUser = await User.findOne({                                                            //check if email or username already exists
        $or : [{userName} , {email}],
    })
 
    if(existedUser){                                                                             //throw error if username/email already exists
        throw new ApiError(404 , "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

     if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar is not required")
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

    return res.status(201).json(
        new ApiResponse(200 , createdUser , "user registered successfully")
    )


})

const loginUser = asyncHandler(async (req , res)=>{
    const {username , email} = req.body

    if(!username || !email){
        throw new ApiError(400 , "Email and password is required")
    }

    const user = await User.findOne({
        $or : [{email} , {username}],
    })

    if(!user){
        throw new ApiError(404 , "User not found")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    const {accessToken , refreshToken} = await GenerateTokens(user._id)
    const loggedInUser = await user.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly:true,
        secure:true,
    }

    return res.status(200).cookie("accessToken", accessToken , options).cookie("refreshToken",refreshToken , options).json(
        new ApiResponse(200 , {user: loggedInUser , accessToken , refreshToken},"User Logged in successfully ")
    )


})

const logoutUser = asyncHandler(async(req , res)=>{
    await User.findByIdAndUpdate(
        req.user._id , 
        {
            $unset : {refreshToken : 1}
        },
        {
            new:true
        }
    )

    const options = {
        httpOnly:true,
        secure:true,
    }

    return res.status(200).cookie("accessToken" , options).cookie("refreshToken" , options).json(
        new ApiResponse(200 , {} , "User Logout successfully")
    )
})

export {registerUser , loginUser , logoutUser}