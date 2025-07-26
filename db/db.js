// db.js
const Knex = require('knex');
const { Model } = require('objection');
const knexConfig = require('./../knexfile'); // Adjust path if needed

const knex = Knex(knexConfig[process.env.MODE || 'development']);

Model.knex(knex); // Bind knex to all Objection models

module.exports = knex;