# Sim3 Two Route Three.js Pilot Status

## Result

- Plan status: done.
- All 6 phase files marked done.
- Verification matrix green on 2026-06-02:
  - `npm run test:sim3:pilot`: PASS, 6/6.
  - `npm run test:sim:physics`: PASS.
  - `npm run test:sim:mount`: PASS, 104/104.
  - `npm run test:sim:release`: PASS.
  - `npm run test:sim3:visual:capture`: PASS, 2/2.
- Code review follow-up:
  - Fixed WebGL probe context cleanup in `js/sim3/core/three-shell.js`.
  - Re-ran `npm run test:sim3:pilot`, `npm run test:sim3:visual:capture`, and `npm run test:sim:release`: all PASS.
- Visual polish follow-up:
  - Made the `ch2-2-2` 3D tangential velocity vector thicker, raised above the disk surface, and oriented along the actual disk-plane tangent.
  - Re-ran `npm run test:sim3:pilot`, `npm run test:sim3:visual:capture`, manual long browser session, and `npm run test:sim:release`: all PASS.

## Notes

- Visual artifacts exist:
  - `plans/260602-2103-sim3-two-route-threejs-pilot/visuals/ch2-2-2-sim3.png`
  - `plans/260602-2103-sim3-two-route-threejs-pilot/visuals/ch3-6-2-sim3.png`
