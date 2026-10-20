# Renderer files

`sphere-engine.js` contains the adapted Three.js renderer from the original Send Return Vercel site. It is isolated as third-party/vendor code. Do not edit its generated internal variable names for normal design work.

`../sphere-animation.js` is the readable, maintained controller: motion, sizes, sphere count, viewport visibility, loading and cleanup.

`offline-textures.js` is a generated data-URI cache loaded only for `file://` previews. HTTP/HTTPS pages use the separate cacheable images and HDR file in `assets/` instead. Update the offline cache if replacing these textures.
