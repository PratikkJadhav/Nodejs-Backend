import {asyncHandler} from "../utils/asyncHandler"

const userController = asyncHandler( async (req , res) =>{
    res.status(200).json({
        message:"OK",
    })
})