const express = require('express');
const router = express.Router();

const pool = require('../database');

let multer = require('multer');
let upload = multer();

router.post('/add', upload.fields([]), async (req, res, next) => {
    // console.log(req.body)
    try {
        let valid = false;
        const { nombre, cuerpo, iduser, tipo } = req.body;
        const newArchive = {
            nombre,
            cuerpo
        };
        if (tipo == 'css'){
            newArchive.iduser = iduser
            await pool.query('INSERT INTO heroku_ac61479f38e9e23.css set ?', [newArchive]);
            valid=true;
        }
        else if (tipo == 'html'){
            newArchive.iduser2 = iduser
            await pool.query('INSERT INTO heroku_ac61479f38e9e23.html set ?', [newArchive]);
            valid=true;
        }
        else if (tipo == 'js'){
            newArchive.iduser1 = iduser
            await pool.query('INSERT INTO heroku_ac61479f38e9e23.js set ?', [newArchive]);
            valid=true;
        }
        res.status(201).json({
            data: valid,
            message: 'file created'
        });
    }catch(err){
        next(err);
    }
});

router.post('/list', upload.fields([]), async (req, res, next) => {
    const {tipo, id} = req.body;
    console.log(req.body)
    try {
        let list
        if (tipo == 'css'){
            list = await pool.query('SELECT * FROM heroku_ac61479f38e9e23.css WHERE iduser = ?', [id]);
        }
        else if (tipo == 'html'){
            list = await pool.query('SELECT * FROM heroku_ac61479f38e9e23.html WHERE iduser2 = ?', [id]);
        }
        else if (tipo == 'js'){
            list = await pool.query('SELECT * FROM heroku_ac61479f38e9e23.js WHERE iduser1 = ?', [id]);
        }
        res.status(201).json({
            data: list,
            message: 'file listed'
        });
    }catch(err){
        next(err);
    }
});


router.post('/delete/:id',upload.fields([]), async (req, res,next) => {
    const { id } = req.params;
    const { tipo } = req.body;

    try {
        
        if (tipo == 'css'){
            await pool.query('DELETE FROM heroku_ac61479f38e9e23.css WHERE idcss = ?', [id]);
        }
        else if (tipo == 'html'){
            await pool.query('DELETE FROM heroku_ac61479f38e9e23.html WHERE idhtml = ?', [id]);
        }
        else if (tipo == 'js'){
            await pool.query('DELETE FROM heroku_ac61479f38e9e23.js WHERE idjs = ?', [id]);
        }
        res.status(201).json({
            message: 'file deleted'
        });
    }catch(err){
        next(err);
    }       
});


/*router.get('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const links = await pool.query('SELECT * FROM heroku_ac61479f38e9e23.css WHERE id = ?', [id]);
    res.render('links/edit', {link: links[0]});
});*/

router.post('/edit/:id', upload.fields([]), async (req, res, next)=>{
    const { id } = req.params;
    const { nombre, cuerpo, tipo} = req.body;
    const newArchive = {
        nombre,
        cuerpo,
    };

    try {
        
        if (tipo == 'css'){
            await pool.query('UPDATE heroku_ac61479f38e9e23.css set ? WHERE idcss = ?', [newArchive, id]);
        }
        else if (tipo == 'html'){
            await pool.query('UPDATE heroku_ac61479f38e9e23.html set ? WHERE idhtml = ?', [newArchive, id]);
        }
        else if (tipo == 'js'){
            await pool.query('UPDATE heroku_ac61479f38e9e23.js set ? WHERE idjs = ?', [newArchive, id]);
        }
        res.status(201).json({
            message: 'file update'
        });
    }catch(err){
        next(err);
    }       
});


module.exports = router;