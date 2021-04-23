const router = require('express').Router();

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { jwtSecret } = require('../../config/secrets')

const Users = require('../users/users-model')
const { usernameUnique } = require('../middleware/auth-middleware')

// Test login information is username bagel password chomp1234
// [x] After logging in, make a GET request on Postman by going to [Headers] 
// then add Authorization as a key. Insert the the token as the value

router.post('/register', usernameUnique, (req, res, next) => {
  const user = req.body

  if (isValid(user)) {
    //hashes the password slowly making it more annoying for brute force to attempt hacking
    user.password = bcrypt.hashSync(user.password, process.env.BCRYPT_ROUNDS || 8) 

    Users.add(user)
      .then(user => {
        res.status(201).json(user)
      })
      .catch(next)
  } else {
    res.status(400).json("username and password required")
  }
});

router.post('/login', (req, res, next) => {
  const { username, password } = req.body

  if (isValid(req.body)) {
    Users.getByFilter({ username })
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          const token = buildToken(user)
          res.json({
            message: `welcome, ${username}`,
            token
          })
        } else {
          res.status(401).json('invalid credentials')
        }
      })
      .catch(next)
  } else {
    res.status(401).json('username and password required')
  }
});

function isValid(user) {
  return Boolean(user.username && user.password && typeof user.password === "string");
}

function buildToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    password: user.password
  }
  const config = {
    expiresIn: '1d',
  }
  return jwt.sign(
    payload, jwtSecret, config
  )
}

module.exports = router;