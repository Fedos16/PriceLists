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
router.post('/getProviderAndDatesProvider', async (req, res) => {
    try {
        let data = await models.PriceList.find({}, { Data: 0 }).lean();
        let arr = {};
        for (let row of data) {
            let date = new Date(row.Date).getTime();
            let name = row.Name;
            if (name in arr) {
                arr[name][date] = row._id;
            } else {
                arr[name] = {};
                arr[name][date] = row._id;
            }
        }

        res.json({ ok: true, arr });
    } catch(e) {
        console.log(e);
        res.json({ ok: false, text: 'Сервер временно недоступен' });
    }
});
router.post('/getPriceListForId', async (req, res) => {
    try {
        const _id = req.body._id;

        let p = await models.PriceList.findOne({ _id }, { Data: 1 }).lean();;
        let arr = [];
        if (p) arr = p.Data;

        res.json({ ok: true, arr });

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