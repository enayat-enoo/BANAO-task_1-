const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
require("dotenv").config();

const saltRounds = parseInt(process.env.SALT_ROUNDS);
async function userRegistration(req, res) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(401).json({
      message: "missing required fields",
      missingRequiredFields: true,
    });
  }
  const ifEmailExist = await userModel.findOne({ email });
  if (ifEmailExist) {
    return res
      .status(409)
      .json({ message: "user already exist", emailExist: true });
  }
  const ifUserAlreadyExist = await userModel.findOne({ username });
  if (ifUserAlreadyExist) {
    return res
      .status(401)
      .json({ message: "duplicate username", userNameExist: true });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
    });
    return res
      .status(201)
      .json({ message: "user registered successfully", registration: true });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "something went wrong", registration: false });
  }
}

async function userLogin(req, res) {
  const { userIdentifier, password } = req.body;
  if (!userIdentifier || !password)
    return res.status(400).json({ missingRequiredFields: true });
  try {
    const user = await userModel.findOne({
      $or: [{ email: userIdentifier }, { username: userIdentifier }],
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "user doesnt exist", user: false });
    }
    const hashedPassword = user.password;
    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ message: "incorrect password", incorrectPassword: true });
    }

    const userData = {
      username: user.username,
      email: user.email,
    };

    return res.status(201).json({ message: "login successful", login: true });
  } catch (error) {
    return res.status(500).json({ message: "server error", login: false });
  }
}

async function forgetPassword(req, res) {
  const { userIdentifier, newPassword } = req.body;
  if (!userIdentifier || !newPassword)
    return res.status(400).json({ missingRequiredFields: true });
  try {
    const user = await userModel.findOne({
      $or: [{ username: userIdentifier }, { email: userIdentifier }],
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "no user exist with this username or email" });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);
    const userId = user._id;
    await userModel.findByIdAndUpdate(userId, {
      username: user.username,
      email: user.email,
      password: newHashedPassword,
    });
    return res.status(201).json({ passwordUpdated: true });
  } catch (error) {
    return res.status(500).json({ passwordUpdated: false });
  }
}

module.exports = {
  userRegistration,
  userLogin,
  forgetPassword,
};
