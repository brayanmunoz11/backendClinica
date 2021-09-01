const express = require('express');
const router = express.Router();

const pool = require('../database');
const helpers = require('../lib/helpers');

let multer = require('multer');
let upload = multer();

// const FormData = require('form-data');
// const axios = require('axios');

let UserServices = require('./../services/users')
const userService = new UserServices();

router.post('/signup', upload.fields([]), async (req, res, next) => {
  // console.log(req.body);
  try {
    const { user, message } = await userService.createUser(req.body)
    // const { userP } = await userService.createPreferences(user)
    res.status(200).json({
      user,
      message
    });
  }
  catch (err) {
    next(err);
  }
});

//SIGNIN
router.post('/signin', async (req, res, next) => {
  // console.log(req.body);
  try {
    const [user, message, valid, familiares] = await userService.getUser(req.body);
    // console.log({user, message, valid, familiares})

    res.status(200).json({
      user,
      message,
      valid,
      familiares
    });
  }
  catch (err) {
    next(err);
  }
});


router.post('/useredit/:id', upload.fields([]), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, usuario, email } = req.body;

    const newUser = {
      nombre,
      apellido,
      usuario,
      email
    };

    await pool.query('UPDATE heroku_97268bb8b0abec4.user set ? WHERE id = ?', [newUser, id]);
    const user = await pool.query('SELECT * FROM heroku_97268bb8b0abec4.user WHERE id = ?', [id]);
    res.status(200).json({
      data: user[0],
      message: "user updated"
    });
  } catch (err) {
    next(err);
  }
});

router.post('/validpassword/:id', upload.fields([]), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    let message= "";

    const passwordBD = await pool.query('SELECT password FROM heroku_97268bb8b0abec4.user WHERE id = ?', [id]);

    //console.log(passwordBD[0].password);

    const validPassword = await helpers.matchPassword(password, passwordBD[0].password)
    if (validPassword) {
      message = 'password correcto';
    } else {
      message = 'password incorrecto';
    }
    res.status(200).json({
      message: message,
    });
  }
  catch (err) {
    next(err);
  }
});

router.post('/updatepassword/:id', upload.fields([]), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newpassword } = req.body;
    const passwordencriptado = await helpers.encryptPassword(newpassword);
    // console.log(passwordencriptado)
    let message = "password update"

    if (newpassword.length != 0){
      await pool.query('UPDATE heroku_97268bb8b0abec4.user set password = ? WHERE id = ?', [passwordencriptado, id]);
    }
    else{
      message = "Password vacio";
    }

    res.status(200).json({
      message: message,
    });
  }
  catch (err) {
    console.log(err);
    next(err);
  }
});

router.get('/deleteuser/:id', upload.fields([]), async (req, res, next) => {
  try {
    const { id } = req.params;
    // console.log(id);
    await pool.query('DELETE FROM heroku_97268bb8b0abec4.user WHERE id = ?', [id]);

    res.status(200).json({
      message: "user delete",
    });
  }
  catch (err) {
    next(err);
  }
});

router.post('/updatePhoto/:id', upload.fields([]), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { url } = req.body;

    await pool.query('UPDATE heroku_97268bb8b0abec4.user set image = ? WHERE id = ?', [url, id]);
    const user = await pool.query('SELECT * FROM heroku_97268bb8b0abec4.user WHERE id = ?', [id]);

    res.status(200).json({
      data: user[0],
      message: "user update photo",
    });

  } catch (err) {
    next(err);
  }

});

router.post('/userpreferences/:id',upload.fields([]),async (req, res, next) => {
  try {
    const { id } = req.params;
    const { zise, color, font, descargacomp, descargaunit, tema } = req.body;
    const iduserpreference = id;

    const newPreference = {
      zise,
      color,
      font,
      iduserpreference,
      descargacomp,
      descargaunit,
      tema
   };
  //  console.log(req.body);

    const existe = await pool.query('SELECT iduserpreference FROM heroku_97268bb8b0abec4.preferencias WHERE iduserpreference = ?', [id]);

    if (existe.length == 0 ){
      await pool.query('INSERT INTO heroku_97268bb8b0abec4.preferencias set ?', [newPreference]);
    }
    else{
      await pool.query('UPDATE heroku_97268bb8b0abec4.preferencias set ? WHERE iduserpreference = ?', [newPreference, id]);
      // console.log('aqui')
    }
    const preference = await pool.query('SELECT * FROM heroku_97268bb8b0abec4.preferencias WHERE iduserpreference = ?', [id]);

    console.log(preference);
    res.status(200).json({
      // data: preference,
      message: "preferences user"
    });

  } catch (err) {
    next(err);
  }

});

// router.post('/comment/:id', upload.fields([]), async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { url } = req.body;

//     await pool.query('UPDATE image FROM heroku_97268bb8b0abec4.user set ? WHERE id = ?', [url, id]);

//     res.status(200).json({
//       message: "user update photo",
//     });

//   } catch (err) {
//     next(err);
//   }

// });

router.post('/comment/:id', upload.fields([]), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { puntuacion, comentario } = req.body;

    const idusercomment = id;

    const comment = {
      puntuacion,
      comentario,
      idusercomment
   };

    await pool.query('INSERT INTO heroku_97268bb8b0abec4.comments set ?', [comment]);

    res.status(200).json({
      message: "user commented",
    });

  } catch (err) {
    next(err);
  }

});

module.exports = router