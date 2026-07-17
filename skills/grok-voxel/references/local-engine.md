# Local element-level motion engine (optional advanced path)

The **standard GrokVoxel path** animates each collage poster with native `image_to_video`
("living poster"). That is the default.

For dramatic **piece-by-piece assembly** (stickers fly in and settle) or full pixel control
without a video model, you can cut a keyframe into elements and drive them with local
frame-by-frame composition (Pillow + ffmpeg). This path is documented here as optional
future work; the first ship prioritizes the native i2v path.

## When to use it
- You need stickers to land on exact positions.
- Content filters block a face/logo in a video model (less relevant with Grok-native, but
  still useful for exact choreography).
- You want zero generative motion drift.

## Outline (port from vox-director when needed)
1. Mark element bboxes on the keyframe (manual or assisted).
2. Extract RGBA cutouts (`extract_elements` style crop + optional bg remove).
3. Keyframe motion: `fly_in`, `slap`, `drop`, `pop_settle` easings.
4. Render frames → ffmpeg encode silent clip.
5. Feed the clip into the normal assemble stage.

Until scripts land, stay on the standard path: strong layered keyframes + punchy
`element_motion` prompts in `image_to_video`.
