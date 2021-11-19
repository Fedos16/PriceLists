const express = require('express');
const router = express.Router();

const fs = require('fs');

const models = require('../../models');
const path = require('path');
const session = require('express-session');



function setMenu(path) {
    const menuArray = [
        { name: 'Рабочая область', active: false, href: '/' },
        { name: 'Статистика', active: false, href: '/statistics' },
        { name: 'Настройки', active: false, href: '/settings' }
    ];

    for (let i=0; i < menuArray.length; i++) {
        let row = menuArray[i];
        if (row.href == path) menuArray[i].active = true;
    }

    return { menu: menuArray };

}


router.get('/', (req, res) => {
    const data = setMenu(req.path);
    res.render('main.ejs', { data });
});
router.get('/settings', (req, res) => {
    const data = setMenu(req.path);
    res.render('settings.ejs', { data });
});
router.get('/statistics', (req, res) => {
    const data = setMenu(req.path);
    res.render('statistics.ejs', { data });
});

module.exports = router;