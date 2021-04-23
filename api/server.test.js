const request = require('supertest');
const server = require('./server');
const db = require('../data/dbConfig');
const bcrypt = require('bcryptjs')

const User = require('../api/users/users-model')

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
  await db('users').truncate();
});
afterAll(async () => {
  await db.destroy();
});
let user = { username: "testuser", password: "password" }

describe('I am sane', () => {
  test("true is currently true --may change in the future", () => {
    expect(true).toBe(true)
  })
})

describe('User Registration', () => {
  it('create new user', async () => {
    const res = await request(server).post('/api/auth/register').send(user)
    const expectedUser = { id: 1, username: 'testuser' }

    expect(res.body).toMatchObject(expectedUser)
    expect(res.status).toBe(201)
  })

  it("password is encrypted", async () => {
    user = { username: "testuser2", password: "password" }
    const res = await request(server).post('/api/auth/register').send(user)
    await User.getById(res.body.id)
      .then(newUser => {
        expect(bcrypt.compareSync(user.password, newUser.password)).toBeTruthy()
      })
  })
})

describe('User Login', () => {
  it('validates login credentials', async () => {
    user = { username: "testuser", password: "password" }
    const res = await request(server).post('/api/auth/login').send({ username: "testuser" })
    expect(res.body).toEqual('username and password required')
  })
  it('able to login', async () => {
    const res = await request(server).post('/api/auth/login').send(user)
    expect(res.body.message).toEqual(`welcome, ${user.username}`)
  })
})

describe('Jokes API', () => {
  it('must have valid token', async () => {
    const res = await request(server).get('/api/jokes')
    expect(res.body.message).toEqual('token required')
  })
  it('must have valid credentials', async () => {
    const res = await request(server).post('/api/auth/login').send({ username: 'notauser', password: 'notapassword' })
    expect(res.body).toEqual('invalid credentials')
  })
})