const express = require('express');
const router = express.Router();

const models = require('../../models');
const bcrypt = require('bcrypt');
const config = require('../../config');

router.post('/login', async (req, res) => {
    try {

        const login = req.body.login;
        const password = req.body.pass;

        if (!login || !password) {
            res.json({ ok: false, text: 'Логин или Пароль не заполнены' });
            return;
        }

        let user = await models.User.findOne({ Login: login, Status: true }, { Login: 1, Password: 1, Access: 1 });
        if (!user) {
            res.json({ ok: false, text: 'Логин или пароль введены неверно' });
            return;
        }

        const status_password = bcrypt.compareSync(password, user.Password);
        if (!status_password) {
            res.json({ ok: false, text: 'Логин или пароль введены неверно' });
            return;
        }

        let access = String(user.Access).toLowerCase();

        req.session.user = user.Login;
        req.session.access = access;

        res.json({ ok: true });

    } catch (e) {
        console.log(e);
        res.json({ ok: false, text: 'Сервер временно недступен' });
    }
})
// POST for logout
router.post('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(() => {
            res.json({ok: true})
        });
    } else {
        res.json({ok: true})
    }
});

module.exports = router;