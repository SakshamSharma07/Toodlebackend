// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

//register
router.post('/register', async (req, res) => {
 try{
   const{name,email,role,password}=req.body;
   const existing=await User.findOne({where:{name}});
  if(existing){
    return res.status(404).json({error:'User exists'});
  }
  
 // Encrypting the password to store in the database
 const hashedpassword=await bcrypt.hash(password,10);
 const user=await User.create({
  name,
  email,
  role,
  password:hashedpassword
 });

}catch(err)
{
  console.log(err);
  res.status(500).json({err:"Server Error"});
}
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare passwords
    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, role: user.role },process.env.SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

