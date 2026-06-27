# Remote Commands

Publish `std_msgs/String` to the `/command` topic to control iROSLink remotely from your ROS2 graph.

---

## Command table

| Command | Effect |
|---------|--------|
| `explore` | Start autonomous exploration. Starts SLAM if not already running. |
| `stop_explore` | Stop exploration. Robot halts. |
| `clean` | Start coverage clean. Starts SLAM if not already running. |
| `clean_stop` | Stop coverage clean. |
| `cancel` | Cancel the current drive goal. Robot stops in place. |
| `pause` | Pause the AR/SLAM session. Publishing stops. |
| `resume` | Resume a paused AR/SLAM session. |
| `reset` | Reset the AR/SLAM session. Map is cleared and tracking restarts from the current position. |

---

## Example usage

```bash
# With ROS2 + rmw_zenoh_cpp:
export RMW_IMPLEMENTATION=rmw_zenoh_cpp
ros2 topic pub --once /command std_msgs/String "data: 'explore'"
```

---

## Notes

- `explore` and `clean` require **Autonomous IDD** mode. In Sensor Bridge mode, these commands are ignored.
- `reset` clears the current map. This cannot be undone from within the session. Save the map first if you want to keep it (**Data tab → Save Map**).
- Commands are processed on the main thread. There may be a short delay (< 1 s) between publishing and the app responding, depending on phone load.
