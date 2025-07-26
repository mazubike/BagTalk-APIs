const { Post, PostQueryBuilder } = require('./post.model');

class SimplePostQueryBuilder extends PostQueryBuilder {

    withFlags(userId) {
        return this
            .leftJoinRelated('likes as l', (qb) => {
                qb.on('l.liked_by', '=', userId);
            })
            .leftJoinRelated('saved_posts as s', (qb) => {
                qb.on('s.user_id', '=', userId);
            })
            .select(
                Post.raw('MAX(CASE WHEN l.id IS NULL THEN 0 ELSE 1 END) AS is_liked'),
                Post.raw('MAX(CASE WHEN s.id IS NULL THEN 0 ELSE 1 END) AS is_saved')
            )
            .groupBy('posts.id');
    }


    execute() {
        
        if (this.context().skipJoins) {
            // Skip join logic, e.g., on updates
            return super.execute();
        }
        // Add Comments count to each Post
        this.leftJoinRelated('[comments, likes]')
            .where('comments.comment_id', null)
            .select('posts.*')
            .countDistinct('comments.id as comments_count')
            .countDistinct('likes.id as likes_count')
            .groupBy('posts.id');

        return super.execute();
    }
}


class Simple extends Post {
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
                title: { type: 'string', minLength: 3, maxLength: 100 },
                description: { type: ['string', 'null'], minLength: 3, maxLength: 500 },
                image: { type: ['string', 'null'] },
                post_type: { type: 'string', enum: ['simple'] },
                tags: { type: ['array', 'null'], items: { type: 'string' }, default: [] },
            },
        };
    }

    static get relationMappings() {
        const Comment = require('./comments.model');
        const Like = require('./likes.model');
        const SavedPost = require('./saved_post.model');

        return {
            ...super.relationMappings,
            comments: {
                relation: Post.HasManyRelation,
                modelClass: Comment,
                join: {
                    from: 'posts.id',
                    to: 'comments.post_id',
                },
            },
            likes: {
                relation: Post.HasManyRelation,
                modelClass: Like,
                join: {
                    from: 'posts.id',
                    to: 'likes.post_id',
                },
            },
            saved_posts: {
                relation: Post.HasManyRelation,
                modelClass: SavedPost,
                join: {
                    from: 'posts.id',
                    to: 'saved_posts.post_id',
                },
            },
        };
    }

    static get QueryBuilder() {
        return SimplePostQueryBuilder;
    }



}

module.exports = Simple;
