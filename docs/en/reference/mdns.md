# mDNS — Hostname Resolution

mDNS (Multicast DNS) lets devices on the same WiFi network find each other by name (`.local` hostnames) without a DNS server. iROSLink advertises itself as `<your-iphone-name>.local` so you can use a hostname instead of a raw IP.

---

## Platform support

| Platform | mDNS support | Notes |
|----------|-------------|-------|
| macOS | Built-in | Works immediately |
| Linux | Built-in (avahi) | `avahi-daemon` runs by default on most distros |
| Windows | Requires install | Install **Bonjour** (bundled with iTunes or [Apple Devices app](https://apps.microsoft.com/detail/9NP83LWLPZ9K)) |
| iOS / Android | Built-in | Works immediately |

---

## Test mDNS resolution with ping

Before connecting Foxglove or your ESP32, verify the hostname resolves from your machine.

### macOS / Linux

```bash
ping -c 4 myphone.local
```

Expected output:
```
PING myphone.local (192.168.1.42): 56 data bytes
64 bytes from 192.168.1.42: icmp_seq=0 ttl=64 time=3.2 ms
64 bytes from 192.168.1.42: icmp_seq=1 ttl=64 time=2.8 ms
...
```

The IP address in the parentheses (`192.168.1.42`) is what mDNS resolved to. Use that IP directly if you ever need to bypass mDNS.

Stop ping with `Ctrl+C`.

### Windows (PowerShell)

```powershell
ping myphone.local
```

If Bonjour is installed and the phone is on the same network you'll see replies. If you see `Ping request could not find host myphone.local`, Bonjour is not installed or the phone is on a different subnet.

---

## Common failures

**`ping: cannot resolve myphone.local: Name or service not known`**  
→ mDNS not available. On Linux, check `systemctl status avahi-daemon`. On Windows, install Bonjour.

**Timeout (no reply, no error)**  
→ Hostname resolved but phone is blocking ICMP. Rare on iOS. More likely the hostname resolved to the wrong IP — check that phone and computer are on the **same WiFi network** (not one on 2.4 GHz and the other on 5 GHz with client isolation enabled).

**Wrong IP resolved**  
→ Stale mDNS cache. Flush it:
```bash
# macOS
sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder

# Linux
sudo systemctl restart avahi-daemon
```

**IP changes after reboot**  
→ DHCP assigns a new IP. mDNS always resolves to the current IP — use the `.local` hostname everywhere instead of hardcoding an IP. If the ESP32 uses a hardcoded IP for the Zenoh router, set a DHCP reservation for the phone's MAC address in your router settings.

---

## Find the phone's hostname

The hostname is your iPhone's name (Settings → General → About → Name) with spaces replaced by hyphens and `.local` appended. Example: `"Quoc's iPhone"` → `quocs-iphone.local`.

iROSLink also shows the full address in **Settings → Foxglove WebSocket Server** and **Settings → ROS2 Bridge (Zenoh)**.

---

## Using iPhone Hotspot

iPhone hotspot is often the most reliable WiFi option — the phone acts as its own router with a direct connection to the ESP32, eliminating any home router quality issues.

**Setup:**

1. On iPhone: **Settings → Personal Hotspot → Allow Others to Join** → toggle on
2. Set a hotspot password you'll remember
3. On the ESP32, update `secret.h` with the hotspot credentials (→ [full secret.h setup](../getting-started/build-robot/build-and-configure.md#add-wifi-credentials)):
    ```c
    #define WIFI_NETWORKS \
        { "Your iPhone Name", "yourpassword" }   // iPhone name exactly as shown in Settings

    #define ROUTER_MDNS_HOST "iphone"   // phone mDNS name — fallback IP 172.20.10.1 used if mDNS fails
    ```
4. Re-flash the ESP32 (→ [flash instructions](../getting-started/build-robot/build-and-configure.md#flash))
5. In iROSLink → Settings → ROS2 Bridge (Zenoh): select **Router** mode — your phone's hotspot IP (`172.20.10.1`) is shown there

!!! note "mDNS on hotspot"
    mDNS (`.local` hostnames) may not resolve reliably on some ESP32 or desktop clients connected via hotspot. If peer count stays 0, use the raw IP `172.20.10.1` in `ZENOH_ROUTER` instead of the mDNS hostname.

!!! tip "Battery note"
    Running hotspot + iROSLink simultaneously drains the battery faster. Plug into USB power if doing long sessions.

---

## Back to setup

→ [Sensor Preview](../getting-started/sensor-preview.md) — connect Foxglove  
→ [Build & Configure](../getting-started/build-robot/build-and-configure.md#app-configuration) — configure Zenoh  
→ [Troubleshooting](troubleshooting.md) — connection issues
