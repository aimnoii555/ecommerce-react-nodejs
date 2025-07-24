const prisma = require('../config/prisma')
const bcript = require('bcryptjs')
const jwt = require('jsonwebtoken')



exports.register = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email) {
      return res.status(400).json({ message: 'email is required!' })
    }

    if (!password) {
      return res.status(400).json({ message: 'password is required!' })
    }

    const user = await prisma.user.findFirst({
      where: {
        email: email
      }
    })

    if (user) {
      return res.status(400).json({ message: 'Email already exists!' })
    }

    const hashedPassword = await bcript.hash(password, 10)
    const newUser = await prisma.user.create(
      {
        data: {
          email: email,
          password: hashedPassword
        }
      }
    )
    res.send("User created successfully", newUser)


  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Server Error"
    })
  }
}

exports.login = async (req, res) => {


  try {
    const { email, password } = req.body

    const checkUser = await prisma.user.findFirst(
      {
        where: {
          email: email
        }
      }
    )

    if (!checkUser || !checkUser.enabled) {
      return res.status(400).json({ message: 'Invalid email!' })
    }

    const isMatch = await bcript.compare(password, checkUser.password)

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password!' })
    }

    const payload = {
      id: checkUser.id,
      email: checkUser.email,
      role: checkUser.role,
    }

    jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '15d' }, (err, token) => {

      if (err) {
        return res.status(500).json({ message: 'Token generation failed', error: err.message })
      }

      res.json({
        payload, token
      })
    })

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message })
  }
}

exports.currentUser = async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: req.user.email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })


    res.json({
      data: user
    })
  } catch (error) {
    res.status(500).json({ message: 'Server Error' })
  }
}

