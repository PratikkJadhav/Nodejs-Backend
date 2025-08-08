class ApiError extends Error{
    constructor(
       statusCode,
       message="Something went wrong",
       erros=[],
       stack="" 
    ) {
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.erros = erros
        this.success = false

        if(stack){
            this.stack=stack
        }else{
            Error.captureStackTrace(this , this.stack)
        }
    }
}

export {ApiError}