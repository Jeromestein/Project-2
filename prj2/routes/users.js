const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, search, role, isActive } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (role) query.role = role;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
            users,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalUsers: total
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// Get user profile by username (public)
router.get('/profile/:username', async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username, isActive: true })
            .select('-password -email');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's published posts
        const posts = await Post.find({
            author: user._id,
            status: 'published',
            isPublic: true
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title slug excerpt createdAt views likeCount');

        res.json({
            user,
            recentPosts: posts
        });

    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user profile' });
    }
});

// Get user's posts by username (public)
router.get('/:username/posts', async (req, res) => {
    try {
        const { username } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const user = await User.findOne({ username, isActive: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const posts = await Post.find({
            author: user._id,
            status: 'published',
            isPublic: true
        })
        .populate('author', 'username firstName lastName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-content');

        const total = await Post.countDocuments({
            author: user._id,
            status: 'published',
            isPublic: true
        });

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

// Update user (admin or self)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, bio, avatar, role, isActive } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check permissions
        if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Only admins can change role and isActive
        const updates = {};
        if (firstName !== undefined) updates.firstName = firstName;
        if (lastName !== undefined) updates.lastName = lastName;
        if (bio !== undefined) updates.bio = bio;
        if (avatar !== undefined) updates.avatar = avatar;
        
        if (req.user.role === 'admin') {
            if (role !== undefined) updates.role = role;
            if (isActive !== undefined) updates.isActive = isActive;
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            message: 'User updated successfully',
            user: updatedUser
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: errors.join(', ') });
        }
        res.status(500).json({ message: 'Failed to update user' });
    }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (req.user._id.toString() === id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        // Delete user's posts
        await Post.deleteMany({ author: id });

        // Delete user
        await User.findByIdAndDelete(id);

        res.json({ message: 'User and associated posts deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user' });
    }
});

// Get user statistics (admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const totalPosts = await Post.countDocuments();
        const publishedPosts = await Post.countDocuments({ status: 'published' });
        const draftPosts = await Post.countDocuments({ status: 'draft' });

        // Get recent registrations
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('username firstName lastName createdAt');

        // Get top authors
        const topAuthors = await Post.aggregate([
            { $match: { status: 'published' } },
            { $group: { _id: '$author', postCount: { $sum: 1 } } },
            { $sort: { postCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    username: '$user.username',
                    firstName: '$user.firstName',
                    lastName: '$user.lastName',
                    postCount: 1
                }
            }
        ]);

        res.json({
            overview: {
                totalUsers,
                activeUsers,
                totalPosts,
                publishedPosts,
                draftPosts
            },
            recentUsers,
            topAuthors
        });

    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch statistics' });
    }
});

module.exports = router;
