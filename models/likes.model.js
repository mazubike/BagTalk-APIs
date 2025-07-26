// models/Like.js

const { Model } = require('objection');
const { CustomQueryBuilder } = require('./base.model');

class LikesQueryBuilder extends CustomQueryBuilder {
    execute() {
        this.withGraphFetched('author')
        // this.joinRelated('author').select('author.id', 'author.full_name', 'author.user_name', 'author.profile_image');

        return super.execute();
    }
}
class Like extends Model {
    static get tableName() {
        return 'likes';
    }

    static get idColumn() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['post_id', 'liked_by'],

            properties: {
                id: { type: 'integer' },
                post_id: { type: ['integer', 'null'] },
                comment_id: { type: ['integer', 'null'] },
                liked_by: { type: 'integer' },
            },
        };
    }

    static get relationMappings() {
        const User = require('./user.model');
        const Post = require('./bagtalk_post.model');
        const Comment = require('./comments.model');

        return {
            author: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'likes.liked_by',
                    to: 'users.id'
                }
            },
            post: {
                relation: Model.BelongsToOneRelation,
                modelClass: Post,
                join: {
                    from: 'likes.post_id',
                    to: 'posts.id'
                }
            },
            comment: {
                relation: Model.BelongsToOneRelation,
                modelClass: Comment,
                join: {
                    from: 'likes.comment_id',
                    to: 'comments.id'
                }
            }
        };
    }

    static get QueryBuilder() {
        return LikesQueryBuilder;
    }
}

module.exports = Like;
