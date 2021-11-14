const express = require('express');
const router = express.Router();
const path = require('path');
const models = require('../../models');

const bcrypt = require('bcrypt');
const config = require('../../config');

router.post('/setNewPriceList', async (req, res) => {
    try {

        const namesHeader = req.body.namesHeader;
        const dataRows = req.body.dataRows;
        const namePriceList = req.body.namePriceList;
        const rules = req.body.rules;

        await models.Settings.findOneAndUpdate({ Name: namePriceList }, { 
            Data: {
                Data: dataRows,
                Header: namesHeader,
                Rules: rules
            }
        }, { upsert: true });

        res.json({ ok: true });

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