const jwt = require('jsonwebtoken');

module.exports = function verificarToken(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: 'Token requerido' });

  const token = header.split(' ')[1]; // formato: "Bearer <token>"
  if (!token) return res.status(401).json({ error: 'Token inválido' });

  try {
    const secret = process.env.JWT_SECRET || 'secret_de_desarrollo_por_defecto_211';
    req.usuario = jwt.verify(token, secret);
    next();
  } catch {
    return res.status(401).json({ error: 'Token expirado o inválido' });
  }
};
