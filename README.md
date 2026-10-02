# Counter Lab — SF6 Drill Editor

Counter Lab is a community-made visual editor for training drills created with the
[SF6 Training Drill Share mod](https://www.nexusmods.com/streetfighter6/mods/3966).

The mod makes it possible to record, export, and share custom training situations in
Street Fighter 6. However, creating precise sequences may require recording them manually in the
game or editing input masks directly inside JSON files. Counter Lab provides a visual timeline for
building and adjusting those inputs without having to edit the JSON by hand.

The application runs entirely in the browser. Drill codes and files are processed locally and are
not sent to a server.

## What it does

- imports `SF6DRILL:v2:`, and long-form JSON;
- visually edits directions, attack buttons, and frame durations;
- manages all eight recording slots;
- supports numeric and SF6-inspired visual notation;
- supports English and Portuguese;
- provides light and dark appearances;
- exports `SF6DRILL:v2:` codes and long-form JSON files;
- keeps a local draft in the browser.

## Community resources

- [Download SF6 Training Drill Share](https://www.nexusmods.com/streetfighter6/mods/3966)
- [Browse the official community drill database](https://drillcodes.com/)

The community database is the place to discover and share drill codes made by other players.
Counter Lab can import those codes so their input sequences can be inspected, adjusted, and
exported again.

## How to use

1. Copy a drill code from the mod or the community database.
2. Paste the code into Counter Lab, or select a compatible JSON file.
3. Choose one of the eight recording slots.
4. Add or edit input blocks using the direction, attack, and frame controls.
5. Select the correct dummy character.
6. Export the resulting `SF6DRILL:v2:` code and import it into the mod.

The dummy character selected in Counter Lab must match the dummy loaded in Street Fighter 6
Training Mode, otherwise the mod may refuse to apply the drill.

## Acknowledgements

Special thanks to [Higor](https://github.com/higorae), creator of SF6 Training Drill Share.

Thanks as well to everyone creating, testing, documenting, and sharing drills through the
[community database](https://drillcodes.com/).

## Disclaimer

Counter Lab is an unofficial community project. It is not affiliated with or endorsed by Capcom.
Street Fighter and related names are trademarks of their respective owners.
