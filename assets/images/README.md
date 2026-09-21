# Concept image provenance

`sculpture-concept.png` is AI-generated concept imagery, created with the built-in imagegen tool for this Phase 1 design preview. It does not depict a verified SI 3D PROJECT product. Replace it with approved catalogue photography before production. The original supplied `logo.jpg` at the project root has not been modified.

## Final generation prompt

> Use case: product-mockup. Asset type: website hero concept image for a premium 3D printing studio. Create a photorealistic studio photograph of one sculptural off-white 3D printed twisted ribbed vase, with exquisite fine horizontal additive manufacturing layer lines. A generous organic helix opening, elegant mathematical flowing silhouette, porcelain-white matte PLA texture. The object is centered, fully visible, occupying 75% of image height on a seamless extremely dark charcoal near-black background and black surface. Dramatic soft neutral studio side light reveals each rib and layer. Restrained Apple product photography aesthetic, subtle grounded shadow. Square image. No text, no logos, no other objects, no graphics. This is conceptual design imagery, not a real product catalogue photo.

Finish-sample tiles in the prototype are CSS interface illustrations, not product photos or material availability claims.

## White-background revision

`sculpture-white.png` is the previous white-theme concept asset, edited with built-in imagegen from `sculpture-concept.png`. The original dark image remains available unchanged.

Final edit prompt:

> Use case: lighting-weather / precise-object-edit. Edit the supplied product concept image for a white-background premium 3D printing website. Preserve the exact single spiral vase silhouette, camera angle, rib structure, fine printed layer detail, proportions, ivory material, and centered square composition. Change the black background and black tabletop to a seamless pure white studio cyclorama, bright soft daylight lighting, subtly gray shadows within the ribs to keep depth, gentle realistic contact shadow underneath. Clean high-key premium Apple-style product photography with ample white negative space. No text, logos, extra objects, border, gradients, or graphics. The background edges must be pure white so the image blends into a white webpage. Do not change the object design.

## Real product photography

The current preview uses nine unchanged Allegro product photos in `line-holder/`, replacing the vase placeholder. See [source details](line-holder/README.md) and [download manifest](line-holder/sources.json).

## Design-process hero

`line-holder/generated/design-process.png` is a 1448 × 1086 AI-generated CAD-style illustration made with the built-in imagegen tool, using the approved product front and right images as references. It depicts a design workspace; it is not an actual software capture or editable CAD model. The complete prompt and method are saved in [design-process-prompt.txt](line-holder/generated/design-process-prompt.txt). This was the first design-process hero; it is retained as an earlier version.

### Dark CAD revision

`line-holder/generated/design-process-dark.png` is the current hero: a grey shaded product model in a dark CAD workspace, following the user-provided Shapr3D style reference. Created with built-in imagegen using the approved front/right product images for shape. It is an AI-generated illustration, not a real software screenshot or editable CAD file. See [the final prompt and source URL](line-holder/generated/design-process-dark-prompt.txt). The downloaded style reference is archived in `line-holder/generated/references/shapr3d-style.webp` and is not shipped as a site asset.

## Four-color campaign image

`line-holder/generated/ads/four-colors.png` is the 1536 × 1024 campaign image featuring green, blue, red and black line holders on white plinths. Created with built-in imagegen from four approved product references; used on Home and About. The final prompt is in [four-colors-prompt.txt](line-holder/generated/ads/four-colors-prompt.txt). This is an AI-assisted product visualization, not a stock or availability claim.

## Five-color gold revision

`line-holder/generated/ads/five-colors-gold.png` supersedes the four-color campaign on Home and About: orange is added as the fifth finish, and the foreground cord is gold. Created with built-in imagegen from the previous campaign and the approved orange studio reference. See [final prompt](line-holder/generated/ads/five-colors-gold-prompt.txt). The original four-color asset remains archived. The live picker now also uses the five existing orange studio/side images; no recoloring was needed. Orange’s `#FF7900` swatch is a visual approximation, not a supplied calibrated material value.

## Professional in-use edits

`line-holder/generated/in-use/photo-01-professional.png` and `photo-02-professional.png` are portrait edits of the original `photo-01.jpg` and `photo-02.jpg`, created using built-in imagegen. The edits tighten framing, improve lighting and background separation, and tidy distracting ground clutter while retaining the installed orange holder, rebar, horizontal screw and pink guide line. Originals are preserved. These are AI-assisted edits, not unchanged documentary photographs. Full prompts are saved in [in-use/prompts.json](line-holder/generated/in-use/prompts.json). The first image is used in the product details section; both are mapped in the product gallery data with original source paths recorded.
