const Post = require('../../models/bagtalk_post.model');
const Like = require('../../models/likes.model');
const Comment = require('../../models/comments.model');
const User = require('../../models/user.model');
const SavedPost = require('../../models/saved_post.model');

exports.getAllBagtalk = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || parseInt(process.env.ITEMS_LIMIT) || 10;
        const pageIndex = page - 1; // .page() uses 0-based indexing

        const result = await Post.query().withFlags(req.user?.id)
            .orderBy('created_at', 'desc')
            .page(pageIndex, limit);

        return res.status(200).json({
            status: 200,
            message: 'Bagtalk all posts fetched successfully',
            pagination: {
                total_results: result.total,
                total_pages: Math.ceil(result.total / limit),
                current_page: page,
                limit
            },
            posts: result.results,

        });
    } catch (error) {
        next(error);
    }
};


// exports.getSingleBagtalk = async (req, res, next) => {
//     const post_id = req.params.id;
//     if (!post_id) {
//         return req.status(422).json({
//             status: 422,
//             message: 'Post id not Found',
//         })
//     }

//     try {
//         const result = await Post.query().withFlags(req.user?.id).findById(post_id);
//         if (!result) {
//             return res.status(422).json({
//                 status: 422,
//                 message: 'Post not Found'

//             });
//         }
//         return res.status(200).json({
//             status: 200,
//             message: 'Single Bagtalk fetched successfully',
//             post: result,

//         });
//     } catch (error) {
//         next(error);
//     }
// };

exports.addComment = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { comment, comment_id } = req.body;

        // Optional: validate parent comment exists if this is a reply
        let parsedCommentId = comment_id ? parseInt(comment_id) : null;

        if (parsedCommentId) {
            const parent = await Comment.query()
                .findById(parsedCommentId)
                .whereNull('comments.deleted_at'); // exclude soft-deleted comments

            if (!parent) {
                return res.status(400).json({ message: 'Parent comment not found or has been deleted' });
            }
        }

        const newComment = await Comment.query().insert({
            post_id: parseInt(id),
            comment,
            comment_by: parseInt(userId),
            comment_id: parsedCommentId
        });
        const afterAddComment = await Comment.query().withFlags(userId).findById(newComment.id)
        return res.status(201).json({
            message: comment_id ? 'Reply added successfully' : 'Comment added successfully',
            comment: afterAddComment
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteComment = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const id = req.params.id;
        
        const comment = await Comment.query().findById(id);
        
        if (!comment || comment.comment_by !== userId) {
            return res.status(422).json({ message: 'Unauthorized or comment not found' });
        }

        await comment.$query().hardDelete();
        return res.status(200).json({ message: 'Comment deleted' });
    } catch (error) {
        next(error);
    }
};

exports.getCommentsWithReplies = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || parseInt(process.env.ITEMS_LIMIT) || 10;
        const pageIndex = page - 1; // .page() uses 0-based indexing


        const postId = Number(req.params.id);
        const parentCommentId = req.body?.comment_id ? Number(req.body.comment_id) : null;

        if (isNaN(postId)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }

        // Start building the query with proper prefixes
        const query = Comment.query().withFlags(req.user?.id)
            .where('comments.post_id', postId).orderBy('created_at', 'desc');  // <--- prefix here

        if (parentCommentId) {
            query.andWhere('comments.comment_id', parentCommentId);  // <--- prefix here
        } else {
            query.whereNull('comments.comment_id');  // <--- prefix here
        }

        const result = await query.page(pageIndex, limit);

        return res.status(200).json({
            status: 200,
            message: 'Comments fetched successfully',
            pagination: {
                total_results: result.total,
                total_pages: Math.ceil(result.total / limit),
                current_page: page,
                limit
            },
            comments: result.results,
        });
    } catch (error) {
        next(error)
    }
};

