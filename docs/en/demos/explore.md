# Explore Mode

The robot autonomously navigates to unmapped frontier cells until the entire reachable space is mapped, then returns home. No manual driving required.

!!! note "Autonomous IDD only"
    Explore requires **Autonomous IDD** mode. Switch in **Settings → Operating Mode**.

---

## Prerequisites

- Robot built and calibrated → [Drive & Calibrate](../getting-started/build-robot/drive-and-calibrate.md)
- SLAM is running and tracking state shows **Normal**
- At least 1.5 m of clear space around the robot
- Battery reasonably charged — exploration can take 5–20 minutes depending on space size

---

## How to start

1. Open the **Scan** tab → tap **Start** to begin SLAM.
2. Let the robot build an initial map for 30–60 seconds (drive it around manually if needed to seed the map).
3. Tap **Actions** → **Explore**.
4. A countdown overlay appears. Stand back.

The robot performs a **360° spin** first to orient itself and detect nearby obstacles, then begins navigating to frontier cells — the boundary between mapped free space and unknown area.

---

## What you see

| Display | Meaning |
|---------|---------|
| Drive state: `planning` | Computing path to next frontier |
| Drive state: `driving (X.Xm)` | En route to frontier; X.X metres remaining |
| Drive state: `rotating` | Arrived at waypoint, scanning |
| Drive state: `unstucking (N/3)` | Recovery in progress |
| Green path line on Scan tab | Current planned route |

The map grows as the robot reaches new areas. Explored frontiers turn from grey (unknown) to white (free) or black (obstacle).

---

## When exploration ends

Exploration stops when:
- All reachable frontiers are mapped
- The time limit is reached (configurable in Control tab → Autonomous Behaviours → `exploreTimeout`)
- You tap **Stop**
- The robot gets stuck and all three recovery attempts fail

The robot returns to its starting position when exploration completes normally.

---

## Tips

- **Seed the map first.** Manually driving through doorways or around key obstacles before starting Explore helps the planner reach more of the space.
- **Lighting matters.** SLAM tracking degrades in dark or featureless corridors. Poor tracking → inaccurate frontiers → exploration loops or missed areas.
- **Reduce speed for tight spaces.** Lower `driveMaxLinSpeed` in Drive Calibration if the robot clips doorframes.

---

## Troubleshooting

**Robot spins but doesn't move:**
No frontiers detected — the map may already be complete, or SLAM hasn't seen enough to generate frontiers yet. Drive manually for 30 seconds then retry.

**Stuck recovery fails repeatedly:**
The robot may be in a narrow gap its body dimensions don't fit through. Tap a manual goal on the map to move it to a more open area, then restart Explore.

**Exploration ends too quickly:**
Check the time limit in **Control tab → Autonomous Behaviours → `exploreTimeout`**. Default is 10 minutes.

→ [Troubleshooting](../reference/troubleshooting.md) — full connection and SLAM issue guide
