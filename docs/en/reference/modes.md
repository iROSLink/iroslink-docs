# Operating Modes

iROSLink has two operating modes. Choose based on whether you want to bring your own navigation stack or use the one built into the app.

---

## Sensor Bridge

The phone publishes all sensor data to the ROS2 graph. No in-app autonomy runs. You are responsible for navigation.

**Use this when:**  
- You have an existing Nav2 stack or custom navigation code.  
- You want raw sensor access without any in-app processing affecting the data flow.  
- You are developing or debugging your own planner.  

**What the phone publishes in this mode:**

| Topic | Type | Notes |
|-------|------|-------|
| `/odom` | `nav_msgs/Odometry` | ARKit VIO |
| `/tf`, `/tf_static` | `tf2_msgs/TFMessage` | Coordinate frames |
| `/camera/depth/points` | `sensor_msgs/PointCloud2` | LiDAR point cloud |
| `/camera/depth/image_raw` | `sensor_msgs/Image` | Depth map |
| `/imu/data` | `sensor_msgs/Imu` | Accelerometer + gyro |
| `/fix` | `sensor_msgs/NavSatFix` | GPS |
| `/camera/image_raw/compressed` | `sensor_msgs/CompressedImage` | RGB (if enabled) |

**What is disabled:**
`/map`, `/cost_map`, and in-app navigation outputs (explore, clean, joystick).

Your nav stack publishes `geometry_msgs/Twist` to `/cmd_vel`. The ESP32 firmware drives the motors from that.

---

## Autonomous IDD

The app handles SLAM, occupancy grid mapping, path planning, and autonomous navigation. This is the full in-app stack.

**Use this when:**  
- You want the phone to drive the robot without a separate ROS2 machine running Nav2.  
- You are running the coverage clean or autonomous exploration features.  

**What is active in addition to Sensor Bridge topics:**

| Topic | Type | Notes |
|-------|------|-------|
| `/map` | `nav_msgs/OccupancyGrid` | Built from LiDAR by MapManager |
| `/cost_map` | `nav_msgs/OccupancyGrid` | Inflated map for path planning |
| `/plan` | `nav_msgs/Path` | Current path to goal |
| `/cmd_vel` | `geometry_msgs/Twist` | Drive commands from DriveManager |
| `/clean_plan` | `nav_msgs/Path` | Coverage path (clean mode) |
| `/clean_map` | `nav_msgs/OccupancyGrid` | Coverage tracking grid |

**Autonomous behaviours:**

- **Explore** — autonomously navigates toward unexplored frontiers until no new area is reachable.
- **Clean** — follows a boustrophedon (lawnmower) path across the mapped free space. Fan speed is configurable.
- **Goal navigation** — publish `geometry_msgs/PoseStamped` to `/move_base_simple/goal` to send the robot to a target pose.
- **Pickup detection** — SLAM pauses automatically if the phone is lifted off the robot (LiDAR detects a height jump).

**Known limitations:**
- Autonomous navigation is tuned for indoor flat floors. Ramps and thick carpets affect odometry.
- Coverage clean requires a reasonably complete initial map. Run explore first if the space is new.
- In Autonomous IDD mode, `/cmd_vel` is controlled by the app. External commands to `/cmd_vel` are overridden.

---

## Switching modes

Go to **Settings → Operating Mode**. The change takes effect immediately. You do not need to restart SLAM or reconnect Zenoh.

---

## Notes

- Both modes publish diagnostics (`/diag/*`) topic if enabled.
- Background / screen lock: all publishing stops when the app goes to the background. Keep the screen on during operation (**Settings → Display → Keep screen on**).
