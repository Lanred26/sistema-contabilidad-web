const fs = require('node:fs');
const path = require('node:path');
test.each(['services', 'controllers', 'middlewares'])('la capa %s no accede directamente a MySQL', (layer) => {
  const dir = path.join(__dirname, '..', 'src', layer);
  for (const file of fs.readdirSync(dir).filter((name) => name.endsWith('.js'))) {
    const source = fs.readFileSync(path.join(dir, file), 'utf8');
    expect(source, file).not.toMatch(/require\(['"][^'"]*(?:config\/database|models|sequelize|mysql2)/);
    expect(source, file).not.toMatch(/\.(?:execute|query|getConnection|findAll|findOne|bulkCreate)\s*\(/);
  }
});
