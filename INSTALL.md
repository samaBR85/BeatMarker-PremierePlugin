# Installation — BeatMarker

Step-by-step guide to install BeatMarker in Adobe Premiere Pro.

## Requirements

- **Adobe Premiere Pro 25.0** or later (Creative Cloud 2025+)
- **Windows 10/11** or **macOS** — the same `.ccx` file works on both systems
- Audio files in **WAV** format (any sample rate, 8/16/24/32-bit)

> 💡 **Still on an older version of Premiere?** Update via Adobe Creative Cloud Desktop before proceeding. Check your version at **Help → About Premiere Pro**.

## Step by step

### 1. Download the plugin

Go to the [Releases page](https://github.com/samaBR85/BeatMarker-PremierePlugin/releases) and download the `.ccx` file from the latest release.

### 2. Close Premiere Pro

If it's open, close it completely before installing. This avoids conflicts during installation.

### 3. Install the plugin

**Easiest method — double-click:**

Double-click the downloaded `.ccx` file. **Creative Cloud Desktop** opens automatically and asks if you want to install. Confirm and wait for the success message.

**Alternative method — via Creative Cloud Desktop:**

- Open **Adobe Creative Cloud Desktop**
- Go to **Stock & Marketplace** → **Plugins** → **Manage plugins**
- Click **"Install plugin from file"** and select the downloaded `.ccx`

### 4. Open Premiere Pro

Launch Premiere normally.

### 5. Open the BeatMarker panel

In the top menu: **Window** → **Extensions** → **BeatMarker**

The panel can be docked anywhere in the interface, like any other Premiere panel. The UI language is automatically detected from your system settings (English or Portuguese).

## How to use

1. Import your **WAV** file into Premiere's media panel
2. Select the audio clip in the Project panel
3. In the BeatMarker panel, click **"Analyze Selected Clip"**
4. Wait for the analysis — colored markers will appear on the source clip:
   - 🔴 **Red** — beat 1 (downbeat)
   - 🔵 **Blue** — beats 2 and 4
   - 🟡 **Yellow** — beat 3
5. Play back and check if beat "1" landed correctly. If not, use the **◀ ▶** buttons to shift the phase without re-analyzing
6. To clean up, click **"Remove Markers"** — only BeatMarker markers are removed, your manual markers stay intact

## Uninstallation

- Open **Adobe Creative Cloud Desktop**
- Go to **Stock & Marketplace** → **Plugins** → **Manage plugins**
- Find **BeatMarker** in the list and click **Uninstall**

## Common issues

**"The plugin doesn't appear in Window → Extensions"**
Restart Premiere after installation. If it persists, confirm at **Help → About Premiere Pro** that your version is 25.0 or later.

**"I can't analyze my MP3 file"**
This version only supports **WAV** files. To convert an MP3 to WAV, use Premiere itself: **File → Export → Media**, choose WAV format, export, and import the result.

**"Beat 1 is in the wrong place"**
Use the **◀ ▶** buttons in the panel to adjust the phase. Each click shifts the numbering by one beat — the adjustment is instant, no need to re-analyze.

**"The analysis is taking too long"**
Long files (full songs) may take a few seconds to process. The UI is blocked during analysis — this is normal. A 3–4 minute WAV file usually finishes in under 30 seconds.

**"The .ccx file doesn't open when I double-click it"**
Make sure Creative Cloud Desktop is installed and up to date. If it still doesn't work, use the alternative installation method via Creative Cloud Desktop.

## Support

Found a bug or have a suggestion? Open an [Issue](https://github.com/samaBR85/BeatMarker-PremierePlugin/issues) including:

- Operating system (Windows or macOS + version)
- Premiere Pro version
- BeatMarker version
- Description of the problem and steps to reproduce