exports.toggleLike = async (req, res, next) => {
    try {
        const userId = Number(req.user.id);
        const { id } = req.params; // ID of post or comment
        const { type } = req.query; // Should be either 'post' or 'comment'

        if (!['post', 'comment'].includes(type)) {
            return res.status(422).json({ status: 422, message: "Invalid like type. Must be 'post' or 'comment'." });
        }

        // Check if post or comment exists before liking
        if (type === 'post') {
            const postExists = await Post.query().findById(id);
            if (!postExists) {
                return res.status(422).json({ status: 422, message: "Post not found" });
            }
        } else if (type === 'comment') {
            const commentExists = await Comment.query().findById(id);
            if (!commentExists) {
                return res.status(422).json({ status: 422, message: "Comment not found" });
            }
        }

        // Build search condition dynamically
        const searchCondition = {
            liked_by: Number(userId),
            post_id: type === 'post' ? Number(id) : null,
            comment_id: type === 'comment' ? Number(id) : null
        };

        const existingLike = await Like.query().findOne(searchCondition);

        if (existingLike) {
            await existingLike.$query().delete();
            return res.status(200).json({ is_liked: 0, message: `${type.charAt(0).toUpperCase() + type.slice(1)} unliked` });
        } else {
            const insertData = {
                liked_by: Number(userId),
                post_id: type === 'post' ? Number(id) : null,
                comment_id: type === 'comment' ? Number(id) : null
            };
            await Like.query().insert(insertData);
            return res.status(200).json({ is_liked: 1, message: `${type.charAt(0).toUpperCase() + type.slice(1)} liked` });
        }
    } catch (error) {
        next(error);
    }
};

exports.getLikes = async (req, res, next) => {
    try {
        const userId = Number(req.user.id);
        const { id } = req.params; // ID of post or comment
        const { type } = req.query; // 'post' or 'comment'

        if (!['post', 'comment'].includes(type)) {
            return res.status(422).json({ status: 422, message: "Invalid like type. Must be 'post' or 'comment'." });
        }

        // Check if the post or comment exists
        if (type === 'post') {
            const post = await Post.query().findById(id);
            if (!post) {
                return res.status(422).json({ status: 422, message: "Post not found" });
            }
        } else {
            const comment = await Comment.query().findById(id);
            if (!comment) {
                return res.status(422).json({ status: 422, message: "Comment not found" });
            }
        }

        // Build query condition
        const likeCondition = {
            post_id: type === 'post' ? Number(id) : null,
            comment_id: type === 'comment' ? Number(id) : null
        };

        // Get total likes
        // const likedUsers = await Like.query()
        //     .where(likeCondition)
        //     .orderBy('likes.created_at', 'desc');

        const likedUsers = await User.query().joinRelated('likes')
            .where(likeCondition)
            .orderBy('likes.created_at', 'desc');

        return res.status(200).json({
            status: 200,
            message: 'Likes Fetched!',
            users: likedUsers
        });

    } catch (error) {
        next(error);
    }
};

exports.toggleSavedPost = async (req, res, next) => {
    const userId = Number(req.user.id);
    const postId = Number(req.params.id);
    try {

        const checkPost = await Post.query().findById(postId);
        if (!checkPost) {
            return res.status(422).json({ status: 422, message: `Post not available` });
        }
        const existing = await SavedPost.query()
            .where({ user_id: userId, post_id: postId })
            .first();
        if (existing) {
            await SavedPost.query().deleteById(existing.id);
            return res.status(200).json({ is_saved: 0, message: `Post unsaved` });
        } else {
            await SavedPost.query().insert({ user_id: userId, post_id: postId });
            return res.status(200).json({ is_saved: 1, message: `Post saved` });
        }
    } catch (error) {
        next(error)
    }
};

exports.getSavedPosts = async (req, res, next) => {
    const userId = Number(req.query.user_id) || Number(req.user.id);
    
    if (!userId) {
        return res.status(422).json({ status: 422, message: 'User Id Required.' })
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || parseInt(process.env.ITEMS_LIMIT) || 10;
    const pageIndex = page - 1;

    try {
        const result = await Post.query().withFlags(userId)
            .joinRelated('saved_posts')
            .where('posts.user_id', userId)
            .orderBy('created_at', 'desc')
            .page(pageIndex, limit);

        return res.status(200).json({
            status: 200,
            message: 'Saved posts fetched successfully',
            pagination: {
                total_results: result.total,
                total_pages: Math.ceil(result.total / limit),
                current_page: page,
                limit
            },
            posts: result.results,

        });
    } catch (error) {
        next(error)
    }
};


