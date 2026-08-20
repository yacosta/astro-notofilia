/**
 * Build public/.well-known/agent-skills/index.json (Agent Skills Discovery RFC v0.2.0).
 *
 * Source of truth: public/.well-known/agent-skills/<name>/SKILL.md
 * (YAML frontmatter must include name + description). SHA-256 is computed from
 * the file's raw bytes so the digest matches what the CDN serves.
 *
 * Wired into prebuild.
 */
import { createHash } from 'node:crypto';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS_DIR = path.join(ROOT, 'public/.well-known/agent-skills');
const INDEX_PATH = path.join(SKILLS_DIR, 'index.json');
const SCHEMA = 'https://schemas.agentskills.io/discovery/0.2.0/schema.json';
const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: source };
  const data = {};
  const lines = match[1].split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    data[kv[1]] = value;
  }
  return { data, body: match[2] };
}

function sha256Hex(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function fail(message) {
  throw new Error(`[agent-skills] ${message}`);
}

const entries = await readdir(SKILLS_DIR, { withFileTypes: true });
const skills = [];

for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  const name = entry.name;
  const skillFile = path.join(SKILLS_DIR, name, 'SKILL.md');
  let fileStat;
  try {
    fileStat = await stat(skillFile);
  } catch {
    fail(`${name}/SKILL.md missing`);
  }
  if (!fileStat.isFile()) fail(`${name}/SKILL.md is not a file`);

  const bytes = await readFile(skillFile);
  const text = bytes.toString('utf8');
  const { data } = parseFrontmatter(text);

  if (!data.name) fail(`${name}/SKILL.md missing frontmatter name`);
  if (data.name !== name) {
    fail(`${name}/SKILL.md frontmatter name "${data.name}" must match directory name`);
  }
  if (!NAME_RE.test(data.name) || data.name.length > 64) {
    fail(`${name}: invalid skill name "${data.name}"`);
  }
  if (!data.description) fail(`${name}/SKILL.md missing frontmatter description`);
  if (data.description.length > 1024) {
    fail(`${name}: description exceeds 1024 characters`);
  }

  skills.push({
    name: data.name,
    type: 'skill-md',
    description: data.description,
    url: `/.well-known/agent-skills/${data.name}/SKILL.md`,
    digest: `sha256:${sha256Hex(bytes)}`,
  });
}

if (skills.length === 0) fail('no SKILL.md files found');

skills.sort((a, b) => a.name.localeCompare(b.name));

const index = {
  $schema: SCHEMA,
  skills,
};

const serialized = `${JSON.stringify(index, null, 2)}\n`;
await writeFile(INDEX_PATH, serialized, 'utf8');

console.log(
  `[agent-skills] indexed ${skills.length} skill(s) → /.well-known/agent-skills/index.json`,
);
for (const skill of skills) {
  console.log(`  - ${skill.name} ${skill.digest}`);
}
