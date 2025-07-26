// models/Comment.js
const { BaseModel, CustomQueryBuilder } = require('./base.model');

class CommentQueryBuilder extends CustomQueryBuilder {

    withFlags(userId) {
        return this.leftJoinRelated('likes as l', (qb) => {
            qb.on('l.liked_by', '=', userId);
        }).select(
            Comment.raw('MAX(CASE WHEN l.id IS NULL THEN 0 ELSE 1 END) AS is_liked')
        ).groupBy('comments.id');
    }

    execute() {
        this.withGraphFetched('author(selectBasicInfo)').modifiers({
            selectBasicInfo(builder) {
                builder.select('id', 'full_name', 'user_name', 'profile_image');
            }
        });

        // Join replies and likes and count them using groupBy
        this.leftJoinRelated('[replies, likes]')
            .select('comments.*')
            .countDistinct('replies.id as comments_count')
            .countDistinct('likes.comment_id as likes_count')
            .groupBy('comments.id');

        return super.execute();
    }
}



class Comment extends BaseModel {
    static get tableName() {
        return 'comments';
    }

    static get idColumn() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['comment', 'comment_by'],

            properties: {
                id: { type: 'integer' },
                post_id: { type: ['integer', 'null'] },
                comment: { type: 'string', minLength: 3, maxLength: 500 },
                comment_id: { type: ['integer', 'null'] },
            },
        };
    }

    static get relationMappings() {
        const User = require('./user.model');
        const Post = require('./bagtalk_post.model');

        return {
            post: {
                relation: BaseModel.BelongsToOneRelation,
                modelClass: Post,
                join: {
                    from: 'comments.post_id',
                    to: 'posts.id'
                }
            },
            author: {
                relation: BaseModel.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'comments.comment_by',
                    to: 'users.id'
                }
            },
            parent: {
                relation: BaseModel.BelongsToOneRelation,
                modelClass: Comment,
                join: {
                    from: 'comments.comment_id',
                    to: 'comments.id'
                }
            },
            replies: {
                relation: BaseModel.HasManyRelation,
                modelClass: Comment,
                join: {
                    from: 'comments.id',
                    to: 'comments.comment_id'
                }
            },
            likes: {
                relation: BaseModel.HasManyRelation,
                modelClass: require('./likes.model'),
                join: {
                    from: 'comments.id',
                    to: 'likes.comment_id'
                }
            }
        };
    }


    static get QueryBuilder() {
        return CommentQueryBuilder;
    }

}

module.exports = Comment;
