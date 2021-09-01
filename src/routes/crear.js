const express = require('express');
const router = express.Router();

const pool = require('../database');

const helpers = require('../lib/helpers');
let multer = require('multer');
let upload = multer();

router.post('/crearDoctor', upload.fields([]), async (req, res, next) => {
  try {
    const { nombre, apellidoP, apellidoM, dni, sexo, direccion, fechanac, especialidad, turno, correo, password } = req.body;
    const passwordencriptado = await helpers.encryptPassword(password);
    const newDoctor = {
      nombre,
      apellidoP,
      apellidoM,
      dni,
      sexo,
      especialidad,
      turno,
      correo,
      contrasena: passwordencriptado,
      tipoUsuario: 'doctor',
      direccion,
      fechanac
    }
    await pool.query('CALL heroku_97268bb8b0abec4.crearDoctor(?)', [Object.values(newDoctor)]);
    const doctores = await pool.query('CALL heroku_97268bb8b0abec4.listarDoctores()');
    res.status(201).json({
      doctores: doctores[0],
      msg: 'Doctor creado'
    });
  } catch (err) {
    const doctores = await pool.query('CALL heroku_97268bb8b0abec4.listarDoctores()');
    let message = ''
    if (err.sqlMessage.includes('usuario_UNIQUE')) {
      message = 'El DNI ya esta registrado, ingrese uno valido'
    } else if (err.sqlMessage.includes('email_UNIQUE')) {
      message = 'El Email ya esta registrado, ingrese uno valido'
    }
    res.status(201).json({
      doctores: doctores[0],
      msg: message
    });
    next(err);
  }
});
router.post('/crearPaciente', upload.fields([]), async (req, res, next) => {
  try {
    console.log(req.body)
    const { nombre, apellidoP, apellidoM, dni, sexo, direccion, fechanac, vigencia, tipoSeguro, correo, password, centro } = req.body;
    const passwordencriptado = await helpers.encryptPassword(password);
    const newPaciente = {
      nombre,
      apellidoP,
      apellidoM,
      dni,
      sexo,
      vigencia,
      tipoSeguro,
      correo,
      contrasena: passwordencriptado,
      tipoUsuario: 'paciente',
      centro,
      direccion,
      fechanac
    }
    await pool.query('CALL heroku_97268bb8b0abec4.crearPaciente(?)', [Object.values(newPaciente)]);
    const pacientes = await pool.query('CALL heroku_97268bb8b0abec4.listarPacientes()');

    res.status(201).json({
      paciente: pacientes[0],
      msg: 'Paciente creado'
    });
  } catch (err) {
    const pacientes = await pool.query('CALL heroku_97268bb8b0abec4.listarPacientes()');
    let message = ''
    if (err.sqlMessage.includes('usuario_UNIQUE')) {
      message = 'El DNI ya esta registrado, ingrese uno valido'
    } else if (err.sqlMessage.includes('email_UNIQUE')) {
      message = 'El Email ya esta registrado, ingrese uno valido'
    }
    res.status(201).json({
      paciente: pacientes[0],
      msg: message
    });
    next(err);
  }
});
router.post('/crearCama', upload.fields([]), async (req, res, next) => {
  try {
    console.log(req.body)
    const { sala, paciente } = req.body

    const newCama = {
      sala,
      estado: 'Ocupada',
      idUsuario: paciente
    }
    await pool.query('CALL heroku_97268bb8b0abec4.crearCama(?)', [Object.values(newCama)]);
    const camas = await pool.query('CALL heroku_97268bb8b0abec4.listarCamas()');

    res.status(201).json({
      camas: camas[0],
      msg: 'Cama creado'
    });
  } catch (err) {
    next(err);
  }
});

router.post('/editarCama', upload.fields([]), async (req, res, next) => {
  try {
    const { id, sala, paciente: idUsuario } = req.body
    console.log(req.body)
    const newCama = {
      sala,
      estado: (idUsuario === 'Sin paciente') ? 'Desocupada' : 'Ocupada',
      idUsuario: (idUsuario === 'Sin paciente') ? null : idUsuario
    }
    // console.log({ idCama, sala, idUsuario })
    await pool.query('UPDATE camas set ? where idcamas = ?', [newCama, id]);
    const camas = await pool.query('CALL heroku_97268bb8b0abec4.listarCamas()');

    const newcamas = await pool.query('SELECT * from camas where idUsuario IS NULL');
    // camas[0].concat(newcamas)
    var newc
    if(newcamas.length > 0) {
      newc = [...camas[0], newcamas[0]]
    }else {
      newc = [...camas[0]]
    }
    res.status(201).json({
      data: newc,
      msg: 'Cama editada'
    });
  } catch (err) {
    next(err);
  }
});

router.post('/editarPaciente', upload.fields([]), async (req, res, next) => {
  try {
    const { id, correo, centro, vigencia } = req.body
    const userEdit = {
      email: correo,
    }
    const pacienteEdit = {
      vigencia: vigencia,
      centro: centro
    }

    await pool.query('UPDATE user set ? where id = ?', [userEdit, id]);
    await pool.query('UPDATE pacientes set ? where idUsuario = ?', [pacienteEdit, id]);
    const data = await pool.query('CALL heroku_97268bb8b0abec4.listarPacientes()');

    res.status(201).json({
      data: data[0],
      msg: 'Paciente editada'
    });
  } catch (err) {
    next(err);
  }
});

router.post('/editarPersonal', upload.fields([]), async (req, res, next) => {
  try {
    const { id, correo, turno } = req.body
    const userEdit = {
      email: correo,
    }
    const personalEdit = {
      turno: turno
    }

    await pool.query('UPDATE user set ? where id = ?', [userEdit, id]);
    await pool.query('UPDATE doctores set ? where idUsuario = ?', [personalEdit, id]);
    const data = await pool.query('CALL heroku_97268bb8b0abec4.listarDoctores()');

    console.log(req.body)
    res.status(201).json({
      data: data[0],
      msg: 'Paciente editada'
    });
  } catch (err) {
    next(err);
  }
});
router.get('/deletecama/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    console.log(id)
    await pool.query('DELETE FROM camas WHERE idcamas = ?', [id]);

    res.status(201).json({
      msg: 'cama eliminada'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router