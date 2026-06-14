const jwt = require('jsonwebtoken');

module.exports = function verificarToken(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: 'Token requerido' });

  const token = header.split(' ')[1]; // formato: "Bearer <token>"
  if (!token) return res.status(401).json({ error: 'Token inválido' });

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token expirado o inválido' });
  }
};
