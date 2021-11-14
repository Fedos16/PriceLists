const express = require('express');
const router = express.Router();
const config = require('../../config');

const fs = require('fs');
const models = require('../../models');

router.post('/getPriceListsName', async (req, res) => {
    try {

        const priceLists = await models.Settings.find().lean();

        res.json({ ok: true, priceLists });

    } catch(e) {
        console.log(e);
        res.json({ ok: false, text: 'Сервер временно недоступен' });
    }
});


router.post('/test', async (req, res) => {
    try {

    } catch(e) {
        console.log(e);
        res.json({ ok: false, text: 'Сервер временно недоступен' });
    }
});

module.exports = router;