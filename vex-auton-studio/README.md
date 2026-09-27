# VEX Auton Studio — Game Layer (v0.1 slice)

This is the **game layer** described in the project's architecture doc:

```
Game → Field → Objects → Scoring locations → Robot constraints → Autonomous period
```

It's the foundation everything else (field editor, timeline, LemLib codegen,
simulator, debugger) is meant to read from — so a future season swaps in by
adding one file, not by touching app code.

## What's here

```
src/game/
  types.ts          Season-agnostic interfaces (GameDefinition, FieldDefinition,
                     GameObject, FieldZone, ScoringElementType, etc.)
  coordinates.ts     field-space <-> canvas-space conversion, tile snapping,
                     heading math (LemLib convention: degrees, CCW from +X)
  registry.ts        GameRegistry — register/list/select the active game
  games/override.ts  V5RC Override (2026-2027), fully populated
  index.ts           barrel export
```

Typechecks clean with `npm install && npm run typecheck`.

## Override data provenance

Everything in `games/override.ts` is sourced and cited inline (see the file's
header comment and `sourceNotes` field), pulled from:

- Official Game Manual **v2.0**, effective **2026-09-10** (current as of
  this writing — the manual is on a published update schedule through v4.0
  in spring 2027, so re-check before a competitive season starts)
- The manual's changelog history for two facts that aren't in the base
  rules text alone: the **24"×24" max robot footprint** (added in v1.0) and
  the **10-second Endgame** length (clarified in v0.2)
- VEX's public game page for element counts: **56 Cups, 63 Pins, 9 Goals
  (4 neutral short + 1 neutral tall + 2 red + 2 blue), 4 wall Toggles, 4
  Loaders**
- The **VEXcode VR "V5 26-27 Override" Playground API docs** for actual
  (X, Y) coordinates — published in millimeters, converted to inches here

**Read the caveats at the top of `override.ts` before trusting this for a
real competition field.** In short: the VR Playground's Pin/Cup layout (20
positions) is a simplified virtual-skills field, not the true 56-Cup/63-Pin
competition arrangement; Blue Loader positions are mirrored from Red by
symmetry, not independently confirmed; Midfield's bonus point value and the
Endgame expansion limits weren't confirmed from a source I'd trust, so
they're left `undefined`/noted rather than guessed. Anywhere I wasn't sure,
I said so in a comment instead of inventing a number — worth transcribing
the manual's Field Appendix by hand to replace those before this drives an
actual debugger or scoring model.

## Design choices worth knowing about

- **Units are inches, origin at field center, heading in degrees CCW from
  +X** — this matches LemLib's own convention, so the codegen layer won't
  need a conversion step later.
- **`GameObject.kind` is a free string**, not an enum, on purpose — new
  seasons introduce new object kinds (a "roller," a "descore bar," whatever
  next year's GDC dreams up) without editing `types.ts`.
- **Scoring isn't fully modeled as numbers.** Where a value is state-
  dependent (the yellow Pin's value depends on live Toggle ownership), it's
  a text note (`scoringNotes`) rather than a fake constant — the debugger/UI
  should surface that as guidance, not pretend it can compute a live score.

## Not built yet (see the project's roadmap)

This slice is game-layer data + types only. Still to build per the v0.1
roadmap: the field editor UI (canvas rendering, drag-to-place, waypoints),
the autonomous action timeline, LemLib code generation, and the 2D
simulator. This module is what all of those will import from.
