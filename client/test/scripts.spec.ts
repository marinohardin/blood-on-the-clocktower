import {
  ALL_ROLES_SCRIPT,
  FABLED,
  getCharacter,
  getScript,
  getScriptNames,
  type Role,
  type ScriptDefinitionLike,
  type ScriptName,
  SCRIPTS,
  UNASSIGNED,
} from "@hidden-identity/shared";
import { describe, expect, test } from "vitest";

describe("scripts", () => {
  test("requested scripts are selectable", () => {
    const requested: ScriptName[] = [
      "The Midnight Oasis",
      "Trouble with Violets",
      "Late Night Drive By",
      "Laissez un Faire",
      "Whose Cult Is It Anyway?",
      "I'm the Main Character",
      "No Roles Barred",
      "Trust",
    ];
    const names = getScriptNames();

    requested.forEach((name) => {
      expect(names.filter((available) => available === name)).toHaveLength(1);
      expect(getScript(name)).toEqual(
        SCRIPTS.find((script) => script.name === name)?.characters,
      );
    });
  });

  describe("characters", () => {
    describe.each([...SCRIPTS, ALL_ROLES_SCRIPT])(
      "character: $name",
      (script: ScriptDefinitionLike<string>) => {
        test("all characters are valid", () => {
          const fabledIds = new Set(FABLED.map((f) => f.id));
          const missing = script.characters.filter(({ id }) => {
            const character = getCharacter(id as Role);
            if (fabledIds.has(id)) {
              return false;
            }
            if (!character || character.name === UNASSIGNED.name) {
              return true;
            }

            return false;
          });
          expect(missing).toHaveLength(0);
        });
      },
    );
  });
});
