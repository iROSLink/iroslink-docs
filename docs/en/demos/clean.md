# Clean Mode

The robot drives a **boustrophedon** (back-and-forth zigzag) path across all mapped free space while running the suction fan. Requires a completed occupancy grid map.

!!! note "Autonomous IDD + fan hardware required"
    Clean requires **Autonomous IDD** mode and the fan ESC wired on GPIO 19. See [Vacuum Robot](vacuum-robot.md) for hardware setup.

---

## Prerequisites

- Vacuum robot built → [Vacuum Robot](vacuum-robot.md)
- Robot calibrated → [Drive & Calibrate](../getting-started/build-robot/drive-and-calibrate.md)
- A completed map — either from a manual drive or from [Explore](explore.md)
- Map shows mostly white (free) cells with clear obstacle boundaries

!!! tip "Map quality matters"
    A poor map (grey patches, false obstacles) produces a sparse cleaning path. Run Explore first to get a complete map before cleaning.

---

## How to start

1. Ensure SLAM is running and the map looks complete.
2. Tap **Actions** → **Clean**.
3. A countdown overlay appears. Stand back — the fan starts immediately when cleaning begins.

The robot computes a boustrophedon path across all free cells and begins traversing it row by row.

---

## What you see

| Display | Meaning |
|---------|---------|
| Drive state: `planning` | Computing coverage path |
| Drive state: `driving (X.Xm)` | Cleaning row; distance to next waypoint |
| Drive state: `rotating` | Turning to next row |
| Zigzag line on Scan tab | Planned coverage path |
| Progress counter | `(done / total waypoints)` |

The fan runs at `cleanFanSpeed` throttle throughout and stops automatically when all waypoints are complete or you tap **Stop**.

---

## Fan speed

Set fan throttle in **Control → Drive Calibration → `cleanFanSpeed`**.

| Value | Effect |
|-------|--------|
| `0.0` | Fan off |
| `0.5` | 50% throttle (default) |
| `1.0` | Full throttle |

Higher throttle = stronger suction but more noise and battery draw. For light dust, `0.4`–`0.6` is usually sufficient.

---

## Tips

- **Run Explore first.** A fully mapped space produces a complete, non-patchy cleaning path.
- **Hard floors work best.** Carpet increases rolling resistance and can cause odometry drift mid-clean. Recalibrate after switching floor types.
- **Check battery before starting.** A full clean of a 20 m² room can take 15–30 minutes. Low voltage affects both drive accuracy and fan suction.

---

## Troubleshooting

**Fan doesn't start:**
Check ESC wiring on GPIO 19. Press the BOOT button on the ESP32 — if the fan toggles, the ESC is working and the issue is the ROS2 connection or `cleanFanSpeed` value.

**Cleaning path misses large areas:**
Grey patches in the map are treated as unknown and skipped. Run Explore to map them, then restart Clean.

**Robot clips walls during cleaning:**
Increase the costmap inflation radius in **Control → Occupancy Grid → Inflation Radius** to give the planner a wider safety margin.

**Cleaning stops mid-run:**
Check drive state in the Scan tab. `failed: Stuck` means recovery failed — tap a new goal on the map to free the robot, then restart Clean.

→ [Troubleshooting](../reference/troubleshooting.md) — full issue guide
→ [App Stages & Lifecycle](../reference/app-stages.md) — drive state reference
