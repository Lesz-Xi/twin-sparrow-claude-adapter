import type { SkillHydrationRecord } from "../skills/skill-registry.js";

export const SKILL_GATE_CAPSULE_CLASS = "skill-gate";

const SKILL_GATES: Readonly<Record<string, readonly string[]>> = {
  "pearl-representation": [
    "/represent active.",
    "Required: raw situation, current representation, at least one alternative representation, operations analysis, invariant analysis, search-reduction judgment, recommendation, and verification.",
    "Do not use representation language as decoration; name what the representation makes cheap, hides, preserves, and loses.",
  ],
  "think-different": [
    "think-different active.",
    "Required: default representation, better representation, real object of design, relevant operations, cuts, integrations, experience claim, tradeoff, and next move.",
    "No persona imitation and no slogan without product consequence.",
  ],
  "oppus-reasoning-contract": [
    "oppus-reasoning-contract active.",
    "Required: define problem, extract/classify assumptions, reduce to fundamentals, rebuild under constraints, verify, and state claim boundaries.",
    "Respect claim ceiling; do not substitute polished prose for evidence.",
  ],
};

function unique(values: readonly string[]): readonly string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function aliasesToSkillName(text: string): readonly string[] {
  const names: string[] = [];
  if (text.includes("/represent") || text.includes("pearl-representation")) names.push("pearl-representation");
  if (text.includes("think-different")) names.push("think-different");
  if (text.includes("oppus-reasoning-contract") || text.includes("strict mode")) names.push("oppus-reasoning-contract");
  if (text.includes("architect-review")) names.push("architect-review");
  if (text.includes("expert-engineer")) names.push("expert-engineer");
  return names;
}

export function resolveSkillGates(promptText: string): readonly string[] {
  return unique(aliasesToSkillName(promptText.toLowerCase()));
}

export function resolveFullSkillHydrationRequests(promptText: string): readonly string[] {
  const text = promptText.toLowerCase();
  const fullRequested = /\b(full skill|hydrate full|full hydration|full-body|full body)\b/.test(text);
  if (!fullRequested) return [];

  const names: string[] = [...aliasesToSkillName(text)];
  for (const match of text.matchAll(/(?:full skill|hydrate full skill|hydrate full|full hydration for|full-body skill|full body skill)\s+([a-z0-9-]+)/g)) {
    const name = match[1];
    if (name && name !== "skill") names.push(name);
  }
  for (const match of text.matchAll(/\/skill:([a-z0-9-]+)/g)) {
    const name = match[1];
    if (name) names.push(name);
  }
  return unique(names);
}

function renderHydrationRecord(record: SkillHydrationRecord): readonly string[] {
  if (record.status === "blocked") {
    return [`Full hydration blocked for ${record.name}: ${record.reason ?? "unknown reason"}`];
  }

  return [
    `Full hydration loaded for ${record.name}: ${record.path ?? "unknown path"}`,
    `<skill name="${record.name}" location="${record.path ?? "unknown"}">`,
    record.content ?? "",
    "</skill>",
  ];
}

export function renderSkillGateCapsule(activeSkills: readonly string[], hydrationRecords: readonly SkillHydrationRecord[] = []): string {
  if (activeSkills.length === 0 && hydrationRecords.length === 0) return "";
  const sections = activeSkills.flatMap((skill) => {
    const gate = SKILL_GATES[skill];
    if (!gate) {
      return [`Skill ${skill}: active but no local gate summary is available; full hydration is required and must pass the allowlist.`];
    }
    return gate;
  });
  const hydrationSections = hydrationRecords.flatMap(renderHydrationRecord);
  return [
    "━━━ TWIN-SPARROW SKILL GATE CAPSULE ━━━",
    ...sections,
    ...hydrationSections,
    "━━━ END TWIN-SPARROW SKILL GATE CAPSULE ━━━",
  ].join("\n");
}
