# Simulation System Rewrite (v2): Moving Beyond the Legacy 5-Layer Mess

**Date**: 2026-05-10 10:30
**Severity**: High
**Component**: Simulation Engine (v2)
**Status**: Resolved

## What Happened

We finally pulled the plug on the legacy "5-layer" simulation architecture. It was a classic case of over-engineering—layers of abstractions that made simple physics simulations feel like navigating a maze. We've replaced it entirely with a high-performance, lightweight v2 engine based on **Headless Matter.js** and **SVG/DOM rendering**. 

Along with this, we've standardized the UI using native HTML5 controls and integrated **Chart.js** for real-time mechanical plotting. To prove the viability, we successfully ported three pilot simulations: Statics (Equilibrium), Kinematics (Projectile Motion), and Dynamics (Friction/Acceleration).

## The Brutal Truth

The legacy 5-layer system was a nightmare to maintain. Every time we wanted to change a simple constant or add a collision listener, we had to touch files in three different layers. It was slow, prone to synchronization bugs, and the Canvas-only rendering made accessibility and custom UI overlays nearly impossible without reinventing the wheel.

It felt like we were fighting the framework more than we were modeling physics. The "Clean Architecture" we aimed for had become a "Constraining Architecture." The decision to rewrite wasn't just about performance—it was about developer sanity.

## Technical Details

- **Headless Matter.js**: By decoupling the physics engine from the renderer, we gained 100% control over how objects are drawn. No more Canvas flickering or scaling issues.
- **SVG/DOM Rendering**: Using SVG for mechanical components allows for crisp, scalable graphics and CSS-based animations. We can now use standard DOM events for interaction.
- **Chart.js Integration**: Real-time plotting of displacement, velocity, and acceleration is now handled by a dedicated industry-standard library instead of custom Canvas drawing code.
- **HTML5 Controls**: We stopped building custom sliders and buttons in Canvas. Using native `<input type="range">` and `<button>` elements immediately improved accessibility and mobile responsiveness.

## What We Tried

- **Attempt 1: Patching the 5-layer system.** We tried to "optimize" the message passing between layers. It just added more complexity and didn't solve the fundamental rigidness.
- **Attempt 2: Pure Canvas v2.** Better, but still struggled with responsive UI and accessibility.
- **Final Solution: The Headless Hybrid.** Matter.js for the heavy lifting (math/physics) and SVG/HTML for the visual/interaction layer.

## Root Cause Analysis

We fell into the "Generalization Trap." We tried to build a simulation engine that could do *anything*, but in doing so, we made it hard to do *anything specific*. The 5-layer architecture was designed for a level of complexity we didn't actually have, leading to unnecessary boilerplate and performance overhead.

## Lessons Learned

1. **YAGNI (You Aren't Gonna Need It)**: Don't build a 5-layer architecture when a 2-layer one (Physics + View) is more than enough.
2. **Standard over Custom**: Native HTML controls are better than custom-drawn Canvas controls 99% of the time.
3. **Decoupling is Key**: Headless physics allows for much more flexible rendering strategies.

## Next Steps

1. **Port the remaining 50+ simulation routes** to the v2 engine.
2. **Develop a "v2-template"** to accelerate new chapter development.
3. **Audit mobile performance** for the new Chart.js plots on low-end devices.

**Status:** DONE
**Summary:** Successfully replaced the bloated legacy simulation architecture with a streamlined v2 engine.
