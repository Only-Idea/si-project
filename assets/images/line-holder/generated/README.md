# Standing product image set

Six creative product renders made with **built-in imagegen**, using `../photo-07.jpg` as the primary reference following the user's correction: upright body, handwheel at the top, comb teeth at the bottom.

`photo-08.jpg` and `photo-09.jpg` are secondary shape and backside-branding references only. Original Allegro photographs are unchanged. Earlier generation requests using a different orientation were stopped and are not part of this deliverable.

## Deliverables

- `sides/front.png` — standing front view.
- `sides/rear.png` — reconstructed standing rear view.
- `sides/left.png` — reconstructed standing left profile.
- `sides/right.png` — reconstructed standing right profile.
- `ads/studio.png` — bright studio campaign, space for headline on the left.
- `ads/cinematic-front-angle.png` — cinematic campaign using the requested near-front angle and updated sloped feet, space for headline on the right.
- `index.html` — visual gallery and individual download links.
- `si-3d-product-images.zip` — portable bundle of all six PNGs, prompts, and file notes.
- `prompts.json` — exact generation prompts, tool method, and reference paths.
- `manifest.json` — actual dimensions, file sizes, transparency information, and checksums after inspection.

These are creative AI-generated visualizations. Side/rear geometry inferred from photographs is not CAD-verified; small geometry or marking differences may remain. Use the supplied original photos as the factual product reference. The real-photo website gallery is preserved.

The requested render sizes are recorded in the prompts. Actual delivered dimensions are recorded in `manifest.json`; no artificial upscaling is performed. Transparency is checked on the PNG data before handoff.

## Verified exports

All four product views are 1254 × 1254 RGBA PNGs with verified transparent pixels. Both ad images are 1536 × 1024 RGB PNGs. Files were opened and decoded successfully. All six images were inspected visually; the right profile was regenerated to correct the initial misplaced comb teeth. The final correction prompt is saved in `right-correction-prompt.txt`.

## Cinematic geometry revision

The user identified that the front feet/comb appeared too flat. `ads/cinematic-v2.png` extends the lower comb and outer feet forward, using `photo-01.jpg` as the main correction reference with `photo-08.jpg` and `photo-07.jpg` as supporting geometry references. The charcoal set, upright pose, lighting, and layout are retained. Made with built-in imagegen; exact prompt: `cinematic-v2-prompt.txt`. The original `ads/cinematic.png` is preserved for comparison. This version was superseded following the user’s clarification of the sloped geometry.

## Approved side reference revision

The user selected `sides/right.png` as the direct base for the cinematic image. `ads/cinematic-right.png` preserves that right-side presentation and sloping lower profile in a dark stone studio with cinematic lighting. Built-in imagegen was used with only that supplied image; the exact prompt is in `cinematic-right-prompt.txt`. Earlier cinematic files are retained for comparison. This right-side version was the base for the subsequent camera-angle revision.

## Cinematic three-quarter revision

At the user’s request, `ads/cinematic-three-quarter.png` turns the right-side product slightly toward the viewer to show both the front and side, retaining the sloped feet and cinematic stone setting. Generated with built-in imagegen; exact prompt: `cinematic-three-quarter-prompt.txt`. Previous versions are preserved. This version is retained as an earlier angle option.

## Requested near-front camera angle

`ads/cinematic-front-angle.png` uses the original cinematic image as the angle and composition reference, with the updated sloping product geometry. The camera was corrected in two imagegen edits to bring the broad front face toward the viewer. Both exact prompts are in `cinematic-front-angle-prompt.txt`. The gallery and six-image ZIP use this latest version. Earlier versions remain available separately.

## Selected assets and color collection

The current selected campaign files are `ads/studio.png` and `ads/cinematic.png`. Earlier alternate cinematic files were removed during selection. The six-image gallery and archive now reference the retained assets.

The new `colors/` collection contains 24 PNGs: green, blue, red and black in studio, cinematic, front, rear, left and right views. See `colors/index.html` for previews, `colors/product-colors.zip` for the complete set, and `colors/README.md` for prompts and implementation details.
