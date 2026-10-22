export function adapter(db) {
  function statement(sql, values = []) {
    return {
      bind(...next) { return statement(sql, next); },
      async first() { return db.prepare(sql).get(...values) || null; },
      async all() { return { results: db.prepare(sql).all(...values) }; },
      async run() { const result = db.prepare(sql).run(...values); return { meta: { changes: Number(result.changes) } }; }
    };
  }
  return {
    prepare(sql) { return statement(sql); },
    async batch(items) {
      db.exec('BEGIN');
      try { const results = []; for (const item of items) results.push(await item.run()); db.exec('COMMIT'); return results; }
      catch (error) { db.exec('ROLLBACK'); throw error; }
    }
  };
}
