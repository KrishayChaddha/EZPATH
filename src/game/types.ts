/**
 * VEX Auton Studio — Game Layer Types
 * ------------------------------------
 * These types define a SEASON-AGNOSTIC contract for "what a VEX game is."
 * A concrete season (e.g. Override, or whatever ships in 2027-2028) is just
 * a value that satisfies `GameDefinition`. Nothing in the field editor,
 * simulator, or code generator should ever import a specific season by name —
 * they should only depend on these interfaces, and read the active game from
 * the GameRegistry (see registry.ts).
 *
 * Coordinate system convention (matches VEX GPS / VEXcode VR):
 *  - Units: inches, unless a field explicitly says otherwise.
 *  - Origin (0, 0) is the exact center of the field.
 *  - +X points toward the right wall (as viewed with Red alliance station on
 *    the left, Blue on the right — i.e. standard broadcast orientation).
 *  - +Y points toward the top wall (away from the Red/Blue alliance stations,
 *    if they sit on the bottom edge) — generally, "up" on the field diagram.
 *  - Heading is in degrees, 0 = facing +X, increasing counter-clockwise,
 *    matching LemLib's `moveToPose`/`turnToHeading` convention. Code
 *    generators are responsible for converting to whatever heading
 *    convention the target framework expects if it differs.
 */

export type Alliance = "red" | "blue";

export type Point2D = {
  x: number;
  y: number;
};

export type Pose2D = Point2D & {
  /** Degrees, counter-clockwise from +X. */
  heading: number;
};

/**
 * A rectangular or circular region on the field used for scoring checks,
 * "ended in zone" bonuses (e.g. Midfield), or debugger collision checks.
 */
export type FieldZone = {
  id: string;
  name: string;
  /** Which alliance this zone counts for, or "neutral" if shared. */
  owner: Alliance | "neutral";
  shape:
    | { kind: "rect"; center: Point2D; width: number; height: number; rotation?: number }
    | { kind: "circle"; center: Point2D; radius: number };
  /** True if a robot merely needs to be touching/overlapping to count. */
  countsOnOverlap?: boolean;
};

/**
 * A physical, interactable object on the field: a goal, a toggle, a loader,
 * a preloaded scoring element, an obstacle, etc. `kind` is intentionally a
 * free string (not a season-specific enum) so new seasons can introduce new
 * object kinds without touching this file.
 */
export type GameObject = {
  id: string;
  /** e.g. "goal.neutral.short", "goal.tall", "toggle", "loader", "obstacle" */
  kind: string;
  name: string;
  position: Point2D;
  /** Degrees, if the object has a meaningful facing (e.g. a Loader mouth). */
  rotation?: number;
  /** Which alliance owns/controls this object, if applicable. */
  owner?: Alliance | "neutral";
  /**
   * Approximate footprint used by the debugger for path-collision checks.
   * Optional — objects without a footprint are treated as points/targets.
   */
  footprint?:
    | { kind: "circle"; radius: number }
    | { kind: "rect"; width: number; height: number; rotation?: number };
  /** Arbitrary season-specific metadata (e.g. goal capacity, toggle state). */
  meta?: Record<string, unknown>;
};

/**
 * A scoreable game piece type (not an individual instance on the field —
 * see `startingObjects` for instances). Used by the debugger/analytics to
 * label what a robot is carrying or has scored.
 */
export type ScoringElementType = {
  id: string;
  name: string;
  /** Base point value when scored by the owning alliance, if fixed. */
  basePoints?: number;
  /** Free-form notes for point values that depend on game state (e.g. a
   * yellow Pin's value depending on Toggle ownership) — the debugger/UI
   * should surface this as text rather than trying to fully model scoring. */
  scoringNotes?: string;
};

export type FieldDefinition = {
  /** Overall play area, inner-wall to inner-wall, in inches. */
  width: number;
  height: number;
  /** Size of one square field tile, in inches (VEX fields are tiled). */
  tileSize: number;
  /** Fixed, non-scoring objects/zones used for collision checks. */
  obstacles: GameObject[];
  /** Zones like Midfield, Alliance Stations, Loader areas, etc. */
  zones: FieldZone[];
};

export type DrivetrainConstraint = {
  /** Max robot footprint allowed by the manual, inches (e.g. 18 x 18). */
  maxWidth: number;
  maxLength: number;
  /** Max expansion allowed post-expansion, if the game permits it. */
  maxExpandedWidth?: number;
  maxExpandedLength?: number;
};

export type AutonomousPeriodDefinition = {
  durationSeconds: number;
  /** Bonus points awarded to the alliance that outscores in auton. */
  autonomousBonusPoints?: number;
  /** Whether an individual Autonomous Win Point exists and its condition. */
  winPointDescription?: string;
};

/**
 * The full description of one competition season. This is the single object
 * the rest of the app (field editor, simulator, debugger, codegen) reads to
 * know what field to draw, what actions are meaningful, and what "done" and
 * "illegal" look like — so a new season is added by writing one new file
 * like `games/override.ts`, not by touching app code.
 */
export type GameDefinition = {
  id: string;
  displayName: string;
  season: string;
  manualVersion: string;
  /** Where the coordinates/counts in this file were sourced from. */
  sourceNotes?: string[];

  field: FieldDefinition;

  /** Interactable objects present at match start (goals, toggles, loaders). */
  startingObjects: GameObject[];

  scoringElementTypes: ScoringElementType[];

  robotConstraints: DrivetrainConstraint;

  autonomous: AutonomousPeriodDefinition;

  /**
   * Named starting poses teams commonly use (e.g. the four VEXcode VR
   * Playground starting tiles), keyed by alliance. Purely a UX convenience
   * for the field editor's "snap to common start" feature — teams can still
   * place the robot anywhere legal.
   */
  suggestedStartingPoses?: Partial<Record<Alliance, Pose2D[]>>;
};
