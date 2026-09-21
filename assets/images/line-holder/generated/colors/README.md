# Product color images

24 PNGs created with built-in imagegen from the selected studio image plus the selected cinematic image and four existing side cutouts. Green #00AE42, blue #489FDF, red #D32941, black #000000.

The four root PNGs are 1536 × 1024 studio scenes. Each of front/, rear/, left/, and right/ contains four 1254 × 1254 transparent RGBA cutouts. The polymer is recolored while retaining the black knob, silver screw, and white rear logo.

Exact prompts: prompts.json (studio), side-prompts.json (cutouts), cinematic-prompts.json (cinematic). File sizes, dimensions, alpha status and checksums: manifest.json. These are AI-assisted color previews, not calibrated physical material samples; small differences may remain between generated frames.

The home and products pages provide color and view buttons. Images for the current view are preloaded, selection commits after decoding, and the latest click wins. Failed loads keep the previous image and controls. Keyboard activation, live selection announcements and reduced-motion support are included.

Open index.html for all images and individual downloads, or product-colors.zip for all 24 PNGs.

## Cinematic colors

`cinematic/` contains four 1536 × 1024 PNGs made from the selected `../ads/cinematic.png` with built-in imagegen. The body uses each requested color while preserving black hardware, silver steel, dark stone, amber edge lighting, and composition. The interactive viewer includes a Cinematic button, with controls moved to the right and light text on the dark scene.
