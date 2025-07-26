/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
// knexfile.js (or in the seeds folder, example: 2023_07_09_123456_profile_tags_seed.js)

exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('profile_tags').del()
    .then(function () {
      // Inserts seed entries
      return knex('profile_tags').insert([
        { id: 1, name: 'Trader' },
        { id: 2, name: 'Investor' },
        { id: 3, name: 'Entrepreneur' },
        { id: 4, name: 'Influencer' },
        { id: 5, name: 'Builder' },
        { id: 6, name: 'Artist' },
        { id: 7, name: 'Dev' },
        { id: 8, name: 'CryptoCurious' },
      ]);
    });
};

