const { BaseModel, CustomQueryBuilder } = require('./base.model');
const returnImagePath = require('./../utils/returnImagePath');

class UserQueryBuilder extends CustomQueryBuilder {
    execute() {
        this.withGraphFetched('role');
        return super.execute();
    }
}

class User extends BaseModel {
    static get tableName() {
        return 'users';
    }

    static get idColumn() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: [], // Add required fields if any

            properties: {
                id: { type: 'integer' },
                provider: { type: ['string', 'null'] },
                provider_id: { type: ['string', 'null'] },
                full_name: { type: ['string', 'null'] },
                profile_image: { type: ['string', 'null'] },
                user_name: { type: ['string', 'null'] },
                bio: { type: ['string', 'null'] },
                social_links: { type: ['object', 'null'] },
                role_id: { type: ['integer', 'null'] },
                is_completed: { type: 'boolean' },
                is_active: { type: 'boolean' }
            }
        };
    }

    static get relationMappings() {
        const Role = require('./role.model');
        const Wallet = require('./wallet.model'); // if wallets table exists
        const ProfileTags = require('./profile_tags.model'); // if wallets table exists
        const Like = require('./likes.model'); // if wallets table exists

        return {
            role: {
                relation: BaseModel.BelongsToOneRelation,
                modelClass: Role,
                join: {
                    from: 'users.role_id',
                    to: 'roles.id'
                }
            },
            wallets: {
                relation: BaseModel.HasManyRelation,
                modelClass: Wallet,
                join: {
                    from: 'users.id',
                    to: 'wallets.user_id'
                }
            },
            profile_tags: {
                relation: BaseModel.ManyToManyRelation,
                modelClass: ProfileTags,
                join: {
                    from: 'users.id',
                    through: {
                        from: 'user_profile_tags.user_id',
                        to: 'user_profile_tags.tag_id',
                    },
                    to: 'profile_tags.id',
                },
            },

            likes: {
                relation: BaseModel.HasManyRelation,
                modelClass: Like,
                join: {
                    from: 'users.id',
                    to: 'likes.liked_by'
                }
            },

        };
    }

    static get QueryBuilder() {
        return UserQueryBuilder;
    }

    // static get QueryBuilder() {
    //     return class extends BaseModel.QueryBuilder {
    //         onBuild(builder) {
    //             console.log('onBuild called for User model');
    //             super.onBuild(builder)
    //             
    //             // Automatically eager-load 'role' unless disabled
    //             if (!builder.context().skipAutoRole) {
    //                 builder.withGraphFetched('role');
    //             }
    //         }
    //     };
    // }

    // Use a getter to expose the role name
    get roleName() {

        return this.role?.name || null; // default fallback
    }

    $parseJson(json, opt) {
        json = super.$parseJson(json, opt);


        // Example setter: force username lowercase
        if (json.user_name) {
            json.user_name = json.user_name.toLowerCase();
        }

        // Example setter: parse JSON string to object for social_links
        if (typeof json.social_links === 'string') {
            try {
                json.social_links = JSON.parse(json.social_links);
            } catch (e) {
                // handle error or leave as is
            }
        }

        return json;
    }

    // Shape the output: inject role as a string
    $formatJson(json) {

        const formatted = super.$formatJson(json);
        formatted.role = this.roleName;
        if (formatted.profile_image) {
            formatted.profile_image = returnImagePath(this.profile_image, 'profiles')
        }
        delete formatted.provider
        delete formatted.provider_id
        return formatted;
    }
}

module.exports = User;
