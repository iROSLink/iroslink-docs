# Control Tab — Settings & Calibration

These keys are exposed in the **Control tab** (Autonomous IDD mode). They control the robot's physical dimensions, sensor publishing rates, navigation behaviour, motor calibration, and autonomous actions.

---

## Occupancy grid

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `mapCellSize` | Double | `0.02` m | Grid cell resolution. Smaller = more detail, more CPU. |
| `loopRebuildThreshold` | Double | `0.15` m | Rebuild grid on loop closure only when SLAM correction exceeds this. `0` = always, `999` = never. |
| `autoDetectCamHeight` | Bool | `true` | Use LiDAR to auto-detect camera height above floor. |
| `gridCameraHeight` | Double | `10` cm | Fallback camera height when auto-detect has no reading. |
| `gridMaxObstHeight` | Double | `2` cm | Obstacles shorter than this are ignored (robot drives over them). |
| `gridRobotHeight` | Double | `50` cm | Points above this height are ignored (ceiling, mounted hardware). |
| `gridMapInterval` | Double | `1.0` s | Map rebuild interval. Keep ≥ 1 s for large maps. |
| `gridNormalsSegmentation` | Bool | `true` | Classify ground by surface normal angle. Detects stairs and drop-offs. |

---

## Robot body

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `robotBodyLength` | Double | — | Robot body length (cm). Used for footprint inflation. |
| `robotBodyWidth` | Double | — | Robot body width (cm). |
| `cameraFromLeft` | Double | — | Camera offset from robot centre-left (cm). |

---

## Camera and publishing rates

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `cameraSkip` | Int | `4` | Publish 1-in-N ARKit frames for camera topics (~4 Hz at default). |
| `imuSkip` | Int | `4` | Publish 1-in-N IMU samples. Default: 100 Hz ÷ 4 = 25 Hz. |
| `odomSkip` | Int | `2` | Publish 1-in-N odometry frames. Default: ~17 Hz ÷ 2 ≈ 8 Hz. |
| `imageTargetWidth` | Int | `320` | Target width (px) for RGB image resize before publish. |
| `jpegQuality` | Double | `0.75` | JPEG quality for `/camera/image_raw/compressed`. Range 0.0–1.0. |
| `topicCompressed` | Bool | `true` | Publish compressed image instead of raw. |
| `imuPublishThread` | Bool | `false` | Publish IMU on a dedicated background thread instead of the ARKit callback thread. Enable if IMU messages are jittery or delayed under heavy SLAM load. |

### Topic enable flags

Each flag is a Bool. Set to `false` to stop publishing that topic.

| Key | Default | Topic | Notes |
|-----|---------|-------|-------|
| `topicIMU` | `true` | `/imu/data` | ~25 Hz at default `imuSkip` |
| `topicGPS` | `true` | `/fix` | ARKit location, low rate |
| `topicOdom` | `true` | `/odom` | ~8 Hz at default `odomSkip` |
| `topicTF` | `true` | `/tf` | Transform tree, published with odometry |
| `topicTFStatic` | `true` | `/tf_static` | Static frames, published once on connect |
| `topicImage` | `false` | `/camera/image_raw` or `/camera/image_raw/compressed` | High bandwidth — keep disabled unless needed |
| `topicDepth` | `true` | `/camera/depth/image_raw` | Raw 16-bit depth image |
| `topicCamInfo` | `true` | `/camera/camera_info` | Intrinsics, required for 3D tools |
| `topicPoints` | `true` | `/camera/depth/points` | Per-frame point cloud (~4 Hz) |
| `topicMap` | `true` | `/map` | Occupancy grid, rebuilt at `gridMapInterval` |
| `topicCostMap` | `true` | `/cost_map` | Inflated cost map for navigation |
| `topicCleanPlan` | `true` | `/clean_plan` | Coverage path, Autonomous IDD only |
| `topicCleanMap` | `true` | `/clean_map` | Cleaned-area map, Autonomous IDD only |
| `topicPhoneHeight` | `true` | `/phone/height` | LiDAR-measured phone height above floor |
| `topicDiag` | `true` | `/diag/*` | CPU, RAM, speed, yaw rate at 0.1 Hz |
| `topicRobotDesc` | `true` | `/robot_description` | URDF string, latched once on connect |
| `publishDebugLog` | `true` | `/debug` | ROS Log messages mirrored from OSLog |

