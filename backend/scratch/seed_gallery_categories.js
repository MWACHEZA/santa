const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const cats = [
  { name: 'Mass & Liturgy', desc: 'Photos from liturgical celebrations and mass' },
  { name: 'Parish Events', desc: 'Photos from parish gatherings and events' },
  { name: 'Youth Group', desc: 'Activities and events for parish youth' },
  { name: 'Parish Choir', desc: 'Choir rehearsals and performances' },
  { name: 'Community Outreach', desc: 'Parish charitable and outreach activities' },
];

(async () => {
  try {
    // Ensure gallery type exists in enum
    await db.execute("ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'gallery'");
    console.log('Ensured gallery type exists in enum');
  } catch (e) {
    console.log('Note: ALTER TYPE failed (might already exist or not supported):', e.message);
  }

  for (const c of cats) {
    try {
      await db.execute(
        'INSERT INTO categories (id, name, type, description, is_active) VALUES (?, ?, ?, ?, true) ON CONFLICT (name, type) DO NOTHING',
        [uuidv4(), c.name, 'gallery', c.desc]
      );
      console.log('Seeded Gallery Category:', c.name);
    } catch(e) {
      console.log('Skip:', c.name, e.message);
    }
  }
  console.log('Done seeding gallery categories!');
  process.exit();
})();
