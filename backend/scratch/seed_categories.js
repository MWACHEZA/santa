const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const cats = [
  { name: 'Monthly Subscriptions', desc: 'Regular monthly member subscriptions' },
  { name: 'Building Fund', desc: 'Church construction and maintenance' },
  { name: 'Donations', desc: 'General parish donations' },
  { name: 'Offertory Collection', desc: 'Sunday offertory collections' },
  { name: 'Special Collection', desc: 'Special purpose collections' },
  { name: 'Catering & Events', desc: 'Food and event expenses' },
  { name: 'Stationery', desc: 'Office supplies and printing' },
  { name: 'Utilities', desc: 'Water, electricity and other utilities' },
  { name: 'Maintenance & Repairs', desc: 'Building and equipment maintenance' },
  { name: 'Charitable Giving', desc: 'Outreach and charitable expenses' },
];

(async () => {
  for (const c of cats) {
    try {
      await db.execute(
        'INSERT INTO categories (id, name, type, description, is_active) VALUES (?, ?, ?, ?, true) ON CONFLICT (name, type) DO NOTHING',
        [uuidv4(), c.name, 'financial', c.desc]
      );
      console.log('Seeded:', c.name);
    } catch(e) {
      console.log('Skip:', c.name, e.message);
    }
  }
  console.log('Done!');
  process.exit();
})();
