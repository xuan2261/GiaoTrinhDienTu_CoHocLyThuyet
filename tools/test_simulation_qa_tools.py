import importlib.util
import subprocess
import sys
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory


ROOT = Path(__file__).resolve().parents[1]


def run_tool(*args):
    return subprocess.run(
        [sys.executable, *args],
        cwd=ROOT,
        text=True,
        encoding="utf-8",
        capture_output=True,
    )


def load_renderer_contract_module():
    module_path = ROOT / "tools" / "smoke_simulation_renderer_contract.py"
    tools_path = str(ROOT / "tools")
    if tools_path not in sys.path:
        sys.path.insert(0, tools_path)
    spec = importlib.util.spec_from_file_location("smoke_simulation_renderer_contract_under_test", module_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class SimulationQAToolsTest(unittest.TestCase):
    def test_manifest_smoke_rejects_missing_manifest_after_phase_five(self):
        with TemporaryDirectory(dir=ROOT) as tmp:
            missing_manifest = Path(tmp) / "missing-manifest.js"
            result = run_tool(
                "tools/smoke_simulation_manifest.py",
                "--manifest",
                str(missing_manifest),
                "--allow-missing-manifest",
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Manifest: missing", result.stdout)
            self.assertIn("--allow-missing-manifest is deprecated after Phase 05", result.stdout)

    def test_manifest_smoke_enforces_objectives_and_direct_interaction(self):
        with TemporaryDirectory(dir=ROOT) as tmp:
            manifest = Path(tmp) / "sim-route-manifest.js"
            manifest.write_text(
                """
window.SIM_ROUTE_MANIFEST = {
  'ch1-1-5': {
    objective: 'Reduce planar force system.',
    interaction: ['drag-vector', 'direct-manipulation']
  }
};
""",
                encoding="utf-8",
            )
            result = run_tool(
                "tools/smoke_simulation_manifest.py",
                "--manifest",
                str(manifest),
                "--routes",
                "ch1-1-5",
                "--require-routes",
                "1",
                "--require-objectives",
                "--require-direct",
            )
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("simulation-manifest-smoke: PASS", result.stdout)

    def test_manifest_smoke_routes_filter_enforces_selected_routes(self):
        with TemporaryDirectory(dir=ROOT) as tmp:
            manifest = Path(tmp) / "sim-route-manifest.js"
            manifest.write_text(
                """
window.SIM_ROUTE_MANIFEST = {
  'ch1-1-5': {
    objective: 'Reduce planar force system.',
    interaction: ['drag-vector']
  }
};
""",
                encoding="utf-8",
            )
            result = run_tool(
                "tools/smoke_simulation_manifest.py",
                "--manifest",
                str(manifest),
                "--routes",
                "ch1-1-5",
                "--require-direct",
            )
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

            missing = run_tool(
                "tools/smoke_simulation_manifest.py",
                "--manifest",
                str(manifest),
                "--routes",
                "ch1",
                "--require-direct",
            )
            self.assertNotEqual(missing.returncode, 0)
            self.assertIn("Selected SIM_MAP routes missing from manifest", missing.stdout)

    def test_manifest_current_routes_have_objectives_and_direct_interaction(self):
        result = run_tool(
            "tools/smoke_simulation_manifest.py",
            "--require-routes",
            "52",
            "--require-objectives",
            "--require-direct",
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("Manifest routes: 52", result.stdout)

    def test_manifest_current_routes_filter_counts_selected_routes(self):
        result = run_tool(
            "tools/smoke_simulation_manifest.py",
            "--routes",
            "ch1",
            "--require-routes",
            "23",
            "--require-objectives",
            "--require-direct",
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("Selected routes: 23", result.stdout)

    def test_scene_catalog_current_routes_filter_counts_selected_routes(self):
        result = run_tool(
            "tools/smoke_simulation_scene_catalog.py",
            "--strict",
            "--routes",
            "ch1",
            "--require-routes",
            "23",
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("Selected routes: 23", result.stdout)

    def test_renderer_contract_current_routes_are_strict(self):
        result = run_tool(
            "tools/smoke_simulation_renderer_contract.py",
            "--strict",
            "--require-routes",
            "52",
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("Unique behaviorId values: 52", result.stdout)
        self.assertIn("Family dispatch: no", result.stdout)
        self.assertIn("simulation-renderer-contract: PASS", result.stdout)

    def test_renderer_contract_source_paths_follow_runtime_script_order(self):
        module = load_renderer_contract_module()
        paths = module.source_paths()
        self.assertLess(
            paths.index("js/sims/ch2/ch2-rotation-gear-renderers.js"),
            paths.index("js/sims/ch2/ch2-relative-motion-velocity-renderers.js"),
        )
        self.assertLess(
            paths.index("js/sims/ch2/ch2-instant-center-plane-motion-renderers.js"),
            paths.index("js/sims/ch2/ch2-trajectory-graph-renderers.js"),
        )
        self.assertNotIn(
            "js/sims/ch2/ch2-kinematics-exercises-renderers.js",
            paths,
        )

    def test_renderer_contract_detects_direct_family_dispatch_patterns(self):
        module = load_renderer_contract_module()
        original_templates = module.SCENE_TEMPLATES
        try:
            with TemporaryDirectory(dir=ROOT) as tmp:
                template = Path(tmp) / "sim-scene-templates.js"
                template.write_text(
                    """
function renderScene(ctx, scene, state, derived) {
  if (scene.family === 'support') drawSupport(ctx, scene, state, derived);
}
""",
                    encoding="utf-8",
                )
                module.SCENE_TEMPLATES = template
                self.assertTrue(module.uses_family_dispatch())

                template.write_text(
                    """
function renderScene(ctx, scene, state, derived) {
  switch (scene.family) {
    case 'dynamics': drawDynamics(ctx, scene, state, derived); break;
  }
}
""",
                    encoding="utf-8",
                )
                self.assertTrue(module.uses_family_dispatch())

                template.write_text(
                    """
function renderScene(ctx, scene, state, derived) {
  label(ctx, 'Missing dedicated route renderer', 112, 132, 14, '#dc3545');
}
""",
                    encoding="utf-8",
                )
                self.assertFalse(module.uses_family_dispatch())
        finally:
            module.SCENE_TEMPLATES = original_templates

    def test_behavior_registry_rejects_explicit_blank_behavior_id(self):
        script = """
const fs = require('fs');
const vm = require('vm');
const warnings = [];
const context = {
  console: { warn: (...args) => warnings.push(args.join(' ')) },
  window: {}
};
context.window.window = context.window;
vm.createContext(context);
vm.runInContext(fs.readFileSync('js/sim-route-behavior-registry.js', 'utf8'), context, { filename: 'js/sim-route-behavior-registry.js' });
const entry = context.window.SimRouteBehaviors.register('ch1-1-3', { behaviorId: '' });
console.log(JSON.stringify({
  entry,
  routes: context.window.SimRouteBehaviors.routes(),
  warnings
}));
"""
        result = subprocess.run(
            ["node", "-e", script],
            cwd=ROOT,
            text=True,
            encoding="utf-8",
            capture_output=True,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn('"entry":null', result.stdout)
        self.assertIn('"routes":[]', result.stdout)
        self.assertIn("Invalid route behavior registration", result.stdout)

    def test_manifest_direct_gate_rejects_generic_canvas_scene(self):
        with TemporaryDirectory(dir=ROOT) as tmp:
            manifest = Path(tmp) / "sim-route-manifest.js"
            manifest.write_text(
                """
window.SIM_ROUTE_MANIFEST = {
  'ch1-1-5': {
    objective: 'Reduce planar force system.',
    interaction: ['canvas-scene']
  }
};
""",
                encoding="utf-8",
            )
            result = run_tool(
                "tools/smoke_simulation_manifest.py",
                "--manifest",
                str(manifest),
                "--routes",
                "ch1-1-5",
                "--require-direct",
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Routes missing direct interaction declaration: ch1-1-5", result.stdout)

    def test_quality_audit_records_current_baseline(self):
        result = run_tool("tools/audit_simulation_quality.py", "--baseline")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertRegex(result.stdout, r"SIM_MAP routes:\s+52")
        self.assertRegex(result.stdout, r"Sliders:\s+\d+")
        self.assertRegex(result.stdout, r"Canvas drag hooks:\s+\d+")

    def test_quality_audit_route_prefix_gates_lab_shell_and_direct_interaction(self):
        result = run_tool(
            "tools/audit_simulation_quality.py",
            "--all",
            "--routes",
            "ch1",
            "--require-lab-shell",
            "ch1",
            "--require-direct-interaction",
            "ch1",
            "--max-js-lines",
            "220",
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("Selected routes: 23", result.stdout)

    def test_quality_audit_fails_cleanly_for_malformed_manifest(self):
        result = run_tool(
            "tools/audit_simulation_quality.py",
            "--baseline",
            "--manifest",
            "tools/audit_simulation_quality.py",
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("simulation-quality-audit: FAIL", result.stdout)
        self.assertIn("Parser error:", result.stdout)
        self.assertNotIn("Traceback", result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()
