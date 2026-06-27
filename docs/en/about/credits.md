# Credits

iROSLink is built on top of several open-source projects and third-party services. We are grateful to the people who build and maintain them.


## Open-source libraries

| Library | License | What it does in iROSLink |
|---------|---------|--------------------------|
| [RTABMap](https://github.com/introlab/rtabmap) | BSD 3-Clause | Real-time SLAM, loop closure detection, graph optimisation |
| [Zenoh](https://github.com/eclipse-zenoh/zenoh) | Apache 2.0 / MIT | ROS2 transport over WiFi |
| [ROS 2](https://github.com/ros2) | Apache 2.0 | Robotics framework, message definitions |
| [Foxglove SDK](https://github.com/foxglove/foxglove-sdk) | MIT | CDR encoding for sensor messages; Foxglove WebSocket v1 protocol |
| [swift-ros2](https://github.com/youtalk/swift-ros2) | Apache 2.0 | Native Swift ROS2 client — message types and pub/sub primitives |

### RTABMap

RTABMap (Real-Time Appearance-Based Mapping) is developed by Mathieu Labbé and the IntRoLab group at Université de Sherbrooke. Without it, the SLAM and loop closure features in iROSLink would not exist.

- GitHub: [introlab/rtabmap](https://github.com/introlab/rtabmap)
- Copyright: Mathieu Labbé, IntRoLab

### Zenoh

Zenoh is an Eclipse Foundation project developed by the ZettaScale team. It replaces the DDS transport layer in ROS2 with a lower-latency, WiFi-friendly protocol.

- GitHub: [eclipse-zenoh/zenoh](https://github.com/eclipse-zenoh/zenoh)
- Website: [zenoh.io](https://zenoh.io)

### ROS 2

ROS 2 (Robot Operating System 2) is the robotics framework that iROSLink publishes topics to. The message definitions (`sensor_msgs`, `nav_msgs`, `geometry_msgs`, etc.) are all from the ROS 2 ecosystem.

- GitHub: [ros2](https://github.com/ros2)
- Website: [ros.org](https://www.ros.org)

### Foxglove SDK

The [Foxglove SDK](https://github.com/foxglove/foxglove-sdk) is used in two ways inside iROSLink:

1. **CDR encoding** — sensor messages (IMU, GPS, Odometry, maps, TF, camera, etc.) are encoded into CDR format using the Foxglove SDK before being streamed over WebSocket.
2. **Foxglove WebSocket v1 protocol** — iROSLink includes a native Swift implementation of the Foxglove WebSocket server protocol, based on the protocol specification from the Foxglove SDK.

- GitHub: [foxglove/foxglove-sdk](https://github.com/foxglove/foxglove-sdk)
- Credit: Foxglove, Inc.

iROSLink is not affiliated with Foxglove.

### swift-ros2

[swift-ros2](https://github.com/youtalk/swift-ros2) is a native Swift client library for ROS 2, developed by Yutaka Kondo (youtalk). It provides ROS2 message types, CDR serialization, and Zenoh publish/subscribe without requiring the rcl/rclcpp stack — making it suitable for iOS where the C++ ROS2 stack cannot run.

- GitHub: [youtalk/swift-ros2](https://github.com/youtalk/swift-ros2)
- Credit: Yutaka Kondo

---

## Third-party services

### Foxglove Studio

[Foxglove Studio](https://foxglove.dev) is the recommended visualization tool for iROSLink data. It is available as a web app at [studio.foxglove.dev](https://studio.foxglove.dev) and as a desktop app. Connect directly to the phone using the built-in Foxglove WebSocket server — no additional bridge software required.

Foxglove Studio is free for individual use. See [foxglove.dev/pricing](https://foxglove.dev/pricing) for details.

---

## Apple frameworks

The following Apple frameworks are used internally and do not require separate attribution, but are worth mentioning for context:

- **ARKit** — visual-inertial odometry and device tracking
- **CoreMotion** — IMU data (accelerometer, gyroscope)
- **CoreLocation** — GPS
- **Metal / CoreImage** — GPU-accelerated image encoding

These are proprietary Apple frameworks available on iOS.

---

## iROSLink Repositories

| Repo | URL | What it is |
|------|-----|-----------|
| **iroslink-esp32** | [github.com/iROSLink/iroslink-esp32]({{ config.extra.repos.esp32 }}) | ESP32 firmware — subscribes to `/cmd_vel` via Zenoh, drives motors |
| **iroslink-docker** | [github.com/iROSLink/iroslink-docker]({{ config.extra.repos.docker }}) | Docker bridge — optional ROS2 Zenoh router for desktop use |
| **iroslink-docs** | [github.com/iROSLink/iroslink-docs]({{ config.extra.repos.docs }}) | This documentation site |
