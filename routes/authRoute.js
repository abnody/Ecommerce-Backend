const express= require("express");
const validatorMiddleware = require("../middlewares/validatorMiddleware");

const {
    register,
    login,
    forgotPassword,
    verifyEmail,
    verifyResetCode,
    resetPassword
}=require("../services/authService");

const {
    registerValidator,
    loginValidator,
    forgotPasswordValidator,
    verifyEmailValidator,
    verifyResetCodeValidator,
    resetPasswordValidator
}=require("../validator/authValidator");
const { allowedTo, protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/login")
    .post(loginValidator, validatorMiddleware, login);

router.route("/register")
    .post(registerValidator, validatorMiddleware, register);

router.route("/forgotPassword")
    .post(protect, allowedTo("sameUser"), forgotPasswordValidator, validatorMiddleware, forgotPassword);

router.route("/verifyEmail")
    .post(protect, allowedTo("sameUser"), verifyEmailValidator, validatorMiddleware, verifyEmail);

router.route("/verifyResetCode")
    .post(protect, allowedTo("sameUser"), verifyResetCodeValidator, validatorMiddleware, verifyResetCode);

router.route("/resetPassword")
    .post(protect, allowedTo("sameUser"), resetPasswordValidator, validatorMiddleware, resetPassword);


// router.route("/:uuid")


module.exports = router;