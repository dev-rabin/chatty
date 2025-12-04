import jwt from "jsonwebtoken"

export const generateToken = (userId, res) => {
    const token = jwt.sign({ id: userId }, process.env.SECRET_KEY, {
        expiresIn: "7d"
    });
    res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
    return token
}