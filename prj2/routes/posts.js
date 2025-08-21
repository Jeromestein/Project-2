const express = require('express');
const Post = require('../models/Post');
const { authenticateToken, requireOwnership, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// Get all published posts (public)
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { page = 1, limit = 10, category, tag, search, sort = 'newest' } = req.query;
        const skip = (page - 1) * limit;

        // Build query
        const query = { status: 'published', isPublic: true };
        
        if (category) query.category = category;
        if (tag) query.tags = tag;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort
        let sortOption = {};
        switch (sort) {
            case 'oldest':
                sortOption = { createdAt: 1 };
                break;
            case 'popular':
                sortOption = { views: -1 };
                break;
            case 'newest':
            default:
                sortOption = { createdAt: -1 };
        }

        const posts = await Post.find(query)
            .populate('author', 'username firstName lastName avatar')
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit))
            .select('-content');

        const total = await Post.countDocuments(query);

        res.json({
            posts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalPosts: total,
                hasNext: skip + posts.length < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch posts' });
    }
});

// Get single post by slug (public)
router.get('/:slug', optionalAuth, async (req, res) => {
    try {
        const { slug } = req.params;

        const post = await Post.findOne({ 
            slug, 
            status: 'published', 
            isPublic: true 
        }).populate('author', 'username firstName lastName avatar bio');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Increment view count
        post.views += 1;
        await post.save();

        // Check if user liked the post
        let isLiked = false;
        if (req.user) {
            isLiked = post.likes.includes(req.user._id);
        }

        res.json({
            post: {
                ...post.toObject(),
                isLiked
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch post' });
    }
});

// Create new post (authenticated)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, content, excerpt, category, tags, featuredImage, status = 'draft' } = req.body;

        const post = new Post({
            title,
            content,
            excerpt,
            category,
            tags: tags || [],
            featuredImage: featuredImage || '',
            status,
            author: req.user._id
        });

        await post.save();

        const populatedPost = await Post.findById(post._id)
            .populate('author', 'username firstName lastName avatar');

        res.status(201).json({
            message: 'Post created successfully',
            post: populatedPost
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: errors.join(', ') });
        }
        res.status(500).json({ message: 'Failed to create post' });
    }
});

// Update post (owner or admin)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, excerpt, category, tags, featuredImage, status } = req.body;

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check ownership
        if (req.user.role !== 'admin' && post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const updates = {};
        if (title !== undefined) updates.title = title;
        if (content !== undefined) updates.content = content;
        if (excerpt !== undefined) updates.excerpt = excerpt;
        if (category !== undefined) updates.category = category;
        if (tags !== undefined) updates.tags = tags;
        if (featuredImage !== undefined) updates.featuredImage = featuredImage;
        if (status !== undefined) updates.status = status;

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).populate('author', 'username firstName lastName avatar');

        res.json({
            message: 'Post updated successfully',
            post: updatedPost
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: errors.join(', ') });
        }
        res.status(500).json({ message: 'Failed to update post' });
    }
});

// Delete post (owner or admin)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check ownership
        if (req.user.role !== 'admin' && post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await Post.findByIdAndDelete(id);

        res.json({ message: 'Post deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Failed to delete post' });
    }
});

// Like/Unlike post (authenticated)
router.post('/:id/like', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(req.user._id);
        
        if (likeIndex > -1) {
            // Unlike
            post.likes.splice(likeIndex, 1);
        } else {
            // Like
            post.likes.push(req.user._id);
        }

        await post.save();

        res.json({
            message: likeIndex > -1 ? 'Post unliked' : 'Post liked',
            likeCount: post.likes.length,
            isLiked: likeIndex === -1
        });

    } catch (error) {
        res.status(500).json({ message: 'Failed to update like' });
    }
});

// Add comment to post (authenticated)
router.post('/:id/comments', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Comment content is required' });
        }

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.comments.push({
            user: req.user._id,
            content: content.trim()
        });

        await post.save();

        const populatedPost = await Post.findById(id)
            .populate('comments.user', 'username firstName lastName avatar');

        const newComment = populatedPost.comments[populatedPost.comments.length - 1];

        res.status(201).json({
            message: 'Comment added successfully',
            comment: newComment
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: errors.join(', ') });
        }
        res.status(500).json({ message: 'Failed to add comment' });
    }
});

// Get user's posts (authenticated)
router.get('/user/me', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;

        const query = { author: req.user._id };
        if (status) query.status = status;

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Post.countDocuments(query);

        res.json({
            posts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalPosts: total
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user posts' });
    }
});

module.exports = router;
