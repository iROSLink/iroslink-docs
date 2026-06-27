# Getting Started
!!! tip "Questions or bugs?"
    Hi, this is iROSLink's first public release. Report bugs to bugs@iroslink.app or reach out directly to me at quoc@iroslink.app. PRs to this doc are very welcome.

While your phone CPU is capable of launching thousands of rockets to the moon, why not use that power to learn some robotics, discover your house, or even build useful robots. This app is designed so that your iPhone can be mounted on a differential-drive robot, publishing live sensor data over WiFi — and ultimately navigating the robot autonomously.

---

## What's powering this

iROSLink is built based on **[ROS2](https://www.ros.org)** (Robot Operating System 2, Jazzy release) — the industry-standard middleware used in real-world robots. You don't need to know ROS2 to use the app, but here's what's happening under the hood:

- **Topics** — named data channels. The phone publishes sensor data on topics like `/camera/image_raw` or `/imu/data`; any device on the same network can subscribe and receive that data in real time.
- **[SLAM](https://en.wikipedia.org/wiki/Simultaneous_localization_and_mapping)** — the phone builds a map of the space while figuring out its own position within that map, using LiDAR + camera together.
- **[Foxglove](https://foxglove.dev)** — a free robotics visualisation tool. iROSLink has a built-in WebSocket server so Foxglove can connect directly to the phone and display live sensor data (point cloud, camera, IMU) without any ROS2 installation on your laptop.

iROSLink handles all navigation — SLAM, path planning, and motor commands — entirely on the phone. Ideally, for simple tasks (mapping a room, autonomous cleaning), the app + ESP32 firmware is all you need.

??? note "For advanced users — custom nav stack on Linux"
    Because iROSLink publishes standard ROS2 Jazzy topics, you can replace or extend any part of the stack. Run `rmw_zenoh_cpp` on a Linux machine to receive all topics as native ROS2 messages, then plug in your own SLAM, planner, or controller.

    → [ROS2 Teleoperation (Linux)](../reference/ros2-linux.md)

---

## Your first robot? — step by step

We recommend this order. Seeing it work before building any hardware makes the rest of the process less frustrating.

### Phase 1 — Sensor Preview (15 min, no hardware)

- [ ] Install iROSLink from the App Store on iPhone Pro (12/13/14/15)
- [ ] Open app → grant Camera + Local Network permissions
- [ ] Settings → Foxglove WebSocket Server → enable → note the address (e.g. `ws://myphone.local:8765`)
- [ ] Open [Foxglove Studio](https://studio.foxglove.dev) → Open Connection → Foxglove WebSocket → enter address
- [ ] Scan tab → start session → add a **3D panel** in Foxglove
- [ ] Move phone → see live point cloud

→ [Detail Sensor Preview guide](sensor-preview.md)

### Phase 2 — Flash ESP32 Firmware (15 min)

- [ ] Clone [iroslink-esp32](https://github.com/iROSLink/iroslink-esp32) repo
- [ ] Install PlatformIO (VS Code extension)
- [ ] Copy `secret.h.template` → `secret.h`
- [ ] Edit `secret.h` — set `WIFI_NETWORKS` and `ROUTER_MDNS_HOST` (phone's mDNS name, e.g. `"iphone"`)
- [ ] Connect ESP32 via USB → Flash via PlatformIO → open Serial Monitor
- [ ] Verify: `Connecting to WiFi... OK` then `Opening Zenoh Session... OK`

→ [Detail Build & Configure guide](build-robot/build-and-configure.md)

### Phase 3 — Zenoh Connection (5 min)

- [ ] iROSLink → Settings → ROS2 Bridge (Zenoh) → select **Router** mode
- [ ] Confirm ESP32 connects — robot connection indicator in Settings tab shows connected (Autonomous IDD mode)
- [ ] Control tab → drag joystick → Serial Monitor shows `>> cmd_vel` messages

### Phase 4 — Wire Motors + Mount Phone (1–2 hours)

- [ ] Wire L298N to ESP32 GPIO: 25/33 (left motor), 26/27 (right motor)
- [ ] Connect motors to L298N outputs; connect battery
- [ ] Check motor polarity before full power-on
- [ ] Mount phone landscape (camera facing forward, flat rigid mount)
- [ ] Measure camera height above floor (or enable Auto-detect in app)

### Phase 5 — Drive & Calibrate (30–60 min)

- [ ] Scan tab → start SLAM session
- [ ] Drive robot manually for 1–2 min — watch map build in Foxglove
- [ ] Control tab → Actions → **Calibrate** → stand back for 60–120 s
- [ ] Verify calibration gains are between 1–300
- [ ] Publish a goal pose from Foxglove → robot drives to it autonomously

→ [Full Drive & Calibrate guide](build-robot/drive-and-calibrate.md)

!!! tip "Already have a robot?"
    Skip Phases 2–4 and go straight to [Drive & Calibrate](build-robot/drive-and-calibrate.md).

---

## Quick jargon reference

| Term | Plain English |
|------|--------------|
| **SLAM** | Phone maps the room while tracking its own position (LiDAR + camera) |
| **Zenoh** | Data transport protocol — how phone talks to robot and laptop |
| **Peer count** | Devices connected to iROSLink (ESP32 = 1, desktop = 1) |
| **cmd_vel** | Motor speed + turn command sent to the ESP32 |
| **Occupancy grid** | 2D top-down map — white = free space, black = wall, grey = unknown |
| **mDNS** | Device name resolution (e.g. `myphone.local`) instead of raw IP |
| **Router mode** | Phone is the hub; ESP32 and laptop connect to it |
| **Frontier** | Edge between mapped and unmapped space — where Explore mode drives next |

---

## What the phone provides

| Sensor | Topic | Notes |
|--------|-------|-------|
| Visual-inertial odometry | `/odom`, `/tf` | ARKit, ~17 Hz |
| LiDAR depth | `/camera/depth/image_raw`, `/camera/depth/points` | ~4 Hz |
| RGB camera | `/camera/image_raw/compressed` | ~4 Hz, configurable |
| IMU (accel + gyro) | `/imu/data` | ~25 Hz |
| GPS | `/fix` | ~1 Hz, outdoor only |

Full topic list: → [ROS2 Topics reference](../reference/topics.md)

---

## Prerequisites

- iPhone 12 Pro, 13 Pro, 14 Pro, or 15 Pro (or any Pro Max variant). These are the models with a LiDAR sensor — required for depth mapping and SLAM.
- macOS / Linux / Windows laptop on the same WiFi network with Foxglove (can use web version or app).

!!! tip "Recommended networking setup"
    In Settings → ROS2 Bridge (Zenoh), select **Router** mode. This makes the phone the network hub — the simplest setup for beginners. Other devices (ESP32 robot, laptop) connect to the phone's IP address.
    → [Zenoh Networking explained](../reference/zenoh-networking.md)

!!! tip "WiFi quality matters"
    iROSLink streams LiDAR, camera, IMU, and odometry simultaneously — the data rate is higher than most IoT devices. A decent router handles this fine, but old or budget routers can drop packets or corrupt data under the load, causing missed sensor updates or SLAM instability.

    **iPhone hotspot works well** and is often the most reliable option since the phone acts as its own router with a direct connection to the ESP32. If you see frequent disconnections or erratic sensor data, try switching to hotspot before blaming the firmware.

    → [Hotspot setup guide](../reference/mdns.md#using-iphone-hotspot)

