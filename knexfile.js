// knexfile.js
module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'bagtalk'
    },
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds'
    }
  },
  // development: {
  //   client: 'mysql2',
  //   connection: {
  //     host: '127.0.0.1',
  //     user: 'bagtalk_db_user',
  //     password: 'llIUNssRQIKhCc4WF',
  //     database: 'bagtalk_db'
  //   },
  //   migrations: {
  //     directory: './db/migrations'
  //   },
  //   seeds: {
  //     directory: './db/seeds'
  //   }
  // },
  production: {
    client: 'mysql2',
    connection: {
      host: '127.0.0.1',
      user: 'bagtalk_db_user',
      password: 'llIUNssRQIKhCc4WF',
      database: 'bagtalk_db'
    },
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds'
    }
  }
};
