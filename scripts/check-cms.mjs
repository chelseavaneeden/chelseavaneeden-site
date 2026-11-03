#!/usr/bin/env node
/*
 * CMS check: runs before every build, so the editor and the site can't drift apart.
 *
 * Pages CMS only knows the fields listed in .pages.yml, and when Chelsea saves a file it deletes anything
 * else in that file. It also refuses to save a file with a required field missing, or shows a blank for
 * a choice it doesn't recognise. So this stops the build if:
 *   - a content file has no section in the editor,
 *   - a file holds something the editor doesn't list (the next save would delete it),
 *   - a required field is empty (the next save would be refused),
 *   - a choice isn't one of the editor's options.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const root = fileURLToPath(new URL('..', import.meta.url));
const contentDir = join(root, 'src/content');
const problems = [];

const filesIn = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? filesIn(join(dir, e.name)) : [join(dir, e.name)]));

const read = (file) => {
  const raw = readFileSync(file, 'utf8');
  if (!file.endsWith('.md')) return parse(raw);
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw);
  return match ? { ...parse(match[1]), body: match[2] } : { body: raw };
};

const isEmpty = (value) => value === undefined || value === null || value === '';
const optionsOf = (field) => (field.options?.values ?? []).map((o) => (typeof o === 'object' ? o.value : o));

const checkField = (value, field, where) => {
  if (field.type === 'select' && !isEmpty(value)) {
    const allowed = optionsOf(field);
    for (const choice of Array.isArray(value) ? value : [value]) {
      if (!allowed.includes(choice)) problems.push(`${where}: "${choice}" isn't one of the editor's choices (${allowed.join(', ')})`);
    }
  }
  if (field.type === 'object' && value && typeof value === 'object') checkFields(value, field.fields ?? [], where);
};

const checkFields = (data, fields, where) => {
  const listed = new Set(fields.map((f) => f.name));
  for (const key of Object.keys(data)) {
    if (!listed.has(key)) problems.push(`${where}.${key}: not listed in .pages.yml, so the next save in the editor would delete it`);
  }
  for (const field of fields) {
    const value = data[field.name];
    const path = `${where}.${field.name}`;
    const missing = isEmpty(value) || (field.list && Array.isArray(value) && value.length === 0);
    if (field.required && missing) {
      problems.push(`${path}: required in the editor but empty, so the next save would be refused`);
      continue;
    }
    if (isEmpty(value)) continue;
    if (field.list && Array.isArray(value)) value.forEach((item, i) => checkField(item, field, `${path}[${i}]`));
    else checkField(value, field, path);
  }
};

const cms = parse(readFileSync(join(root, '.pages.yml'), 'utf8'));
const covered = new Set();

for (const section of cms.content) {
  const target = join(root, section.path);
  if (!existsSync(target)) {
    problems.push(`${section.path}: the "${section.label}" section points to a file or folder that doesn't exist`);
    continue;
  }
  const files = section.type === 'file' ? [target] : filesIn(target);
  for (const file of files) {
    covered.add(file);
    const name = relative(root, file);
    checkFields(read(file) ?? {}, section.fields ?? [], name);
  }
}

for (const file of filesIn(contentDir)) {
  if (!covered.has(file)) problems.push(`${relative(root, file)}: has no section in the editor (.pages.yml)`);
}

if (problems.length > 0) {
  console.error(`\n✖ The editor (.pages.yml) and the content files don't match:\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  console.error('\nFix the file or add the field to .pages.yml (and src/content.config.ts).\n');
  process.exit(1);
}

console.log('✓ Editor and content files match.');
