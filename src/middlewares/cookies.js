module.exports = (req, _res, next) => {
  const header = req.headers.cookie || '';
  req.cookies = Object.fromEntries(header.split(';').map((part) => part.trim()).filter(Boolean).map((part) => {
    const separator = part.indexOf('=');
    const key = part.slice(0, separator);
    const value = part.slice(separator + 1);
    try { return [key, decodeURIComponent(value)]; } catch { return [key, '']; }
  }));
  next();
};
