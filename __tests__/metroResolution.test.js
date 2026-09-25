/* eslint-env jest, node */
/**
 * Regression guard for a device-only crash (Quarter Mile lobby, "undefined is
 * not a function" in formatQuarterMileScore): Metro resolves extensionless
 * imports in the order js, jsx, json, ts, tsx, so `foo.json` next to `foo.ts`
 * silently replaces the TS module on device, while Jest and tsc prefer .ts.
 */
const fs = require('fs');
const path = require('path');

describe('Metro module resolution', () => {
  it('has no .json file shadowing a same-named source module in src/', () => {
    const root = path.resolve(__dirname, '../src');
    const clashes = [];
    const walk = dir => {
      fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (entry.name.endsWith('.json')) {
          const base = full.slice(0, -'.json'.length);
          ['.ts', '.tsx'].forEach(ext => {
            if (fs.existsSync(base + ext)) {
              clashes.push(path.relative(root, full));
            }
          });
        }
      });
    };
    walk(root);
    expect(clashes).toEqual([]);
  });
});
