import { existsSync } from "node:fs";
import { resolve } from "node:path";

import {
  allCharactersList,
  getCharacter,
  type Role,
} from "@hidden-identity/shared";
import { describe, expect, test } from "vitest";

const experimentalRoles = [
  ["alsaahir", "Alsaahir"],
  ["banshee", "Banshee"],
  ["highpriestess", "High Priestess"],
  ["knight", "Knight"],
  ["shugenja", "Shugenja"],
  ["steward", "Steward"],
  ["villageidiot", "Village Idiot"],
  ["hatter", "Hatter"],
  ["ogre", "Ogre"],
  ["zealot", "Zealot"],
  ["plaguedoctor", "Plague Doctor"],
  ["boffin", "Boffin"],
  ["harpy", "Harpy"],
  ["organgrinder", "Organ Grinder"],
  ["summoner", "Summoner"],
  ["vizier", "Vizier"],
  ["wizard", "Wizard"],
  ["xaan", "Xaan"],
  ["gnome", "Gnome"],
  ["ojo", "Ojo"],
  ["yaggababble", "Yaggababble"],
  ["lordoftyphon", "Lord of Typhon"],
  ["kazali", "Kazali"],
  ["alhadikhia", "Al-Hadikhia"],
] as const;

describe("characterData", () => {
  describe("experimental roles added in #293", () => {
    test.each(experimentalRoles)(
      "%s has the canonical name and a local icon",
      (id, name) => {
        const character = getCharacter(id as Role);
        expect(character.name).toBe(name);
        expect(
          existsSync(resolve("src/assets/icon/role", character.imageSrc)),
        ).toBe(true);
      },
    );

    test("night actions match the role abilities", () => {
      expect(getCharacter("summoner" as Role)).toMatchObject({
        setup: true,
      });
      expect(
        getCharacter("summoner" as Role).firstNight?.playerMessage,
      ).toBeUndefined();
      expect(getCharacter("banshee" as Role).setupReminders).toBeUndefined();
      expect(getCharacter("xaan" as Role).firstNight?.setReminders).toContain(
        "xaan poisoned",
      );
      expect(
        getCharacter("alhadikhia" as Role).otherNight?.reminder,
      ).not.toContain("Ojo");
      expect(getCharacter("wizard" as Role).firstNight).toMatchObject({
        reminder: expect.stringContaining("When the Wizard makes a wish"),
        order: 70,
      });
      expect(
        getCharacter("villageidiot" as Role).firstNight?.playerMessage,
      ).toBeUndefined();
      expect(
        getCharacter("ogre" as Role).firstNight?.playerMessage,
      ).toBeUndefined();
      expect(getCharacter("hatter" as Role).otherNight?.kills).toBeUndefined();
      expect(
        getCharacter("plaguedoctor" as Role).otherNight?.kills,
      ).toBeUndefined();
    });
  });

  describe("reminders", () => {
    test("no two characters have the same reminder name", () => {
      const seenSet = new Set<string>();
      const duplicates = allCharactersList()
        .flatMap(({ reminders }) => reminders)
        .filter((reminder) => {
          if (seenSet.has(reminder.name)) {
            return true;
          } else {
            seenSet.add(reminder.name);
            return false;
          }
        });
      expect(duplicates).toEqual([]);
    });
    describe.each(allCharactersList())("character: $name", (character) => {
      test("has only defined reminders", () => {
        const reminderNames = character.reminders.map(({ name }) => name);
        const allReminderReferences = [
          ...(character.firstNight?.setReminders || []),
          ...(character.otherNight?.setReminders || []),
        ];

        expect(
          allReminderReferences.filter((name) => !reminderNames.includes(name)),
        ).toHaveLength(0);
      });
    });
  });
});
