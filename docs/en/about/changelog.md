# Changelog

Version numbers match the App Store release. All repos (bridge, ESP32, docs) use the same tag on release.

---

## v0.1

*Initial release.*

### App

- Sensor Bridge mode: publishes IMU, GPS, odometry, TF, camera (RGB + compressed + camera_info), LiDAR depth, and point cloud over Zenoh.
- Autonomous IDD mode: RTAB-Map SLAM, 2D occupancy grid, cost map, boustrophedon coverage clean, frontier-based exploration, pure-pursuit path following.
- Pickup detection: pauses SLAM when phone is lifted off the robot.
- Diagnostics: CPU, RAM, speed, and yaw rate published at 0.5 Hz.
- Config export / import / reset.
- Gamepad button topics (4 configurable buttons + stop).
- Remote commands via `/command` topic.

### Bridge

- `zenoh_foxglove_bridge.py`: pure Python bridge from Zenoh to Foxglove WebSocket. No ROS2 required.
- Docker setup ([iroslink-docker]({{ config.extra.repos.docker }})) using `ros-jazzy-foxglove-bridge` as an alternative.

### ESP32 firmware

- Receives `/cmd_vel` and `/suction_fan/speed` over Zenoh via zenoh-pico.
- Publishes `/battery/voltage` every 10 s.
- mDNS router discovery with fallback to gateway and static IP.
- Boot button toggles fan for hardware testing.

### Docs

- Getting started guide.
- ROS2 topic reference.
- Configuration key reference.
- Hardware wiring guide.
- ESP32 firmware setup.
