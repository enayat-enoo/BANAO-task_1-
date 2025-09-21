const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
require("dotenv").config();

const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
async function userRegistration(req, res) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({
      message: "missing required fields",
    });
  }
  const ifEmailExist = await userModel.findOne({ email });
  if (ifEmailExist) {
    return res
      .status(409)
      .json({ message: "user already exist"});
  }
  const ifUserAlreadyExist = await userModel.findOne({ username });
  if (ifUserAlreadyExist) {
    return res
      .status(409)
      .json({ message: "duplicate username"});
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
      .json({ message: "user registered successfully" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "something went wrong" });
  }
}

async function userLogin(req, res) {
  const { username , password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message : "missing required fields" });
  try {
    const user = await userModel.findOne({username});
    if (!user) {
      return res
        .status(404)
        .json({ message: "Invalid Credentials", });
    }
    const hashedPassword = user.password;
    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ message: "Invalid Credentials" });
    }

    const userData = {
      username: user.username,
      email: user.email,
    };

    return res.status(201).json({ message: "login successful"});
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
}

//Security note: in real-world apps, we usually require a reset token sent via email, not direct password change
async function forgetPassword(req, res) {
  const { userIdentifier, newPassword } = req.body;
  if (!userIdentifier || !newPassword)
    return res.status(400).json({ message : "missing required fields" });
  try {
    const user = await userModel.findOne({
      $or: [{ username: userIdentifier }, { email: userIdentifier }],
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Invalid Credentials" });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);
    const userId = user._id;
    await userModel.findByIdAndUpdate(userId, { password: newHashedPassword });
    return res.status(201).json({ message : "password changed successfully" });
  } catch (error) {
    return res.status(500).json({ message : "something went wrong" });
  }
}

module.exports = {
  userRegistration,
  userLogin,
  forgetPassword,
};
