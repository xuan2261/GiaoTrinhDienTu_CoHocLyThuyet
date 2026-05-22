import subprocess
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def run_tool(*args):
    return subprocess.run(
        [sys.executable, *args],
        cwd=ROOT,
        text=True,
        encoding="utf-8",
        capture_output=True,
    )


class SimulationArchitectureTest(unittest.TestCase):
    def test_runtime_smoke_checks_phase_two_globals(self):
        result = run_tool(
            "tools/smoke_simulation_runtime.py",
            "--expect-globals",
            "SimCore,SimMath,SimRender,SimInteractions,SimLabUI",
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("Expected globals: SimCore, SimMath, SimRender, SimInteractions, SimLabUI", result.stdout)
        self.assertIn("SIM_MAP routes: 52", result.stdout)

    def test_runtime_smoke_rejects_unknown_expected_global(self):
        result = run_tool("tools/smoke_simulation_runtime.py", "--expect-globals", "MissingGlobal")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Missing expected global: MissingGlobal", result.stdout)

    def test_runtime_smoke_rejects_unknown_route_filter(self):
        result = run_tool("tools/smoke_simulation_runtime.py", "--routes", "not-a-route")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Unknown route filter: not-a-route", result.stdout)

    def test_runtime_smoke_accepts_known_route_filter(self):
        result = run_tool("tools/smoke_simulation_runtime.py", "--routes", "ch1-1-4")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("Selected routes: 1", result.stdout)

    def test_runtime_smoke_executes_registry_not_static_text_only(self):
        result = run_tool("tools/smoke_simulation_runtime.py", "--expect-runtime-routes", "52")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("Executable registry routes: 52", result.stdout)

    def test_runtime_smoke_checks_mount_failure_dom_rollback(self):
        result = run_tool("tools/smoke_simulation_runtime.py", "--check-mount-rollback")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("Mount rollback (Phase 01): PASS", result.stdout)

    def test_runtime_smoke_checks_listener_cleanup_flag(self):
        result = run_tool("tools/smoke_simulation_runtime.py", "--check-listener-cleanup")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("Listener cleanup: PASS", result.stdout)


if __name__ == "__main__":
    unittest.main()
