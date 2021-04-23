const db = require('../../data/dbConfig')


const add = async (user) => {
    const [id] = await db('users').insert(user)

    return getById(id)
}

const getById = (id) => {
    return db('users').where({ id }).first();
}

const getByFilter = (filter => {
    return db('users').where(filter)
})

module.exports = {
    add,
    getById,
    getByFilter
}