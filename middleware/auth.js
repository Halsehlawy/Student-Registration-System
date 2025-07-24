// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
};

// Check if user can edit/delete (admin only)
const canModify = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).render('error', { 
            message: 'Access denied: Only administrators can edit or delete records' 
        });
    }
    next();
};

module.exports = {
    isAuthenticated,
    canModify
};