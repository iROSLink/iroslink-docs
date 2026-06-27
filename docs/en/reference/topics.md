# ROS2 Topics

All topics use Zenoh as the transport layer. The phone acts as the bridge between ARKit/sensors and the ROS2 graph.

---

## Published by the phone → robot / ROS2 graph

### Sensors

| Topic | Type | Hz | Description |
|-------|------|----|-------------|
| `/imu/data` | `sensor_msgs/Imu` | ~25 | Accelerometer + gyroscope from CoreMotion. Frame: `imu_link`. |
| `/fix` | `sensor_msgs/NavSatFix` | ~1 | GPS coordinates from CoreLocation. |
| `/odom` | `nav_msgs/Odometry` | ~8 | ARKit visual-inertial odometry pose. Frame: `odom` → `base_link`. |
| `/tf` | `tf2_msgs/TFMessage` | ~8 | Live transforms: `odom → base_link`, `base_link → camera_link`. |
| `/tf_static` | `tf2_msgs/TFMessage` | latched | Static camera extrinsics. Published once on connect. |

### Camera

| Topic | Type | Hz | Description |
|-------|------|----|-------------|
| `/camera/image_raw` | `sensor_msgs/Image` (rgb8) | ~4 | RGB frames, vImage-scaled to target width. Debug only. |
| `/camera/image_raw/compressed` | `sensor_msgs/CompressedImage` (JPEG) | ~4 | JPEG frames. GPU-encoded via CoreImage Metal. |
| `/camera/camera_info` | `sensor_msgs/CameraInfo` | ~4 | Intrinsic calibration for `/camera/image_raw`. |
| `/camera/depth/image_raw` | `sensor_msgs/Image` (32FC1) | ~4 | LiDAR depth map at 256×192, values in metres. |
| `/camera/depth/points` | `sensor_msgs/PointCloud2` | ~4 | Incremental RTAB-Map point cloud delta (new nodes only). |

*Rate is controlled by the Camera divisor setting (default: 1-in-4 of ~17 Hz ≈ 4 Hz).*

### Maps (Autonomous IDD mode only)

| Topic | Type | Hz | Description |
|-------|------|----|-------------|
| `/map` | `nav_msgs/OccupancyGrid` | ~1 | 2D occupancy grid built from the LiDAR point cloud. Latched. |
| `/cost_map` | `nav_msgs/OccupancyGrid` | ~1 | Inflated `/map` for path planning. Latched. |
| `/clean_map` | `nav_msgs/OccupancyGrid` | on update | Coverage tracking grid for clean mode. Latched. |
| `/cloud_map` | `sensor_msgs/PointCloud2` | on loop closure | Full accumulated point cloud. Expensive — off by default. |

### Navigation (Autonomous IDD mode only)

| Topic | Type | When | Description |
|-------|------|------|-------------|
| `/cmd_vel` | `geometry_msgs/Twist` | continuous | Drive commands from DriveManager (explore, clean, joystick, calibration). Zero-published on pause/background. |
| `/plan` | `nav_msgs/Path` | on goal set | Current planned path to goal. |
| `/clean_plan` | `nav_msgs/Path` | on clean start | Planned coverage path for clean mode. |
| `/suction_fan/speed` | `std_msgs/Float32` | on change | Fan speed command (0.0–1.0). |
| `/robot_description` | `std_msgs/String` | latched | URDF robot description. Published once on connect. |

### Diagnostics

| Topic | Type | Hz | Description |
|-------|------|----|-------------|
| `/diag/cpu_percent` | `std_msgs/Float32` | 0.5 | Phone CPU usage (%). |
| `/diag/ram_mb` | `std_msgs/Float32` | 0.5 | Phone RAM usage (MB). |
| `/diag/speed_cmps` | `std_msgs/Float32` | 0.5 | Robot linear speed (cm/s). |
| `/diag/yaw_rate_dps` | `std_msgs/Float32` | 0.5 | Robot yaw rate (deg/s). |
| `/phone/height` | `std_msgs/Float32` | ~5 | Camera height above floor in metres (LiDAR-detected). Debug only. |
| `/debug` | `rcl_interfaces/Log` | on event | App log messages (autonomy events, drive, explore, clean). |

