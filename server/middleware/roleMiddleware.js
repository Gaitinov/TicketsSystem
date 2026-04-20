module.exports = function (roles) {
    return function (req, res, next) {
        try {
            if (!req.user || !req.user.roles) {
                return res.status(403).json({ message: "Пользователь не авторизован" });
            }

            let hasRole = false;
            req.user.roles.forEach(role => {
                if (roles.includes(role)) {
                    hasRole = true;
                }
            });

            if (!hasRole) {
                return res.status(403).json({ message: "У вас нет доступа" });
            }
            next();
        } catch (e) {
            console.log(e);
            return res.status(403).json({ message: "Пользователь не авторизован" });
        }
    }
};
