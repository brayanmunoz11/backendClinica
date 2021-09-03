const express = require('express');
const router = express.Router();

const pool = require('../database');
const helpers = require('../lib/helpers');

let multer = require('multer');
let upload = multer();


const binarysearch = require ('../services/binarysearch');
const Queue = require('../services/colas');

const quicksort = require('../services/quicksort')

const heapSort = require('../services/heapsort')




router.post('/createCita', async (req, res, next) => {
  const { idDoctor, idPaciente, fecha, turno, especialidad } = req.body
  console.log(req.body)
  const newCita = {
    idDoctor,
    idPaciente,
    fecha,
    turno,
    especialidad
  }

  try {
    const citas = await pool.query('INSERT INTO heroku_97268bb8b0abec4.citas SET ?', [newCita]);
    res.status(200).json({
      msg: 'cita creada'
    });
  }
  catch (err) {
    next(err);
  }
});

router.get('/citaDoctor/:iddoc', async (req, res, next) => {
  const { iddoc } = req.params

  try {
    const citas = await pool.query('CALL heroku_97268bb8b0abec4.todasCitas(?)', [iddoc]);
    res.status(200).json({
      citas: citas[0]
    });
  }
  catch (err) {
    next(err);
  }
});

router.get('/terminarCita/:idCita', async (req, res, next) => {
  const { idCita } = req.params

  try {
    await pool.query('UPDATE heroku_97268bb8b0abec4.citas set ? WHERE idCita = ?', [{ estado: 'terminada' }, idCita]);
    res.status(200).json({
      msg: 'cita terminada'
    });
  }
  catch (err) {
    next(err);
  }
});

router.get('/listarDoctores/:especialidad/:turno', async (req, res, next) => {
  const { especialidad, turno } = req.params
  console.log({ especialidad, turno })
  try {
    const doctores = await pool.query('SELECT u.id as idDoc, u.nombre, u.apellidoP, u.apellidoM, d.turno from heroku_97268bb8b0abec4.doctores as d JOIN heroku_97268bb8b0abec4.user as u on d.idUsuario = u.id WHERE d.especialidad = ? and d.turno = ?', [especialidad, turno]);
    res.status(200).json({
      doctores
    });
  }
  catch (err) {
    next(err);
  }
});

router.get('/citasUser/:iduser', async (req, res, next) => {
  const { iduser } = req.params

  try {
    const citasPro = await pool.query('CALL heroku_97268bb8b0abec4.listarCitasUsuario(?,?)', [iduser, 'programada']);
    const citasTer = await pool.query('CALL heroku_97268bb8b0abec4.listarCitasUsuario(?,?)', [iduser, 'terminada']);
    res.status(200).json({
      citasPro: citasPro[0],
      citasTer: citasTer[0]
    });
  }
  catch (err) {
    next(err);
  }
});


router.get('/listarPacientes', async (req, res, next) => {
  try {
    const pacientes = await pool.query('CALL heroku_97268bb8b0abec4.listarPacientes()');
    res.status(200).json({
      pacientes: pacientes[0]
    });
  }
  catch (err) {
    next(err);
  }
});
router.get('/listarCamas', async (req, res, next) => {
  try {
    const camas = await pool.query('CALL heroku_97268bb8b0abec4.listarCamas()');
    const newcamas = await pool.query('SELECT * from camas where idUsuario IS NULL');
    // camas[0].concat(newcamas)
    var newc
    if(newcamas.length > 0) {
      newc = [...camas[0], newcamas[0]]
    }else {
      newc = [...camas[0]]
    }
    res.status(200).json({
      camas: newc
    });
  }
  catch (err) {
    next(err);
  }
});

router.get('/listarDoctores', async (req, res, next) => {
  try {
    const doctores = await pool.query('CALL heroku_97268bb8b0abec4.listarDoctores()');
    res.status(200).json({
      doctores: doctores[0]
    });
  }
  catch (err) {
    next(err);
  }
});