### Gamepad buttons (configurable)

| Topic | Type | Default | Description |
|-------|------|---------|-------------|
| `<btn0>` | `std_msgs/Bool` | `/button/btn0` | Published `true` on press. Topic configurable in Control tab. |
| `<btn1>` | `std_msgs/Bool` | `/button/btn1` | |
| `<btn2>` | `std_msgs/Bool` | `/button/btn2` | |
| `<btn3>` | `std_msgs/Bool` | `/button/btn3` | |
| `<stop>` | `std_msgs/Bool` | `/robot/stop` | Stop button. Topic configurable in Control tab. |

---

## Subscribed by the phone ← robot / ROS2 graph

| Topic | Type | Description |
|-------|------|-------------|
| `/move_base_simple/goal` | `geometry_msgs/PoseStamped` | Navigation goal. Phone drives robot to the target position and yaw. |
| `/command` | `std_msgs/String` | High-level commands. See [Remote Commands](commands.md). |
| `/battery/voltage` | `std_msgs/Float32` | Battery voltage from the robot. Displayed in the Control tab. |

---

## Data flow

```
ARKit (camera + LiDAR + IMU)
    │
    ├─► SensorManager ──────────────────► /imu/data, /fix
    │
    ├─► ARManager (RTAB-Map SLAM)
    │       │
    │       ├─► /odom, /tf, /tf_static
    │       ├─► /camera/image_raw, /camera/camera_info
    │       ├─► /camera/depth/image_raw
    │       ├─► /camera/depth/points  (incremental)
    │       ├─► /cloud_map            (full, on loop closure)
    │       └─► MapManager
    │               │
    │               ├─► /map          (2D occupancy grid)
    │               ├─► /cost_map     (inflated)
    │               └─► /clean_map    (coverage tracking)
    │
    ├─► DriveManager ──────────────────► /cmd_vel, /plan
    │       ▲
    │       ├─ ExploreManager ─────────► /cmd_vel (via DriveManager)
    │       └─ CleanManager ──────────► /cmd_vel, /suction_fan/speed, /clean_plan
    │
    └─► SystemMonitor ──────────────────► /diag/*
```

---

## Notes

- **Latched topics** (`/map`, `/cost_map`, `/clean_map`, `/robot_description`, `/tf_static`): the last message is re-delivered to new subscribers automatically.
- **Background / screen lock**: all publishing stops. The Zenoh socket remains open in client mode; router mode disconnects.
- **Sensor Bridge mode**: `/map`, `/cost_map`, and all in-app navigation outputs are disabled. Sensor topics remain active.

---

## Tuning topic rates and image quality

Defaults work for most setups. Adjust in the **Topics** tab if:

- Slow WiFi → lower image resolution or disable `/camera/image_raw`
- Maximum SLAM accuracy → reduce `imuSkip` to keep IMU at full rate
- Sensors only, no camera → disable image topics entirely

| Setting | Default | Effect |
|---------|---------|--------|
| IMU skip | 4 | 100 Hz ÷ 4 = **25 Hz** |
| Camera skip | 4 | ~17 Hz ÷ 4 ≈ **4 Hz** |
| Odom skip | 2 | ~17 Hz ÷ 2 ≈ **8 Hz** |
| Image width | 320 px | Quality vs bandwidth |
| JPEG quality | 75% | Higher = more data |

<div style="display:flex;gap:12px;align-items:flex-start;margin:16px auto;max-width:480px">
<img src="../assets/images/phone_screens/topic_view_imu.webp" style="width:48%;border-radius:8px" alt="Topics tab showing list of ROS2 topics with on/off toggles">
<img src="../assets/images/phone_screens/topic_view_rate_divisors_image_quality.webp" style="width:48%;border-radius:8px" alt="Topics tab showing Rate Divisors and Image Quality sliders">
</div>
