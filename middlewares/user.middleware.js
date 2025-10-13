import JWT from "jsonwebtoken";
import { JWT_ACCESS_TOKEN_SECRET, JWT_REFRESH_TOKEN_SECRET } from "../constants/env.constants.js";
import User from "../schema/user.model.js";

// Helper function user info fetch + access token generate
async function fetchUserInformation(refreshToken, getNewAccessToken = false) {
    const userDetails = JWT.verify(refreshToken, JWT_REFRESH_TOKEN_SECRET);
    const user = await User.findById(userDetails?._id);

    if (!user) {
        throw new Error("User not found");
    }

    let accessToken = "";
    if (getNewAccessToken && user.generateAccessToken) {
        accessToken = await user.generateAccessToken();
    }

    return { user, accessToken };
}

// Main middleware
export const authMiddleware = async (req, res, next) => {
    try {
        // Get ACCESS_TOKEN from header or cookies
        const authHeader = req.headers.authorization; // "Bearer TOKEN"
        const accessTokenFromHeader = authHeader ? authHeader.split(" ")[1] : null;
        const accessTokenFromCookie = req.cookies?.ACCESS_TOKEN;
        const accessToken = accessTokenFromHeader || accessTokenFromCookie;

        const refreshToken = req.cookies?.REFRESH_TOKEN;

        if (!accessToken && !refreshToken) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        let user;

        if (accessToken) {
            // Verify ACCESS_TOKEN
            try {
                user = JWT.verify(accessToken, JWT_ACCESS_TOKEN_SECRET);
            } catch (err) {
                // Token expired or invalid
                if (!refreshToken) {
                    return res.status(401).json({ message: "Access token expired, please login again" });
                }
            }
        }

        // If no valid accessToken, try refreshToken
        if (!user && refreshToken) {
            const data = await fetchUserInformation(refreshToken, true);
            user = data.user;
            // Set new access token in cookies
            res.cookie("ACCESS_TOKEN", data.accessToken, { httpOnly: true });
        }

        req.user = user; // set user for next middleware/routes
        next();
    } catch (err) {
        console.error("Auth middleware error:", err.message);
        return res.status(401).json({ message: "Unauthorized" });
    }
};
