const { Model } = require('objection');

class SavedPost extends Model {
    static get tableName() {
        return 'saved_posts';
    }

    static get idColumn() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['user_id', 'post_id'],
            properties: {
                id: { type: 'integer' },
                user_id: { type: 'integer' },
                post_id: { type: 'integer' },
            }
        };
    }

    // static get relationMappings() {
    //     const User = require('./User');
    //     const Post = require('./Post');

    //     return {
    //         user: {
    //             relation: Model.BelongsToOneRelation,
    //             modelClass: User,
    //             join: {
    //                 from: 'saved_post.user_id',
    //                 to: 'users.id',
    //             },
    //         },
    //         post: {
    //             relation: Model.BelongsToOneRelation,
    //             modelClass: Post,
    //             join: {
    //                 from: 'saved_post.post_id',
    //                 to: 'posts.id',
    //             },
    //         },
    //     };
    // }
}

module.exports = SavedPost;
