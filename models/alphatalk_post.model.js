const Post = require('./post.model');

class AlphaPost extends Post {
    static get tableName() {
        return 'posts';
    }

    static get idColumn() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['title', 'description', 'image'],

            properties: {
                id: { type: 'integer' },
                user_id: { type: 'integer' },
                title: { type: 'integer' }, // Change to 'string' if appropriate
                description: { type: ['string', 'null'] },
                image: { type: ['string', 'null'] },
                visibility: { type: 'string', enum: ['followers', 'public'] },
                joiner: { type: 'string', enum: ['anyone', 'followers', 'alpha users', 'invited users'] },
                duration: { type: 'string', enum: ['30', '60'] },
                schedule_date: { type: ['string', 'null'], format: 'date' },
                schedule_time: { type: ['string', 'null'], format: 'time' },
                start_time: { type: ['string', 'null'], format: 'time' },
                end_time: { type: ['string', 'null'], format: 'time' },
                post_type: { type: 'string', enum: ['talk'] },
                tags: { type: ['array', 'null'], items: { type: 'string' }, default: [] },
            },
        };
    }

    // static get relationMappings() {
    //     const User = require('./user.model'); // Adjust path as needed

    //     return {
    //         user: {
    //             relation: BaseModel.BelongsToOneRelation,
    //             modelClass: User,
    //             join: {
    //                 from: 'posts.user_id',
    //                 to: 'users.id',
    //             },
    //         },
    //     };
    // }
}

module.exports = AlphaPost;
