import type { GameDefinition, GameObject, Point2D } from "../types";

/**
 * V5RC Override (2026-2027 season)
 * ---------------------------------
 * Sourced from:
 *  - Official Game Manual, Version 2.0 (effective September 10, 2026)
 *  - Manual changelog history (v0.1 → v0.2 → v1.0 → v1.1 → v2.0), notably:
 *      v1.0 <SG2a>: robot footprint capped at 24" x 24" at any point in the Match
 *      v0.2: Endgame period clarified as 10 seconds
 *  - VEX Robotics public game page (element counts: Goals/Toggles/Loaders)
 *  - VEXcode VR "V5 26-27 Override" Playground API docs (GPS coordinates,
 *    given there in millimeters; converted to inches here, /25.4)
 *
 * IMPORTANT CAVEATS (do not treat this file as a substitute for the manual):
 *  - The VEXcode VR Playground field is a *simplified virtual-skills* version
 *    of the real competition field. Its Pin/Cup coordinates (20 positions)
 *    are a representative starting layout, NOT the full 56-Cup/63-Pin
 *    competition field, which has a denser, differently-arranged layout
 *    described in the manual's Field Appendix. Treat `startingObjects` of
 *    kind "cup"/"pin" here as placeholders good enough for prototyping the
 *    field editor and simulator — swap in manual-exact positions before
 *    trusting the debugger's collision checks for competition use.
 *  - Blue-side Loaders are NOT published in the VR docs (only Red Loaders
 *    are usable in that particular Playground). Positions below are
 *    mirrored across the X axis from the Red Loaders as a geometric
 *    assumption (the field is bilaterally symmetric) — verify against the
 *    manual's Field Appendix diagram before relying on it.
 *  - Midfield bonus point value is NOT confirmed from an official source at
 *    time of writing; left as `undefined` with a note rather than guessed.
 *  - Yellow Pin / Toggle-ownership scoring interaction is real but
 *    state-dependent (depends on which alliance owns a quadrant's Toggle
 *    when a yellow Pin is scored there) — modeled as a text note on the
 *    scoring element rather than a hard number, since it isn't fixed.
 */

const MM_TO_IN = 1 / 25.4;
const mm = (x: number, y: number): Point2D => ({
  x: Math.round(x * MM_TO_IN * 100) / 100,
  y: Math.round(y * MM_TO_IN * 100) / 100,
});

// ---------------------------------------------------------------------------
// Field
// ---------------------------------------------------------------------------

/** VEXcode VR reports the field spanning -1800mm..1800mm on each axis. */
const FIELD_SPAN_IN = 1800 * MM_TO_IN * 2; // ≈ 141.73 in
const TILE_SIZE_IN = 24; // standard VEX foam field tile

// ---------------------------------------------------------------------------
// Goals (9 total: 4 neutral short, 1 neutral tall (center), 2 red, 2 blue)
// ---------------------------------------------------------------------------

const goals: GameObject[] = [
  { id: "goal.neutral.tall", kind: "goal.neutral.tall", name: "Center Tall Goal", owner: "neutral", position: mm(0, 0) },
  { id: "goal.neutral.1", kind: "goal.neutral.short", name: "Neutral Short Goal (NW)", owner: "neutral", position: mm(-600, 1200) },
  { id: "goal.neutral.2", kind: "goal.neutral.short", name: "Neutral Short Goal (W)", owner: "neutral", position: mm(-1200, 600) },
  { id: "goal.neutral.3", kind: "goal.neutral.short", name: "Neutral Short Goal (E)", owner: "neutral", position: mm(1200, -600) },
  { id: "goal.neutral.4", kind: "goal.neutral.short", name: "Neutral Short Goal (SE)", owner: "neutral", position: mm(600, -1200) },

  { id: "goal.red.1", kind: "goal.alliance", name: "Red Alliance Goal (SW)", owner: "red", position: mm(-1200, -600) },
  { id: "goal.red.2", kind: "goal.alliance", name: "Red Alliance Goal (S)", owner: "red", position: mm(-600, -1200) },

  { id: "goal.blue.1", kind: "goal.alliance", name: "Blue Alliance Goal (NE)", owner: "blue", position: mm(600, 1200) },
  { id: "goal.blue.2", kind: "goal.alliance", name: "Blue Alliance Goal (N)", owner: "blue", position: mm(1200, 600) },
];

// ---------------------------------------------------------------------------
// Toggles (4, centered on each wall)
// ---------------------------------------------------------------------------

const toggles: GameObject[] = [
  { id: "toggle.top", kind: "toggle", name: "Top Wall Toggle", owner: "neutral", position: mm(0, 1780) },
  { id: "toggle.right", kind: "toggle", name: "Right Wall Toggle", owner: "neutral", position: mm(1780, 0) },
  { id: "toggle.bottom", kind: "toggle", name: "Bottom Wall Toggle", owner: "neutral", position: mm(0, -1780) },
  { id: "toggle.left", kind: "toggle", name: "Left Wall Toggle", owner: "neutral", position: mm(-1780, 0) },
];

