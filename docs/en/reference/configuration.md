# Configuration Details

All settings are stored in UserDefaults and can be exported, imported, or reset via the **Data tab** — see [Data Tab — Maps & Config](data-tab.md).

---

## ROS2 bridge (Zenoh)

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `zenohIsRouter` | Bool | `false` | `false` = Client (connects out to a router). `true` = Router (phone listens on :7447). |
| `zenohLocator` | String | — | Client mode only: address of the Zenoh router, e.g. `tcp/192.168.1.100:7447`. |
| `autoConnect` | Bool | `true` | Auto-connect to Zenoh on app launch. |

**Power impact of Zenoh mode:**

| Mode | Power draw | Notes |
|------|-----------|-------|
| Router (`zenohIsRouter = true`) | Higher | Phone runs a Rust TCP listener on :7447 and manages all peer routing. Background threads run continuously even when no robot is connected. |
| Client (`zenohIsRouter = false`) | Lower | Phone dials out to an external router and only maintains one outbound session. Preferred for battery life when a router (e.g. Raspberry Pi) is already on the network. |

---

## Foxglove WebSocket server

The Foxglove WebSocket server (`foxgloveEnabled`) streams all topics to [Foxglove Studio](https://foxglove.dev) over a local WebSocket connection on port 8765. It runs independently of Zenoh — you can use it with or without a Zenoh connection.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `foxgloveEnabled` | Bool | `false` | Enable the Foxglove WebSocket server. Advertises all topics to Foxglove Studio on the local network. |

**Power impact:** The Foxglove server has a measurable power cost even when no client is connected, because the listener socket is held open and every published message is serialised (CDR-encoded) and dispatched to all subscribers. With an active Foxglove Studio connection receiving high-rate topics (camera, point cloud, IMU), the additional CPU load can be significant — comparable to adding another Zenoh peer. Recommendations:

- Disable when not actively debugging in Foxglove.
- On battery, prefer enabling Foxglove briefly to capture a session rather than leaving it on continuously.
- High-bandwidth topics (`/camera/image_raw/compressed`, `/camera/depth/points`, `/cloud_map`) are the largest contributors — unsubscribe from panels you are not viewing.

---

## Operating mode

| Key | Type | Default | Values |
|-----|------|---------|--------|
| `appMode` | String | `"sensorBridge"` | `"sensorBridge"` · `"autonomousIDD"` |

See [Operating Modes](modes.md) for what each mode does.

---



## SLAM quality (RTABMap)

> **Tuning difficulty:** RTAB-Map has hundreds of interdependent parameters. The ones exposed here cover the highest-impact knobs for mobile LiDAR SLAM, but finding the right combination for a specific environment takes iteration. Start with defaults and change one parameter at a time, then Reset the map to compare. The official [RTAB-Map parameter guide](https://github.com/introlab/rtabmap/wiki/Change-parameters) and the [RTAB-Map ROS wiki](https://wiki.ros.org/rtabmap_ros) are the best reference for understanding how upstream defaults differ from the values chosen here.

These map directly to RTAB-Map C++ parameters fed through `iROSBridgeSetCloudParams` and `iROSBridgeSetSLAMParams`. Changes apply immediately without a restart; the cloud rebuild happens on the next SLAM node (every 5 nodes visible in `/cloud_map`).

### Input filtering

| Key | Type | Default | RTAB-Map param | Description |
|-----|------|---------|----------------|-------------|
| `rtabmapEnabled` | Bool | `true` | — | Enable RTAB-Map loop closure. Off = ARKit VIO only: no loop closure, no `/cloud_map`, no map saving. Lighter on CPU (~30% less). Use when environment is dark or featureless. |
| `rtabMaxDepth` | Double | `2.0` m | `RGBD/DepthMax` | Clips depth measurements beyond this range before feeding SLAM. Range 1.0–5.0 m. |
| `rtabVoxelSize` | Double | `0.05` m | `Grid/CellSize` / voxel filter | Downsamples the point cloud to one point per voxel cell before SLAM processing. `0.0` = disabled (no downsampling). |
| `rtabDecimation` | Int | `4` | depth decimation | Keeps 1 in N depth points fed to SLAM. Higher = fewer points, less CPU, coarser cloud. |
| `rtabMinConf2` | Int | `1` | ARKit confidence mask | Filters ARKit LiDAR pixels by confidence before SLAM: `0` = all pixels, `1` = medium + high only, `2` = high confidence only. |

**Map quality tradeoffs:**

| Goal | Recommended changes |
|------|---------------------|
| Better wall detail / denser cloud | `rtabDecimation` → 2, `rtabVoxelSize` → 0.02–0.03 m |
| Cleaner cloud, fewer floaters | `rtabMinConf2` → 1 or 2; enable noise filter (see below) |
| Larger room coverage | `rtabMaxDepth` → 3.0–4.0 m |
| Reduce CPU / thermal throttle | `rtabDecimation` → 6–8, `rtabVoxelSize` → 0.05 m, `rtabMaxDepth` → 1.5 m |

### Node insertion rate

| Key | Type | Default | RTAB-Map param | Description |
|-----|------|---------|----------------|-------------|
| `rtabLinearUpdate` | Double | `0.05` m | `RGBD/LinearUpdate` | Minimum travel (metres) before RTAB-Map adds a new SLAM node. Upstream default is 0.1 m; app uses 0.05 m for denser nodes. |
| `rtabAngularUpdate` | Double | `0.05` rad | `RGBD/AngularUpdate` | Minimum angular change (radians) before a new SLAM node is added. Upstream default is 0.1 rad. |

Lower values → more nodes → more accurate loop closure but more memory and CPU. For slow-moving robots keep at 0.05 m / 0.05 rad. For fast sweeps raise to 0.10 m / 0.10 rad.

### Cloud map

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `cloudMapEnabled` | Bool | `false` | Publish the full accumulated `/cloud_map` on every SLAM event. Expensive at scale (serialises the entire cloud over the bridge each time). Use `/camera/depth/points` for incremental updates instead. Gated at the C++ level — no CPU cost when disabled. |

---

## SLAM debug (loop closure)

These control how RTAB-Map detects revisited places. Accessible under **Settings → SLAM Debug (Loop Closure)**.

### Live diagnostics (read-only)

The SLAM Debug section shows live stats updated at 1 Hz:

| Field | Meaning |
|-------|---------|
| **Loop closures** | Total accepted loop closures this session. A healthy map will accumulate these as you revisit areas. |
| **Last LC node** | Node ID of the most recent loop closure. Useful for correlating with map artifacts. |
| **LC hypothesis** | Confidence of the last loop closure (0–1). Values > 0.5 are candidates; accepted closures pass additional geometric verification. |
| **Vis inliers / matches** | Inlier feature count / total candidate matches for the last loop closure attempt. Inliers / Matches ratio shows match quality — below 0.3 usually means a false positive was rejected. |

### Feature extraction

| Key | Type | Default | RTAB-Map param | Description |
|-----|------|---------|----------------|-------------|
| `rtabVisMinInliers` | Int | `50` | `Vis/MinInliers` | Minimum geometric inliers required to accept a loop closure. RTAB-Map upstream default is 20; app default is 50 (stricter). Lower = more closures (risk of ghost corrections). Higher = fewer false positives but may miss real revisits. Range 5–100. |
| `rtabVisMaxFeatures` | Int | `400` | `Vis/MaxFeatures` | Maximum keypoints extracted per frame for loop closure detection. Upstream default is 1000; app default is 400 to save CPU. Higher → better recall in repetitive environments (long corridors) at the cost of ~2× CPU for feature extraction. Options: 200 / 400 / 600 / 800. |
| `rtabVisFeatureType` | Int | `6` | `Vis/FeatureType` | Feature detector + descriptor used for visual place recognition. |

Feature type options and tradeoffs:

| Value | Name | CPU | Quality | Best for |
|-------|------|-----|---------|----------|
| `6` | GFTT/BRIEF (default) | Lowest | Good | Room-scale, well-lit, fast operation |
| `2` | ORB | Low | Better under blur | Motion blur, faster movement |
| `7` | BRISK | Medium | Rotation-invariant | Environments with large viewpoint changes |
| `9` | ORB-Octree | Medium | More uniform coverage | Large uniform walls with few texture features |

> **Note:** Changing feature type requires resetting the map (Scan tab → Reset). The visual dictionary is incompatible between detector types.

### Image decimation

| Key | Type | Default | RTAB-Map param | Description |
|-----|------|---------|----------------|-------------|
| `rtabImagePreDecim` | Int | `2` | `Mem/ImagePreDecimation` | Downscales the RGB image before feature extraction. `1` = full resolution, `2` = half (default), `4` = quarter. Upstream default is 1 (no decimation); app default is 2 to halve feature extraction CPU. Full res (`1`) improves loop closure reliability in large or repetitive spaces. |

### Frame rate to SLAM

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `rtabSkip` | Int | `10` | Feed 1-in-N ARKit frames (~30 Hz) to RTAB-Map. `10` ≈ 3 Hz to SLAM. Lower = more frames → better tracking and more nodes, but heavier CPU. Raise if you see "retaining ARFrames" warning in logs (means SLAM is slower than ARKit delivery). |

**CPU impact of `rtabSkip`:**

| Value | SLAM Hz | CPU cost | Use when |
|-------|---------|----------|----------|
| `1` | 30 Hz | Very high | Debugging only |
| `5` | 6 Hz | High | Slow robot, need dense nodes |
| `10` | 3 Hz | Medium (default) | Normal operation |
| `20` | 1.5 Hz | Low | Large rooms, fast movement |
| `60` | 0.5 Hz | Very low | Thermal relief only |

---

## Point cloud noise filter

Applied after depth unprojection, before occupancy grid and SLAM input.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `cloudNoiseRadius` | Double | `0.0` m | Radius for neighbor search. `0` = disabled. Good starting value: `0.05` m. Each point with fewer than `cloudNoiseMinNeighbors` neighbors within this radius is removed. |
| `cloudNoiseMinNeighbors` | Int | `1` | Points with fewer neighbors than this within the search radius are discarded. Raise to 2–4 for aggressive filtering. |
| `gridRayTracing` | Bool | `true` | Enables free-space ray tracing: clears occupancy voxels between the sensor origin and each depth measurement. Removes phantom obstacles behind surfaces and stale occupied cells as the robot moves. Slight CPU cost per frame; keep enabled for navigation. |
| `gridNormalsSegmentation` | Bool | `true` | Classifies depth points as ground/obstacle using surface normals (angle relative to gravity) instead of height thresholds alone. Detects stair risers and drop-offs. Can misfire with sparse/decimated depth — if the occupancy grid shows noise on flat floors, switch to height-only (disable). |

**Tuning the noise filter:**

Floaters above the floor → enable filter, `radius` = 0.05 m, `minNeighbors` = 2.
Walls look eroded → filter is too aggressive; lower `minNeighbors` to 1 or increase `radius`.
Floor classified as obstacle → disable `gridNormalsSegmentation` or tune camera height parameters.

---

## Tips: getting a better map

### More loop closures
- Move **slowly and steadily** — `RGBD/LinearUpdate` adds nodes based on travel; fast sweeps produce sparse graphs.
- **Revisit areas from similar angles** — loop closure is view-dependent. Approaching from the opposite direction helps.
- Raise `rtabVisMaxFeatures` to 600–800 in repetitive or textureless environments (long corridors, white walls).
- Lower `rtabVisMinInliers` to 30–40 if the live stats show high match counts but LC hypothesis never crosses 0.5.

### Cleaner point cloud
- Enable the noise filter with `cloudNoiseRadius` = 0.05 m, `cloudNoiseMinNeighbors` = 2.
- Keep `gridRayTracing` enabled — it removes ghost points left behind as the robot moves.
- Use `rtabMinConf2` = 1 (medium+) to skip low-confidence LiDAR pixels; step up to 2 (high only) in cluttered spaces.
- Lower `rtabVoxelSize` to 0.02–0.03 m for denser output (trades CPU).

### Reduce CPU / prevent thermal throttle
1. Raise `rtabSkip` to 15–20 (drops SLAM Hz, not ARKit tracking Hz).
2. Raise `rtabDecimation` to 6–8.
3. Raise `rtabVoxelSize` to 0.05–0.10 m.
4. Set `rtabImagePreDecim` to 4 (quarter resolution for feature extraction).
5. Disable `cloudMapEnabled` — rebuilding the full cloud every node is expensive at scale.

---

## Tracking CPU usage

iROSLink publishes live diagnostics to `/diag/cpu_percent` and `/diag/ram_mb` (std_msgs/Float32) and mirrors them to Foxglove over WebSocket.

**In Foxglove Studio:**
- Add a **Plot** panel → subscribe to `/diag/cpu_percent` and `/diag/ram_mb`.
- Watch for CPU spikes > 80% sustained — this precedes thermal throttle and ARKit frame drops.

**In-app diagnostics (Topics tab):**

| Topic | Type | What it shows |
|-------|------|---------------|
| `/diag/cpu_percent` | Float32 | Process CPU % (sampled every 10 s) |
| `/diag/ram_mb` | Float32 | App RAM usage in MB |
| `/diag/speed_cmps` | Float32 | Forward speed cm/s (from ARKit pose diff) |
| `/diag/yaw_rate_dps` | Float32 | Yaw rate deg/s |

**Signs of CPU pressure and remedies:**

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Retaining ARFrames" in logs | SLAM can't keep up with ARKit | Raise `rtabSkip` |
| Map stops updating | SLAM thread stalled | Raise `rtabDecimation`, `rtabVoxelSize` |
| ARKit tracking degrades | Thermal throttle | Lower `rtabMaxDepth`, disable `cloudMapEnabled` |
| High RAM (> 400 MB) | Growing node graph | Raise `rtabLinearUpdate` to space out nodes |

---

## Control tab keys *(Autonomous IDD only)*

→ [Control Tab — Settings & Calibration](control-tab.md) — occupancy grid, robot body, camera rates, navigation, motor calibration, autonomous behaviours, gamepad buttons

---

## App behaviour

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `keepScreenOn` | Bool | `true` | Disable auto-lock while app is running. |
| `stopSessionOnComplete` | Bool | — | Auto-pause SLAM when explore or clean finishes. |
