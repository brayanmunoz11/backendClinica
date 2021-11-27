const pool = require('../database');
const helpers = require('../lib/helpers');
class UserServices {
  constructor() {

  }

  async getUser(user) {
    var message = 'Usuario no existe';
    var users = {};
    var valid = false;
    var usuario = []
    let familiares = []

    const userType = await pool.query('SELECT tipoUsuario FROM user WHERE dni = ?', [user.dni]);

    if (userType.length > 0) {
      const type = userType[0].tipoUsuario
      if (type === 'paciente') {
        usuario = await pool.query('SELECT u.id, u.nombre, u.apellidoP, u.apellidoM, u.dni, u.email, u.image, u.password, u.tipoUsuario, u.direccion, u.fechanac, p.sexo, p.vigencia, p.tipoSeguro, p.centro FROM user as u join pacientes as p on u.id = p.idUsuario WHERE u.dni = ?', [user.dni]);
      } else if (type === 'doctor') {
        usuario = await pool.query('SELECT u.id, u.nombre, u.apellidoP, u.apellidoM, u.dni, u.email, u.image, u.password, u.tipoUsuario, u.direccion, u.fechanac, d.sexo, d.especialidad, d.turno FROM user as u join doctores as d on u.id = d.idUsuario WHERE u.dni = ?', [user.dni]);
      } else if (type === 'administrador') {
        usuario = await pool.query('SELECT id, nombre, apellidoP, apellidoM, dni, email, image, password, tipoUsuario FROM user WHERE dni = ?', [user.dni]);
      }
    } else {
      return [users, message, valid, familiares]
    }

    const user1 = usuario[0];
    const validPassword = await helpers.matchPassword(user.password, user1.password)
    delete user1['password']
    familiares = await pool.query('SELECT * from familiares WHERE idUsuario = ?', [user1.id]);
    if (validPassword) {
      users = user1;
      message = 'usario logeado';
      valid = true;
    } else {
      message = 'Password incorrecto';
    }
    return [users, message, valid, familiares]
  }
  async createUser(user) {
    console.log(user);
    let userF = []
    let message = 'user created'
    let newUser = {
      nombre: user.nombre,
      apellidoP: user.apellidoP,
      apellidoM: user.apellidoM,
      dni: user.dni,
      sexo: user.sexo,
      correo: user.correo,
      contrasena: user.contrasena,
      tipoUsuario: user.tipoUsuario,
      vigencia: user.vigencia,
      direccion: user.direccion,
      fechanac: user.fechanac
    }
    newUser.contrasena = user.contrasena;
    console.log(newUser.contrasena)
    try {
      await pool.query('CALL heroku_97268bb8b0abec4.registrarPaciente(?) ', [Object.values(newUser)]);
      userF = await pool.query('SELECT u.id, u.nombre, u.apellidoP, u.apellidoM, u.dni, u.email, u.image, u.password, u.tipoUsuario, u.direccion, u.fechanac, p.sexo, p.vigencia, p.tipoSeguro, p.centro FROM user as u join pacientes as p on u.id = p.idUsuario WHERE u.dni = ?', [newUser.dni]);
    } catch (err) {
      if (err.sqlMessage.includes('usuario_UNIQUE')) {
        message = 'El DNI ya esta registrado, ingrese uno valido'
      } else if (err.sqlMessage.includes('email_UNIQUE')) {
        message = 'El Email ya esta registrado, ingrese uno valido'
      }
      console.log(err.sqlMessage);
    }

    return { user: userF[0], message }
  }

  async createPreferences(user) {
    let newprefe = {
      color: "#000000",
      zise: "16px",
      descargacomp: 1,
      descargaunit: 1,
      tema: 0,
      iduserpreference: user.id
    }
    await pool.query('INSERT INTO heroku_97268bb8b0abec4.preferencias SET ? ', newprefe);

    let userP = await pool.query('SELECT * FROM heroku_97268bb8b0abec4.preferencias WHERE iduserpreference = ?', [user.id]);
    return { userP: userP[0] }
  }

  async getPreferences(id) {
    let preferences = {}
    try {
      preferences = await pool.query('SELECT * FROM heroku_97268bb8b0abec4.preferencias WHERE iduserpreference = ?', [id]);

    } catch (err) {
      next(err);
    }
    return { preferences: preferences[0] }
  }
}
module.exports = UserServices;