// ---------------------------------------------------------------------------
// Loaders (4, one adjacent to each Alliance Station)
// Red positions are published; Blue positions are mirrored (see caveats above).
// ---------------------------------------------------------------------------

const loaders: GameObject[] = [
  { id: "loader.red.1", kind: "loader", name: "Red Loader (near)", owner: "red", position: mm(-1740, 1490) },
  { id: "loader.red.2", kind: "loader", name: "Red Loader (far)", owner: "red", position: mm(-1740, -1490) },
  { id: "loader.blue.1", kind: "loader", name: "Blue Loader (near)", owner: "blue", position: mm(1740, 1490), meta: { positionSource: "mirrored, unverified" } },
  { id: "loader.blue.2", kind: "loader", name: "Blue Loader (far)", owner: "blue", position: mm(1740, -1490), meta: { positionSource: "mirrored, unverified" } },
];

// ---------------------------------------------------------------------------
// Preloaded Pins/Cups — VEXcode VR's 20-position representative layout.
// See file-level caveat: NOT the full 56-Cup/63-Pin competition layout.
// ---------------------------------------------------------------------------

const vrPinCupPositionsMm: [number, number][] = [
  [-600, 1745], [600, 1745],
  [-1200, 1200], [1200, 1200],
  [-1745, 600], [-600, 600], [0, 600], [600, 600], [1745, 600],
  [-600, 0], [600, 0],
  [-1745, -600], [-600, -600], [0, -600], [600, -600], [1745, -600],
  [-1200, -1200], [1200, -1200],
  [-600, -1745], [600, -1745],
];

const vrPinsAndCups: GameObject[] = vrPinCupPositionsMm.map(([x, y], i) => ({
  id: `vr.scoring_object.${i + 1}`,
  kind: "scoring_object.unspecified", // manual field appendix distinguishes Pin vs Cup per-slot; not resolved here
  name: `VR Scoring Object Position ${i + 1}`,
  position: mm(x, y),
  meta: { source: "VEXcode VR Playground representative layout" },
}));

// ---------------------------------------------------------------------------
// Game definition
// ---------------------------------------------------------------------------

export const override: GameDefinition = {
  id: "v5rc-override-2026-2027",
  displayName: "V5RC Override",
  season: "2026-2027",
  manualVersion: "2.0 (effective 2026-09-10)",
  sourceNotes: [
    "Game Manual v2.0, effective 2026-09-10 (version schedule per vexrobotics.com/26-27-manuals)",
    "Robot max footprint (24in x 24in) per manual v1.0 change to <SG2a>",
    "Endgame period length (10s) clarified in manual v0.2",
    "Goal/Toggle/Loader/Pin/Cup coordinates converted from mm to in, VEXcode VR 'V5 26-27 Override' Playground API docs",
    "Element counts (56 Cups, 63 Pins, 9 Goals, 4 Toggles, 4 Loaders) per vexrobotics.com/v5/competition/vrc-current-game",
  ],

  field: {
    width: FIELD_SPAN_IN,
    height: FIELD_SPAN_IN,
    tileSize: TILE_SIZE_IN,
    obstacles: [...goals, ...toggles],
    zones: [
      {
        id: "zone.midfield",
        name: "Midfield",
        owner: "neutral",
        // Placeholder footprint — the manual defines Midfield's exact boundary
        // graphically; approximate as a centered square pending exact figure.
        shape: { kind: "rect", center: { x: 0, y: 0 }, width: 24, height: 24 },
        countsOnOverlap: true,
      },
    ],
  },

  startingObjects: [...goals, ...toggles, ...loaders, ...vrPinsAndCups],

  scoringElementTypes: [
    {
      id: "pin.alliance",
      name: "Alliance-color Pin",
      basePoints: 5,
      scoringNotes: "5 points when scored in a Goal for the matching alliance.",
    },
    {
      id: "pin.yellow",
      name: "Yellow Pin",
      basePoints: 10,
      scoringNotes:
        "10 points when scored in a Goal, awarded to whichever alliance owns the Toggle for that Goal's quadrant at the time of scoring. Not a fixed per-alliance value — model as conditional in scoring logic, not a static constant.",
    },
    {
      id: "cup",
      name: "Cup",
      scoringNotes: "Scoring value/interaction not confirmed here — verify against manual Section 2 (Scoring) before use.",
    },
  ],

  robotConstraints: {
    maxWidth: 24,
    maxLength: 24,
    // Endgame expansion limits exist per manual v1.0 <SG3> but exact numbers
    // were not confirmed from the sources checked — left undefined rather
    // than guessed. Fill in once the manual's Robot section is transcribed.
  },

  autonomous: {
    durationSeconds: 15,
    autonomousBonusPoints: 12,
    winPointDescription:
      "An Autonomous Win Point is available for completing assigned tasks during the Autonomous Period; exact task criteria not modeled here — see manual Section 2 (Scoring).",
  },

  // Endgame (10s) is not part of GameDefinition's `autonomous` block since it
  // isn't the Autonomous Period — surfaced here only as a note for later:
  // a future `endgame` field could be added to GameDefinition if the app
  // needs to represent it distinctly from driver control.
};

export default override;