> **`/cloud_map`** is enabled via `cloudMapEnabled` in **Settings → SLAM Quality**, not a topic flag. It is gated at the C++ bridge level — see [Configuration → Cloud map](configuration.md#cloud-map).

---

## Navigation (DriveManager)

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `driveMaxSpeedCmS` | Double | `20` | Max linear drive speed (cm/s). |
| `driveMaxTurnDPS` | Double | `60` | Max turn rate (deg/s). |
| `driveCleanSpeedCmS` | Double | `10` | Speed during clean mode (cm/s). Slower than explore for better coverage overlap. |
| `driveGoalTol` | Double | `0.15` m | Distance at which goal is declared reached. |
| `driveAllowUnknown` | Bool | `false` | Allow path planning through unknown (unmapped) cells. Enable for frontier exploration. |
| `driveUnknownCost` | Double | `10` | Cost penalty per unknown cell when `driveAllowUnknown` is on. Raise to make planner hug known space. |
| `costInflateRadiusM` | Double | `0.20` m | Obstacle inflation radius on cost map. Should be ≥ half of robot body width for safe clearance. |
| `wallCostWeight` | Double | `1.0` | Multiplier for wall-proximity penalty. Raise to push paths further from walls. |
| `driveStuckEnabled` | Bool | `true` | Enable stuck detection. Triggers recovery spin when robot stops making progress. |
| `driveStuckTimeout` | Double | `3.0` s | Seconds without progress before declaring stuck (normal speed). |
| `driveStuckFastTimeout` | Double | `1.0` s | Seconds without progress at fast speed before declaring stuck. |
| `driveLookaheadM` | Double | `0.40` m | Pure-pursuit lookahead distance. Larger = smoother but cuts corners. |
| `driveHeadingGain` | Double | `1.5` | Proportional gain for heading correction during straight drives. |
| `driveRotationTimeout` | Double | `5.0` s | Max seconds to rotate in-place toward a new goal before aborting. |

---

## Motor calibration

| Key | Description |
|-----|-------------|
| `calLinDeadband` | Linear speed deadband (below this, motor output = 0). |
| `calLinGain` | Linear speed scale factor. |
| `calLinMinCmS` / `calLinMaxCmS` | Min/max linear output clamps. |
| `calAngDeadband` | Angular speed deadband. |
| `calAngGain` | Angular speed scale factor. |
| `calAngMinDPS` | Min angular output. |
| `calYawDriftTrim` | Yaw drift trim (compensates hardware asymmetry). |
| `calStraightBiasRate` | Straight-line bias correction rate. |
| `calLinKp` / `calLinKi` | Linear PI gains. |
| `calAngKp` / `calAngKi` | Angular PI gains. |
| `driveLinPIEnabled` | Enable linear PI controller. |
| `driveAngPIEnabled` | Enable angular PI controller. |

---

## Autonomous behaviours

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `exploreTimeout` | Double | — | Max seconds per frontier attempt before moving on. |
| `exploreSpinDPS` | Double | — | Spin rate during explore recovery (deg/s). |
| `cleanAreaWidth` | Double | — | Coverage strip width for clean mode (m). |
| `cleanFanSpeed` | Double | — | Suction fan speed during clean (0.0–1.0). |
| `pickupPauseEnabled` | Bool | `true` | Pause SLAM when phone is lifted. |
| `pickupHeightThresh` | Double | `0.08` m | Height jump threshold for pickup detection. |

---

## Gamepad buttons

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `btnTopic0` | String | `/button/btn0` | Topic published when gamepad button 0 is pressed. |
| `btnTopic1` | String | `/button/btn1` | |
| `btnTopic2` | String | `/button/btn2` | |
| `btnTopic3` | String | `/button/btn3` | |

---

## Joystick / Control

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `joystickMaxLinear` | Double | `20` cm/s | Max forward speed sent by the on-screen joystick. |
| `joystickMaxAngular` | Double | `60` deg/s | Max turn rate from the on-screen joystick. |
| `cmdVelHz` | Double | `10` | Rate at which `/cmd_vel` is published while joystick is active (Hz). |
| `joystickCalibrated` | Bool | `false` | Set `true` after completing motor calibration — unlocks full speed range in autonomous mode. |

---

## Battery display

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `batteryMinV` | Double | `10.5` V | Voltage mapped to 0% on the battery bar. |
| `batteryMaxV` | Double | `12.6` V | Voltage mapped to 100%. Set to your pack's fully-charged voltage. |

---

→ [Configuration Keys](configuration.md) — Settings tab keys (mode, Zenoh, SLAM quality)  
→ [Data Tab — Maps & Config](data-tab.md) — save/load config and maps
