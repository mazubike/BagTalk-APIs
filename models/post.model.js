const { BaseModel, CustomQueryBuilder } = require('./base.model');
const User = require('./user.model');
const returnImagePath = require('./../utils/returnImagePath');

class PostQueryBuilder extends CustomQueryBuilder {
    execute() {
        this.withGraphFetched('user(selectBasicInfo)').modifiers({
            selectBasicInfo(builder) {
                builder.select('full_name', 'user_name', 'profile_image')
            }
        });
        return super.execute();
    }
}

class Post extends BaseModel {
    static get tableName() {
        return 'posts';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        return {
            ...super.relationMappings,
            user: {
                relation: BaseModel.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'posts.user_id',
                    to: 'users.id',
                },
            },
        };
    }

    static get QueryBuilder() {
        return PostQueryBuilder;
    }


    $formatJson(json) {
        const formatted = super.$formatJson(json);
        if (formatted.image) {
            formatted.image = returnImagePath(this.image, 'posts')
        }
        return formatted;
    }
}

module.exports = { Post, PostQueryBuilder };
