import User from "../../schema/user.model.js";

export const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if(!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password?.trim() ){
            return res.status(403).json({
                message: "Please provide all required fields"
            });
        }

        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(409).json({
                message: "User already exists, Please Sign-In"
            });
        }
        
        const user = await User.create({
            firstName,
            lastName,
            email,
            password
        });

        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save();

        return res
            .cookie("ACCESS_TOKEN", accessToken)
            .cookie("REFRESH_TOKEN", refreshToken)
            .status(200)
            .json({
                message: "Successfully Signed Up",
                user
            });
    } catch (error) {
        console.log(error);
    }
};

export const signin = async (req, res) => {
    try {
        const { email, password } = req.body;  

        if(!email?.trim() || !password?.trim() ){
            return res.status(403).json({
                message: "Please provide all required fields"
            });
        }

        const user = await User.findOne({ email });
        if(!user){
            return res.status(404).json({
                message: "Invalid Email / Password"
            });
        }

        const isPasswordValid = await user.verifyPassword(password);

        if(!isPasswordValid){
            return res.status(404).json({
                message: "Invalid Email / Password"
            });
        }

        // if(user.password?.toString() !== password?.toString()){
        //     return res.status(404).json({
        //         message: "Invalid Email / Password"
        //     });
        // }

        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save();

        return res
            .cookie("ACCESS_TOKEN", accessToken)
            .cookie("REFRESH_TOKEN", refreshToken)
            .status(200)
            .json({
                message: "Successfully signed in",
                accessToken
            });
    } catch (error) {
        console.log(error);
    }
};

export const signout = async (req, res) => {
    try {
        
    } catch (error) {
        console.log(error);
    }
};

export const forgetPassword = async (req, res) => {
    try {
        
    } catch (error) {
        console.log(error);
    }
};

export const changePassword = async (req, res) => {
    try {
        
    } catch (error) {
        console.log(error);
    }
};

// TODO

export const emailVerification = async (req, res) => {
    try {
        
    } catch (error) {
        console.log(error);
    }
};

export const tfaVerification = async (req, res) => {
    try {
        
    } catch (error) {
        console.log(error);
    }
};