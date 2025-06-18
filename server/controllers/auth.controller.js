const db = require('../database');
const bcrypt = require('bcryptjs');

// Función para registrar un nuevo usuario
const signup = (req, res) => {
  const { username, email, password, role } = req.body;
  
  // Validación básica
  if (!username || !email || !password) {
    return res.status(400).send({ message: 'Username, email, and password are required!' });
  }

  // Verificar si el usuario ya existe
  db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], (err, user) => {
    if (err) {
      return res.status(500).send({ message: 'Error checking user existence' });
    }
    
    if (user) {
      return res.status(400).send({ 
        message: 'Failed! Username or email is already in use!' 
      });
    }

    // Crear nuevo usuario
    const hashedPassword = bcrypt.hashSync(password, 8);
    
    db.run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role || 'user'],
      function(err) {
        if (err) {
          return res.status(500).send({ message: err.message });
        }
        
        res.send({ message: 'User was registered successfully!' });
      }
    );
  });
};

// Función para iniciar sesión
const signin = (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).send({ message: 'Error finding user' });
    }

    if (!user) {
      return res.status(404).send({ message: 'User Not found.' });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        message: 'Invalid Password!',
      });
    }

    res.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  });
};

module.exports = {
  signup,
  signin,
};
