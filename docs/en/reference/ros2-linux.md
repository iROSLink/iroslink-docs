# ROS2 Teleoperation (Linux)

Drive the robot directly from a Linux machine using `rmw_zenoh_cpp` — no iROSLink Control tab needed.

---

## Prerequisites

- ROS2 Jazzy installed
- `rmw_zenoh_cpp` installed: `sudo apt install ros-jazzy-rmw-zenoh-cpp`
- ESP32 flashed and on the same WiFi network → [Build & Configure](../getting-started/build-robot/build-and-configure.md#esp32-firmware)
- iROSLink running in **Router** or **Client** mode → [Build & Configure](../getting-started/build-robot/build-and-configure.md#app-configuration)

---

## Clear stale ROS2 daemon

If you previously used a different RMW, clear it first:

```bash
pkill -9 -f ros && ros2 daemon stop
```

---

## Keyboard teleoperation

**Terminal 1 — Zenoh router** (skip if phone is in Router mode and you're connecting as client):
```bash
source /opt/ros/jazzy/setup.bash
ros2 run rmw_zenoh_cpp rmw_zenohd
```

**Terminal 2 — keyboard teleop:**
```bash
source /opt/ros/jazzy/setup.bash
export RMW_IMPLEMENTATION=rmw_zenoh_cpp
ros2 run teleop_twist_keyboard teleop_twist_keyboard
```

Use `i` / `,` to move forward/back, `j` / `l` to turn. `k` stops.

---

## Gamepad teleoperation

Install once:
```bash
sudo apt install ros-jazzy-teleop-twist-joy ros-jazzy-joy
```

Then run (hold **L1 / LB** enable button while moving the stick):

```bash
# Terminal 3 — joy driver
ros2 run joy joy_node

# Terminal 4 — teleop node
ros2 run teleop_twist_joy teleop_node --ros-args \
    -p axis_linear.x:=1 -p axis_angular.yaw:=0 \
    -p scale_angular.yaw:=1.0 -p enable_button:=4 \
    -p publish_stamped_twist:=false
```

`enable_button:=4` maps to L1/LB on most controllers. Adjust if your gamepad differs.

---

## Verify the robot receives commands

In a separate terminal:
```bash
export RMW_IMPLEMENTATION=rmw_zenoh_cpp
ros2 topic echo /cmd_vel
```

You should see `geometry_msgs/Twist` messages while driving. The ESP32 serial monitor also prints received commands:
```
>> cmd_vel  lin.x=0.500  ang.z=0.000  lag=3ms  10.0Hz
```

---

![RViz2 showing point cloud, occupancy map, and camera feed panels](../assets/images/rviz2/rviz_overview.webp){ .img-wide }


## Reference stack (Docker)

The [iroslink-docker]({{ config.extra.repos.docker }}) repo provides a ready-made ROS2 Jazzy environment with `rmw_zenoh_cpp`, Nav2, RViz2, and SLAM Toolbox pre-installed. Use it if you want to run a full custom nav stack on a laptop or Raspberry Pi without a native ROS2 install.

```bash
git clone https://github.com/iROSLink/iroslink-docker
cd iroslink-docker
docker compose up
```

Once the container is running, the commands on this page work inside it as-is.

---

## Further reading

For CDR wire format, drive mixing math, and ESC timing see `INTERNALS.md` in the [iroslink-esp32]({{ config.extra.repos.esp32 }}) repo.

→ [Build & Configure](../getting-started/build-robot/build-and-configure.md)  
→ [Zenoh Networking](zenoh-networking.md)  
→ [Troubleshooting](troubleshooting.md)