router.get('/listarFamiliares/:iduser', async (req, res, next) => {
  const {iduser} = req.params;
  try {
    const familiares = await pool.query('SELECT * from familiares WHERE idUsuario = ?', [iduser]);
    res.status(200).json({
      familiares: familiares
    });
  }
  catch (err) {
    next(err);
  }
});

router.get('/infoPaciente/:dni', async (req, res, next) => {
  const {dni} = req.params;
  let usuario = []
  try {
    const userType = await pool.query('SELECT tipoUsuario FROM user WHERE dni = ?', [dni]);

    // const usuario = await pool.query('SELECT u.id, u.nombre, u.apellidoP, u.apellidoM, u.dni, u.email, u.image, u.password, u.tipoUsuario, u.direccion, u.fechanac, p.sexo, p.vigencia, p.tipoSeguro, p.centro FROM user as u join pacientes as p on u.id = p.idUsuario WHERE u.dni = ?', [dni]);

    if (userType.length > 0) {
      const type = userType[0].tipoUsuario
      if (type === 'paciente') {
        usuario = await pool.query('SELECT u.id, u.nombre, u.apellidoP, u.apellidoM, u.dni, u.email, u.image, u.password, u.tipoUsuario, u.direccion, u.fechanac, p.sexo, p.vigencia, p.tipoSeguro, p.centro FROM user as u join pacientes as p on u.id = p.idUsuario WHERE u.dni = ?', [dni]);
      } else if (type === 'doctor') {
        usuario = await pool.query('SELECT u.id, u.nombre, u.apellidoP, u.apellidoM, u.dni, u.email, u.image, u.password, u.tipoUsuario, u.direccion, u.fechanac, d.sexo, d.especialidad, d.turno FROM user as u join doctores as d on u.id = d.idUsuario WHERE u.dni = ?', [dni]);
      }
    } else {
      res.status(200).json({
        msg: 'nada'
      });
    }

    const familiares = await pool.query('SELECT * from familiares WHERE idUsuario = ?', [usuario[0].id]);
    delete usuario[0]['password']
    res.status(200).json({
      usuario: usuario[0],
      familiares: familiares
    });
  }
  catch (err) {
    next(err);
  }
});


router.get('/ordenarcitas/:iddoc', async (req, res, next) => {
  
  const {iddoc} = req.params;
  try {
    const citas = await pool.query('select u.nombre, u.apellidoP, c.idCita, c.fecha, c.turno, c.estado, c.especialidad  from citas c inner join user u on c.idPaciente = u.id Where idDoctor = ?', [iddoc]);

   
    console.time('QuickSort');
    quicksort(citas,0,citas.length-1)
    console.timeEnd('QuickSort');

    res.status(200).json({
      citas
    });
  }
  
  catch (err) {
    next(err);
  }
  
});

router.post('/buscarpaciente/:iddoc', async (req, res, next) => {
  
  const {iddoc} = req.params;
  const {nombre} = req.body;
 
  console.log(req.body)
  try {
    const citas = await pool.query('select u.nombre, u.apellidoP, c.idCita, c.fecha, c.turno, c.estado, c.especialidad  from citas c inner join user u on c.idPaciente = u.id Where idDoctor = ?', [iddoc]);
    
    console.time('Binary Search + QuickSort');
    quicksort(citas,0,citas.length-1)
    

    //console.log(citas)


    const fin = citas.length
    const b = binarysearch(citas,nombre,0,fin)

    console.timeEnd('Binary Search + QuickSort');
 

    res.status(200).json({
      b
    });
  }
  catch (err) {
    next(err);
  }
  
});


router.post('/queue/:iddoc', async (req, res, next) => {
  const {iddoc} = req.params;
  const {nombre} = req.body;
 
  console.log(req.body)
  try {
    const citas = await pool.query('select u.nombre, u.apellidoP, c.idCita, c.fecha, c.turno, c.estado, c.especialidad  from citas c inner join user u on c.idPaciente = u.id Where idDoctor = ?', [iddoc]);
    
    const queue = new Queue()

    for(i=0; i< citas.length;i++){
      queue.enqueue(citas[i])
    }
    console.log(queue)

    res.status(200).json({
      queue
    });
  }
  catch (err) {
    next(err);
  }
});



module.exports = router
