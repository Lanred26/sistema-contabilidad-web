const windows = new Map();
module.exports = (req, res, next) => {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  let window = windows.get(key);
  if (!window || window.until <= now) window = { count: 0, until: now + 15 * 60 * 1000 };
  window.count += 1;
  windows.set(key, window);
  if (windows.size > 10000) for (const [address, item] of windows) if (item.until <= now) windows.delete(address);
  res.setHeader('RateLimit-Limit', '10');
  res.setHeader('RateLimit-Remaining', String(Math.max(0, 10 - window.count)));
  if (window.count > 10) return res.status(429).json({ code: 'LOGIN_RATE_LIMITED', message: 'Demasiados intentos. Intenta más tarde.', requestId: req.requestId });
  next();
};
