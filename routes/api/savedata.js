const express = require('express');
const router = express.Router();
const path = require('path');
const models = require('../../models');

const bcrypt = require('bcrypt');
const config = require('../../config');

const xl = require('exceljs');

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
router.post('/removePriceList', async (req, res) => {
    try {
        const { name } = req.body;

        await models.Settings.findOneAndRemove({ Name: name });

        res.json({ ok: true });

    } catch(e) {
        console.log(e);
        res.json({ ok: false, text: 'Сервер временно недоступен' });
    }
});

router.post('/saveAndDownloadPrice', async (req, res) => {
    try {

        let { format, data } = req.body;

        let rows = [];
        for (let row of data) {
            let arrRow = [];
            for (let col of row) {
                let value = '';
                if (typeof col == 'object') {
                    if (col) {
                        if ('value' in col) {
                            value = col.value;
                            if (Number(value)) value = Number(value);
                        }
                    }
                } else {
                    value = col;
                    if (Number(value)) value = Number(value);
                }
                arrRow.push(value);
            }
            rows.push(arrRow);
        }

        const wb = new xl.Workbook();
        const ws = wb.addWorksheet('Данные');

        ws.addRows(rows);

        let name = 'excelFile';

        let fileName = `downloads/${name}.xlsx`;
        await wb.xlsx.writeFile(fileName);

        res.json({ ok: true, fileName: name });

    } catch(e) {
        console.log(e);
        res.json({ ok: false, text: 'Сервер временно недоступен' });
    }
});
router.get('/download/:name', (req, res) => {
    let fileName = `downloads/${req.params.name}.xlsx`;
    res.download(fileName);
});


router.post('/test', async (req, res) => {
    try {

    } catch(e) {
        console.log(e);
        res.json({ ok: false, text: 'Сервер временно недоступен' });
    }
});

module.exports = router;