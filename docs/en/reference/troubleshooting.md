# Troubleshooting

## Quick symptom lookup

Find your symptom below and jump straight to the fix.

| Symptom | Go to |
|---------|-------|
| Robot connection indicator not showing (Settings / Scan tab) | [Can't connect in Client mode](#cant-connect-in-client-mode-stays-at-connecting) |
| App stuck at **"Connecting…"** | [Can't connect in Client mode](#cant-connect-in-client-mode-stays-at-connecting) |
| Peer count stays 0 (peer mode only) | [Peer count stays 0](#peer-count-stays-0-in-router-mode) |
| Scan tab shows **Tracking: Limited / Not Available** | [Tracking state shows Limited](#tracking-state-shows-limited-or-not-available) |
| Map looks split or walls in wrong place | [Map drifts or splits](#map-drifts-or-seems-to-split-into-two-halves) |
| Joystick moves nothing / robot doesn't respond | [Robot doesn't move during calibration](#robot-doesnt-move-during-calibration) |
| Calibration produces gain = 0 or > 300 | [Gain values look wrong](#gain-values-look-wrong-after-auto-calibration-eg-gain-0-or-300) |
| Robot spins or drifts after calibration | [Robot still drifts](#robot-still-drifts-after-calibration) |
| "Path not found" or robot sits at failed state | [Path not found](#path-not-found-robot-sits-at-failed-state) |
| Point cloud not visible in Foxglove | [Foxglove topics missing](#foxglove-topics-not-appearing-or-missing) |
| App won't find robot on iPhone hotspot | [Peer count stays 0](#peer-count-stays-0-in-router-mode) — use raw IP instead of mDNS |
| Fan doesn't spin | [Fan doesn't spin / no suction](#fan-doesnt-spin-no-suction) |
| Exploration stops immediately | [Exploration ends immediately](#exploration-ends-immediately-after-starting) |

---

Symptoms are grouped by area. Jump to the section that matches what you're seeing.

---

## Connection issues

### Can't connect in Client mode / stays at "Connecting..."

1. **Verify the router address** in Settings → Router Address is correct. Format: `tcp/192.168.1.100:7447`. No trailing slash, no path.
2. **Check rmw_zenohd is running** on the desktop: `ros2 run rmw_zenoh_cpp rmw_zenohd`. The terminal should show it listening on port 7447.
3. **Firewall**: port 7447 TCP must be open on the desktop. On macOS: System Settings → Firewall → Options → check `rmw_zenohd` is allowed.
4. **Same network**: phone and desktop must be on the same LAN (or phone hotspot). You cannot connect across different subnets without a relay.
5. **IP change**: if the desktop got a new DHCP address, update the Router Address field.

### Peer count stays 0 in Router mode

In Router mode the phone waits for devices to connect *to it*. Zero peers means nothing has connected yet:

1. **ESP32**: check firmware config — the Zenoh router address must be `tcp/<phone-ip>:7447`. The phone IP is shown in Settings.
2. **Desktop**: run `rmw_zenoh_cpp` configured in client mode pointing at the phone, or use zenoh-pico directly.
3. **Network**: if using phone hotspot, the ESP32 must be connected to the hotspot SSID, not its own AP.
4. **mDNS**: if using the mDNS hostname (`iphone.local`), try the raw IP instead — mDNS can be unreliable between iOS and embedded devices.

### App disconnects when backgrounded

This is **expected behaviour** in Router mode. iOS suspends background apps and the router releases port 7447 before suspension.

- Enable **Auto-connect** — the session reconnects automatically when you return to the app.
- In Client mode, backgrounding is less disruptive but the session may still drop after a few minutes.

### Retries exhaust and give a permanent error

The client retries 3 times with 1.5 s between attempts. If all fail, the error stays displayed. Tap **Connect** again manually after fixing the underlying network issue.

---

## SLAM issues

### Tracking state shows "Limited" or "Not Available"

ARKit tracking degrades when the environment lacks visual features or lighting is poor.

- **Move slower** — fast movement causes motion blur that hurts feature matching
- **Improve lighting** — tracking is hardest in dark rooms or under uniform overhead light with no shadows
- **Add visual texture** — plain white walls are very hard to track; posters or objects on walls help
- **Not Available** means tracking is fully lost: stop moving, hold the phone still, slowly look at previously-seen areas to re-acquire

### Map drifts or seems to split into two halves

This is a loop closure failure — SLAM did not recognise that two areas of the map connect.

- **Revisit earlier areas** slowly — loop closure triggers when the camera recognises previously-mapped keyframes
- Watch the **loop closures** counter in the Scan tab; it should increment when you pass through a familiar area
- Reduce `rtabLinearUpdate` and `rtabAngularUpdate` in Settings to store more keyframes (more memory use but better loop closure opportunities)
- Increase `rtabVisMaxFeatures` for richer feature matching at the cost of CPU

### Occupancy grid looks wrong (walls in open space, or open space through walls)

- **Camera height** is wrong: go to Control → Configuration → Occupancy Grid → Camera Height. Enable **Auto-detect** if you have LiDAR on iPhone Pro; otherwise enter the measured height of the phone above the floor.
- **Max obstacle height** is set too low: anything taller than this value is ignored. Check `gridMaxObstHeight`.
- **Normals segmentation** off: enable `gridNormalsSegmentation` for better floor/wall separation on cluttered terrain.

### SLAM never starts building a map / map is empty

- ARKit requires the camera to move to initialise — hold the phone and walk slowly for a few seconds
- Check that the Scan tab is in focus; leaving the Scan tab may pause the AR session depending on your workflow
- Restart the SLAM session (Reset button) if it gets stuck in a bad state

### High CPU / RAM usage causing slowdowns

- Increase `rtabSkip` (Settings → SLAM Quality) to feed fewer frames to RTAB-Map (default 10; try 15–20)
- Increase `rtabVoxelSize` (e.g. 0.05–0.10 m) for coarser downsampling, or increase `rtabDecimation`
- Disable `cloudMapEnabled` (Settings → SLAM Quality) — publishing the full accumulated cloud on every SLAM node is expensive
- Disable topics you don't need in the Topics tab

---

## Calibration issues

### Robot doesn't move during calibration

1. Verify ESP32 is connected — check the robot connection indicator in Settings or Scan tab (Autonomous IDD mode)
2. Confirm the `/cmd_vel` topic is **enabled** in the Topics tab
3. Check battery voltage (Control tab) — low battery may prevent motor movement
4. Test manually with the joystick (Control tab) before attempting calibration

### Gain values look wrong after auto-calibration (e.g. gain = 0 or > 300)

Auto-calibration relies on SLAM odometry to measure actual robot velocity. Bad calibration usually means SLAM was unstable during the run:

1. Retry on a **flat, hard floor** with good lighting for SLAM tracking
2. Ensure tracking state was **Normal** throughout — check it in the Scan tab before starting
3. Give the robot more space: at least 1.5 m in front, no obstacles nearby

### Robot still drifts after calibration

- Try **enabling PI feedback** (Control → Drive Calibration → `driveLinPIEnabled`, `driveAngPIEnabled`). Start with Kp = 0.01.
- Manually adjust `calYawDriftTrim` in small steps (±0.01) until the robot drives straight
- If drift varies with speed, adjust `calStraightBiasRate` — positive value compensates for right-pull at high speed

---

## Navigation issues

### "Path not found" / robot sits at failed state

- **Map too small**: the robot can't plan if it hasn't mapped the area between itself and the goal. Drive around the space to build more map first.
- **Goal is in an obstacle**: tap a goal in clearly free (white) space on the map
- **`driveAllowUnknown` is off**: unknown (grey) cells are treated as walls. Enable it to allow planning through unmapped areas.
- **Inflation radius too large**: if `costInflateRadiusM` is larger than the corridor width, the entire corridor appears blocked. Reduce it.

### Robot gets stuck frequently

- Reduce `driveMaxSpeedCmS` — slower speed leaves more reaction time and odometry accuracy
- Tune `calLinDeadband` downward so small corrections are applied at lower speeds
- Increase `costInflateRadiusM` slightly to give more clearance around walls in the plan (prevents getting close enough to be stuck)
- Check `driveStuckTimeout` and `driveStuckFastTimeout` — lower values trigger recovery sooner

### Robot overshoots goals

- Increase `driveGoalTol` (0.15–0.30 m is typical; default is 0.15 m)
- Reduce `driveHeadingGain` (default 1.5) to soften corrections
- If using PI feedback: reduce `calLinKp`

### Robot spins in place and never reaches goal

- Check `calAngGain` — if too high, small angular corrections become large spins. Reduce by ~20%.
- Reduce `driveMaxTurnDPS` to limit rotation speed
- Verify `calAngDeadband` is not zero (a zero deadband means any tiny correction moves the motor)

---

## Exploration issues

### Exploration ends immediately after starting

The explorer looks for frontier cells (boundary between free and unknown space). If none exist, it stops.

- The robot must build **some initial map** first. Let SLAM run for at least 10–20 seconds while you slowly move the phone before tapping Explore.
- The initial 360° spin (spinning state) builds the starting map — wait for it to finish before expecting exploration to find many frontiers.

### Exploration finishes too quickly / misses areas

- Increase `exploreTimeout` (default 5 minutes)
- Check that the area is reachable — large obstacles or closed doors will block frontiers
- Reduce `driveGoalTol` slightly so the robot gets closer to each frontier before marking it visited

### Robot never returns home after exploration

- Return-home uses the same A* planner. If the map changed significantly during exploration (loop closure shifted the grid), the home position may now appear blocked.
- Tap the start area manually as a goal to return manually
- Enable `driveAllowUnknown` so the return path can pass through recently-seen unmapped zones

---

## Cleaning issues

### Cleaning path skips large areas

- The cleaning path is calculated once at the start from the current map. If the map is incomplete when you tap Clean, areas not yet mapped will not be included.
- Build a more complete map (finish exploring first) before starting a cleaning run.
- Reduce `cleanAreaWidth` — narrower strips cover more of the floor but take longer

### Fan doesn't spin / no suction

1. Check `cleanFanSpeed` is > 0 in Control → Configuration → Cleaner Mode
2. Verify ESP32 fan ESC wiring (pin 19, see [Build & Configure → Wiring](../getting-started/build-robot/build-and-configure.md#wiring))
3. Test fan command manually: publish `std_msgs/Float32` to `/suction_fan/speed` with value 0.5

### Cleaning stops mid-way

- A stuck event or navigation failure during cleaning stops the run
- Check the drive state label (Scan tab) for the failure reason
- Reduce `driveMaxSpeedCmS` if the robot is getting stuck on furniture

---

## General / other

### App shows high RAM usage

iROSLink keeps the full 3D point cloud and RTAB-Map database in memory. On long sessions this grows:

- Save and reload the map (Data tab → Save) to compact the database
- Reset the SLAM session to free memory (loses the current map)
- Reduce `rtabVoxelSize` to a larger value to keep the cloud smaller

### Configuration changes don't take effect

Most settings apply immediately. A few require a reconnect or session restart:

- **Zenoh mode / address**: requires a disconnect + reconnect
- **Topic enable/disable**: applies on next connection
- **SLAM parameters** (`rtabSkip`, `rtabVoxelSize`, etc.): apply immediately — no restart needed

### Foxglove topics not appearing or missing

1. **Server not enabled**: `foxgloveEnabled` must be `true` in Settings. Check the Foxglove indicator shows a port (e.g. `:8765`).
2. **Wrong address in Studio**: use `ws://<phone-IP>:8765`. The phone IP is shown in Settings.
3. **Topic not subscribed**: Foxglove only streams data for topics you have open in a panel. Add a Raw Messages / Plot / 3D panel and subscribe to the topic.
4. **`/camera/depth/points` or `/cloud_map` missing**: point cloud topics require an **iPhone Pro** with LiDAR. Non-Pro models have no depth sensor and these topics are never published.
5. **Topic flag disabled**: verify the topic flag is enabled in **Control tab → Topics** (e.g. `topicPoints` for `/camera/depth/points`).
6. **Toggle off/on**: if topics are still missing after reconnecting Foxglove Studio, toggle the server off and back on in Settings — this re-advertises all channels to the new client.

---

### "Address already in use" on startup (Router mode)

This can happen if the app crashed without releasing port 7447. Force-quit iROSLink from the app switcher and relaunch — iOS releases the port when the process exits.
