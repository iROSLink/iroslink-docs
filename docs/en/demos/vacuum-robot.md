# Vacuum Robot

!!! info "Personal experiment"
    This started as my own experiment — I was curious whether a BLDC motor salvaged from a drone could generate enough suction to actually clean a floor. So far, it kind of works! 😄 But drone motors spinning at full speed are loud, fragile, and not designed for this. For anyone building this seriously, I'd recommend a **Handheld Vacuum Cleaner Kit** (the kind with a small brushless motor + nozzle already assembled, ~$35–55 on AliExpress) — much safer, quieter, and easier to mount. But again, I’m playing cheap and hope that people are going to download this app so I can make a more premium robot...

Turn your mapping robot into an autonomous vacuum cleaner. This demo adds a suction fan to the base build and unlocks **Explore** and **Clean** modes in iROSLink.

!!! note "Prerequisite"
    Complete [Build & Configure](../getting-started/build-robot/build-and-configure.md) first. This page covers only the additions.

---

## Additional hardware

| Component | Function | Approx. cost (USD) |
|-----------|----------|--------------------|
| Brushless suction fan | Generates suction | $3–8 |
| ESC (Electronic Speed Controller) | Drives the fan via PWM | $4–10 |
| Suction nozzle / shroud | Channels airflow | 3D print (see below) |

**Total addition: ~$10–20 USD**

---

## 3D printed parts

!!! info "Coming soon"
    Printable nozzle, shroud, and phone mount STL files will be released shortly. Watch the [iROSLink GitHub](https://github.com/iROSLink) for the release.

---

## Additional wiring

Connect the fan ESC signal wire to GPIO 19 on the ESP32. The ESC receives a standard 50 Hz PWM signal (1–2 ms pulse width).

| Signal | ESP32 GPIO |
|--------|-----------|
| Fan ESC signal | 19 |
| Battery ADC *(optional)* | 34 |

!!! note "Battery ADC"
    GPIO 34 is input-only. If you wire battery voltage monitoring, use a voltage divider to bring the voltage into the 0–3.3 V range the ADC expects.

### Updated circuit diagram

![Full wiring: ESP32 + L298N + two motors + fan ESC on GPIO 19](../assets/images/circuit_image.webp){ .img-diagram }

### Test the fan

Press the onboard **BOOT button** (GPIO 0) to toggle the fan between 50% throttle and off — useful for verifying ESC wiring without a ROS2 connection.

---

## What you can do

### Explore

The robot performs a 360° spin to orient itself, then autonomously navigates to unmapped frontier cells one by one — building a complete map of the space without any manual driving.

When the entire reachable area is mapped (or the time limit is reached), the robot returns to its starting position.

→ [Explore Mode](explore.md) — full setup and what to expect

---

### Clean

The robot drives a **boustrophedon** (back-and-forth zigzag) path across all mapped free space, running the suction fan throughout. Requires a completed map — run Explore first, or drive manually to map the area.

→ [Clean Mode](clean.md) — full setup, fan speed, and troubleshooting
