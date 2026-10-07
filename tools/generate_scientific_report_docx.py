import argparse
import hashlib
import json
import os
import re
import zipfile
from datetime import datetime
from pathlib import Path

from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
from docx.shared import Cm, Pt, RGBColor

import time

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "BaoCao_KhoaHoc_GiaoTrinhDienTu_CoHocLyThuyet.docx"
FONT_NAME = "Times New Roman"

COLOR_NAVY = RGBColor(0x1F, 0x38, 0x64)
COLOR_RED = RGBColor(0xC0, 0x00, 0x00)
COLOR_GOLD = RGBColor(0xC9, 0x96, 0x3A)
COLOR_BODY = RGBColor(0x20, 0x20, 0x20)
COLOR_MUTED = RGBColor(0x59, 0x59, 0x59)


GIF_ROWS = [
    ("assets/gifs/ch1/hinh-1-06.gif", "Định lý trượt lực trên vật rắn", "images/ch1/hinh-026.png"),
    ("assets/gifs/ch1/hinh-1-09.gif", "Quy tắc hình bình hành và tổng hợp lực đồng quy", "images/ch1/hinh-033.png"),
    ("assets/gifs/ch1/hinh-1-28b.gif", "Phản lực liên kết gối tựa và ngàm phẳng", "images/ch1/hinh-118.png"),
    ("assets/gifs/ch1/hinh-1-34.gif", "Ma sát trượt trên mặt phẳng nghiêng", "images/ch1/hinh-136.png"),
    ("assets/gifs/ch1/hinh-1-35.gif", "Nón ma sát và góc ma sát tĩnh", "images/ch1/hinh-138.png"),
    ("assets/gifs/ch1/hinh-1-minh-hoa-02.gif", "Trọng tâm và tâm diện tích hình học phẳng", "images/ch1/hinh-149.png"),
    ("assets/gifs/ch2/hinh-2-07.gif", "Vận tốc và gia tốc chuyển động thẳng", "images/ch2/hinh-072.png"),
    ("assets/gifs/ch2/hinh-2-09.gif", "Gia tốc tiếp tuyến và gia tốc pháp tuyến", "images/ch2/hinh-080.png"),
    ("assets/gifs/ch2/hinh-2-15.gif", "Chuyển động quay quanh trục cố định", "images/ch2/hinh-143.png"),
    ("assets/gifs/ch2/hinh-2-16.gif", "Phân bố vận tốc trong chuyển động quay", "images/ch2/hinh-147.png"),
    ("assets/gifs/ch2/hinh-2-22.gif", "Cơ cấu truyền động bánh răng hành tinh", "images/ch2/hinh-196.png"),
    ("assets/gifs/ch2/hinh-2-26.gif", "Hợp chuyển động và gia tốc Coriolis", "images/ch2/hinh-219.png"),
    ("assets/gifs/ch2/hinh-2-34.gif", "Tâm vận tốc tức thời của vật rắn phẳng", "images/ch2/hinh-276.png"),
    ("assets/gifs/ch3/hinh-3-06.gif", "Va chạm mềm đầu đạn – toa xe cát", "images/ch3/hinh-101.png"),
    ("assets/gifs/ch3/hinh-3-10.gif", "Chuyển động trong trọng trường có cản", "images/ch3/hinh-151.png"),
    ("assets/gifs/ch3/hinh-3-11.gif", "Dao động điều hòa có cản môi trường", "images/ch3/hinh-169.png"),
    ("assets/gifs/ch3/hinh-3-17.gif", "Định lý biến thiên động lượng của chất điểm", "images/ch3/hinh-216.png"),
    ("assets/gifs/ch3/hinh-3-20.gif", "Định lý bảo toàn mô men động lượng", "images/ch3/hinh-225.png"),
    ("assets/gifs/ch3/hinh-3-21.gif", "Định lý biến thiên động năng", "images/ch3/hinh-237.png"),
    ("assets/gifs/ch3/hinh-3-22.gif", "Va chạm hai quả cầu đàn hồi", "images/ch3/hinh-244.png"),
]


SIM_INTERACTIONS = {
    "ch1-1-3": "Kéo điểm đặt và góc",
    "ch1-1-4": "Giữ O cố định; kéo điểm đặt lực để đổi d và tính mô men",
    "ch1-1-5": "Thu gọn hệ lực; có adapter Sim3 pilot",
    "ch1-1-6": "Khảo sát cặp lực song song",
    "ch1-2-3": "Tổng hợp hai lực đồng quy",
    "ch1-1-8": "Tách vật thể tự do",
    "ch1-3-2": "Đổi góc dây và kéo vật",
    "ch1-3-6": "Tải phân bố và tập trung",
    "ch1-5-3": "Nón ma sát; có adapter Sim3 pilot",
    "ch1-6-3": "Kéo kích thước hình ghép/khoét",
    "ch2-1-1": "Quỹ đạo, vectơ vận tốc và gia tốc",
    "ch2-1-3": "Tiếp–pháp tuyến; có adapter Sim3 pilot",
    "ch2-2-2": "Quay quanh trục; có adapter Sim3 pilot",
    "ch2-3-2": "Bánh răng–đai–puli; có adapter Sim3 pilot",
    "ch2-4-4": "Hợp chuyển động; có adapter Sim3 pilot",
    "ch2-5-2": "Giao điểm pháp tuyến vận tốc",
    "ch2-5-3": "Phân bố vận tốc; có adapter Sim3 pilot",
    "ch3-1-3": "Hệ quy chiếu; có adapter Sim3 pilot",
    "ch3-2-2": "Khảo sát lực và gia tốc",
    "ch3-2-3": "Tương tác va chạm xe",
    "ch3-3-1": "Tích phân ODE bằng RK4",
    "ch3-5-2": "Xung lực và động lượng",
    "ch3-5-3": "Mô men động lượng; có adapter Sim3 pilot",
    "ch3-5-4": "Công, động năng và thế năng",
    "ch3-6-2": "Hệ số phục hồi; có adapter Sim3 pilot",
}


def load_json(relative_path):
    path = ROOT / relative_path
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def load_runtime_gif_map():
    source = (ROOT / "js/gif-figures.js").read_text(encoding="utf-8")
    match = re.search(
        r"const STATIC_TO_GIF = Object\.freeze\(\{(?P<body>.*?)\}\);",
        source,
        flags=re.DOTALL,
    )
    require(match is not None, "cannot locate STATIC_TO_GIF runtime manifest")
    pairs = re.findall(
        r"'([^']+\.png)'\s*:\s*'([^']+\.gif)'",
        match.group("body"),
    )
    runtime_map = dict(pairs)
    require(len(runtime_map) == len(pairs), "duplicate static path in GIF runtime manifest")
    return runtime_map


def validate_gif_inventory(rows, runtime_map, release_gif_paths):
    report_map = {fallback: gif for gif, _, fallback in rows}
    require(len(report_map) == len(rows), "duplicate PNG fallback in report GIF inventory")
    require(report_map == runtime_map, "report GIF inventory differs from runtime manifest")
    require(
        set(report_map.values()) == set(release_gif_paths),
        "runtime GIF inventory differs from candidate release manifest",
    )
    return report_map


def require(condition, message):
    if not condition:
        raise ValueError(message)


def sha256_file(path):
    digest = hashlib.sha256()
    with Path(path).open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def evidence_record(registry, gate_id):
    matches = [record for record in registry["records"] if record["gateId"] == gate_id]
    require(len(matches) == 1, f"expected one evidence record for {gate_id}")
    return matches[0]


def evidence_input_hashes(record, root=ROOT):
    log_path = Path(root) / record["artifact"]
    require(log_path.is_file(), f"missing evidence log: {record['artifact']}")
    expected_artifact_hash = record.get("hash", "")
    require(
        expected_artifact_hash.startswith("sha256:")
        and len(expected_artifact_hash) == len("sha256:") + 64,
        f"invalid evidence artifact hash: {record['artifact']}",
    )
    require(
        sha256_file(log_path) == expected_artifact_hash.removeprefix("sha256:"),
        f"stale evidence log: {record['artifact']}",
    )
    hashes = {}
    pattern = re.compile(r"^sha256:([a-f0-9]{64})\s+(.+)$")
    for line in log_path.read_text(encoding="utf-8-sig").splitlines():
        match = pattern.match(line.strip())
        if match:
            hashes[match.group(2).replace("\\", "/")] = match.group(1)
    return hashes


def verify_hashed_input(relative_path, expected_hash, label):
    path = ROOT / relative_path
    require(path.is_file(), f"missing {label}: {relative_path}")
    actual_hash = sha256_file(path)
    require(actual_hash == expected_hash, f"stale {label}: {relative_path}")
    return actual_hash


def candidate_evidence_binding(acceptance, record, input_hashes, expected_hashes):
    acceptance_matches = [
        gate
        for gate in acceptance["gates"]
        if gate["gateId"] == "release-candidate-inventory"
    ]
    join_mismatches = []
    if len(acceptance_matches) != 1:
        join_mismatches.append("acceptance gate count")
    else:
        gate = acceptance_matches[0]
        for field in ("status", "artifact", "hash", "observedAt"):
            if gate.get(field) != record.get(field):
                join_mismatches.append(field)

    missing_inputs = sorted(set(expected_hashes) - set(input_hashes))
    hash_mismatches = sorted(
        path
        for path, expected_hash in expected_hashes.items()
        if path in input_hashes and input_hashes[path] != expected_hash
    )
    current = (
        record.get("status") == "pass"
        and not join_mismatches
        and not missing_inputs
        and not hash_mismatches
    )
    return {
        "current": current,
        "missingInputs": missing_inputs,
        "hashMismatches": hash_mismatches,
        "joinMismatches": join_mismatches,
    }


def decision_profile(acceptance, candidate_evidence_current):
    decision = acceptance["releaseDecision"]["decision"]
    gate_summary = acceptance["gateSummary"]
    require(decision in {"approved", "rejected", "blocked"}, "unknown release decision")
    if not candidate_evidence_current:
        return {
            "key": "evidence-mismatch",
            "accepted": False,
            "cover": "DỰ THẢO — BẰNG CHỨNG KHÔNG CÙNG SNAPSHOT",
            "header": "DỰ THẢO — CẦN LÀM MỚI BẰNG CHỨNG CANDIDATE",
            "summary": (
                "Snapshot nghiệm thu và candidate hiện hành chưa được ràng buộc bởi cùng bộ "
                "hash đầu vào; không được quy kết trạng thái gate cũ cho candidate mới."
            ),
            "conclusion": (
                "Báo cáo chỉ được dùng để nhận diện chênh lệch bằng chứng. Cần chạy lại cổng "
                "candidate và acceptance trên cùng phiên bản trước mọi quyết định phát hành."
            ),
        }
    if decision == "approved":
        return {
            "key": "approved",
            "accepted": True,
            "cover": "TRẠNG THÁI: ĐÃ ĐỦ CỔNG BẰNG CHỨNG",
            "header": "BÁO CÁO KỸ THUẬT — ĐỦ CỔNG BẰNG CHỨNG",
            "summary": "Mọi cổng bắt buộc trong snapshot candidate hiện hành đã pass.",
            "conclusion": (
                "Ma trận bằng chứng hiện hành đã đạt toàn bộ cổng bắt buộc. Tài liệu có thể "
                "chuyển sang quyết định phát hành theo thẩm quyền của cơ sở."
            ),
        }
    if decision == "rejected":
        return {
            "key": "rejected",
            "accepted": False,
            "cover": "BỊ TỪ CHỐI — CÓ CỔNG KIỂM TRA THẤT BẠI",
            "header": "BÁO CÁO KỸ THUẬT — CANDIDATE BỊ TỪ CHỐI",
            "summary": (
                "Ít nhất một cổng bắt buộc đã fail; candidate không đủ điều kiện chuyển sang "
                "phát hành hoặc nghiệm thu."
            ),
            "conclusion": (
                "Candidate bị từ chối do có cổng bắt buộc thất bại. Phải sửa nguyên nhân, "
                "tạo bằng chứng mới và chạy lại acceptance trước khi xem xét tiếp."
            ),
        }
    return {
        "key": "blocked",
        "accepted": False,
        "cover": (
            f"DỰ THẢO — {gate_summary['pass']} CỔNG ĐẠT, "
            f"{gate_summary['blocked']} BLOCKED, {gate_summary['notRun']} CHƯA CHẠY"
        ),
        "header": "DỰ THẢO — CÒN ĐIỀU KIỆN BẮT BUỘC CHƯA HOÀN TẤT",
        "summary": (
            f"Sổ ghi {gate_summary['total']} cổng: {gate_summary['pass']} pass, "
            f"{gate_summary['fail']} fail, {gate_summary['blocked']} blocked và "
            f"{gate_summary['notRun']} not-run; quyết định blocked. Các điều kiện chưa "
            "hoàn tất không đồng nghĩa đều là review độc lập."
        ),
        "conclusion": (
            f"Candidate có {gate_summary['pass']} cổng pass nhưng còn "
            f"{gate_summary['blocked']} blocked và {gate_summary['notRun']} not-run. Hồ sơ phù hợp "
            "để ghi nhận hiện vật kỹ thuật và cho phép nhóm tác giả tiếp tục hoàn thiện hồ sơ; "
            "chưa có cơ sở để tuyên bố nghiệm thu học thuật, tuân thủ WCAG toàn hệ thống, tương thích "
            "LMS thực tế hoặc đưa vào giảng dạy chính thức trước khi các điều kiện bắt buộc hoàn tất "
            "và đơn vị có thẩm quyền phê duyệt."
        ),
    }


def normalize_docx_package(path):
    path = Path(path)
    temporary = path.with_suffix(path.suffix + ".tmp")
    with zipfile.ZipFile(path, "r") as source:
        entries = [(name, source.read(name)) for name in sorted(source.namelist())]
    with zipfile.ZipFile(
        temporary,
        "w",
        compression=zipfile.ZIP_DEFLATED,
        compresslevel=9,
    ) as target:
        for name, payload in entries:
            info = zipfile.ZipInfo(name, (1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o600 << 16
            target.writestr(info, payload)
    last_error = None
    for attempt in range(10):
        try:
            os.replace(temporary, path)
            return
        except OSError as error:
            last_error = error
            time.sleep(0.2 * (attempt + 1))
    if last_error:
        raise last_error


def load_evidence():
    acceptance = load_json("data/acceptance-report.json")
    release_candidate = load_json("data/release-candidate.json")
    release_summary = load_json(release_candidate["summaryPath"])
    release_root = Path(release_candidate["summaryPath"]).parent
    release_manifest_path = (
        release_root / release_summary["manifest"]["path"]
    ).as_posix()
    release_manifest = load_json(release_manifest_path)
    evidence_registry = load_json("data/evidence-registry.json")
    accessibility = load_json("data/accessibility-baseline.json")
    lms_targets = load_json("data/lms-targets.json")
    legal = load_json("data/legal-standards-register.json")
    learning_outcomes = load_json("data/learning-outcomes.json")
    content_manifest = load_json("data/content-manifest.json")
    equations = load_json("data/equation_mapping.json")
    quizzes = {
        chapter: load_json(f"data/quiz-ch{chapter}.json").get("items", [])
        for chapter in (1, 2, 3)
    }
    simulation_specs = load_json("data/simulation-specifications.json")
    sim3_reviews = load_json("data/sim3-pedagogical-reviews.json")

    gate_summary = acceptance["gateSummary"]
    gates = acceptance["gates"]
    status_total = sum(
        gate_summary[key] for key in ("pass", "fail", "blocked", "notRun")
    )
    if gate_summary["fail"]:
        expected_overall = "fail"
        expected_decision = "rejected"
    elif gate_summary["blocked"] or gate_summary["notRun"]:
        expected_overall = "blocked"
        expected_decision = "blocked"
    else:
        expected_overall = "pass"
        expected_decision = "approved"
    require(
        acceptance["overallStatus"] == expected_overall,
        "acceptance overall status contradicts gate summary",
    )
    require(
        acceptance["releaseDecision"]["decision"] == expected_decision,
        "release decision contradicts gate summary",
    )
    require(
        release_summary["releaseVersion"] == release_candidate["releaseVersion"],
        "release version mismatch",
    )
    require(
        release_summary["package"]["sha256"] == release_candidate["packageSha256"],
        "release SHA-256 mismatch",
    )
    verify_hashed_input(
        release_manifest_path,
        release_summary["manifest"]["sha256"],
        "release manifest",
    )

    release_files = {record["path"]: record for record in release_manifest["files"]}
    content_provenance = release_manifest["provenance"]["contentManifest"]
    verify_hashed_input(
        content_provenance["path"],
        content_provenance["sha256"],
        "candidate content manifest",
    )
    for chapter in (1, 2, 3):
        quiz_path = f"data/quiz-ch{chapter}.json"
        require(quiz_path in release_files, f"candidate omits {quiz_path}")
        verify_hashed_input(
            quiz_path,
            release_files[quiz_path]["sha256"],
            "candidate quiz",
        )

    candidate_record = evidence_record(evidence_registry, "release-candidate-inventory")
    candidate_hashes = evidence_input_hashes(candidate_record)
    package_path = (release_root / release_summary["package"]["path"]).as_posix()
    verify_hashed_input(
        package_path,
        release_summary["package"]["sha256"],
        "candidate package",
    )
    expected_candidate_hashes = {
        release_candidate["summaryPath"]: sha256_file(
            ROOT / release_candidate["summaryPath"]
        ),
        release_manifest_path: release_summary["manifest"]["sha256"],
        package_path: release_summary["package"]["sha256"],
    }
    candidate_binding = candidate_evidence_binding(
        acceptance,
        candidate_record,
        candidate_hashes,
        expected_candidate_hashes,
    )

    equation_record = evidence_record(evidence_registry, "equations")
    equation_hashes = evidence_input_hashes(equation_record)
    require(
        "data/equation_mapping.json" in equation_hashes,
        "equation evidence omits equation mapping",
    )
    verify_hashed_input(
        "data/equation_mapping.json",
        equation_hashes["data/equation_mapping.json"],
        "equation evidence input",
    )

    simulation_record = evidence_record(
        evidence_registry,
        "simulation-evidence-currentness",
    )
    simulation_hashes = evidence_input_hashes(simulation_record)
    simulation_inputs = {
        path.replace("\\", "/") for path in simulation_record["inputs"]
    }
    for relative_path in (
        "data/simulation-specifications.json",
        "data/sim3-pedagogical-reviews.json",
    ):
        require(relative_path in simulation_hashes, f"simulation evidence omits {relative_path}")
        verify_hashed_input(
            relative_path,
            simulation_hashes[relative_path],
            "simulation evidence input",
        )

    image_provenance = {}
    candidate_images = (
        "images/ch1/hinh-002.png",
        "images/ch1/hinh-078.png",
        "images/ch2/hinh-196.png",
    )
    for relative_path in candidate_images:
        require(relative_path in release_files, f"candidate omits image: {relative_path}")
        digest = verify_hashed_input(
            relative_path,
            release_files[relative_path]["sha256"],
            "candidate image",
        )
        image_provenance[relative_path] = {
            "sha256": digest,
            "authority": f"candidate manifest {release_summary['releaseVersion']}",
        }

    simulation_images = (
        "tools/sim2-visual/selective-baseline.spec.js-snapshots/ch1-6-3-negative-area-win32.png",
        "tools/sim2-visual/selective-baseline.spec.js-snapshots/ch2-4-4-coriolis-callout-win32.png",
        "tools/sim2-visual/selective-baseline.spec.js-snapshots/ch2-3-2-transmission-win32.png",
        "tools/sim2-visual/selective-baseline.spec.js-snapshots/ch3-6-2-collision-after-win32.png",
    )
    for relative_path in simulation_images:
        require(relative_path in simulation_inputs, f"simulation evidence omits {relative_path}")
        require(relative_path in simulation_hashes, f"simulation log omits {relative_path}")
        digest = verify_hashed_input(
            relative_path,
            simulation_hashes[relative_path],
            "simulation screenshot",
        )
        if relative_path == "tools/sim2-visual/selective-baseline.spec.js-snapshots/ch2-3-2-transmission-win32.png":
            image_provenance[relative_path] = {
                "sha256": digest,
                "authority": "simulation-evidence-currentness",
            }

    presentation_images = (
        "assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/assets/img-01-trang-chu-desktop-1440x1000.png",
        "assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/assets/img-02-trang-chu-mobile-390x844.png",
        "assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/assets/img-04-mo-men-ch1-1-4-1440x1000.png",
        "assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/assets/img-06-pdf-viewer-1440x1000.png",
        "assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/assets/sim-live-ch1-6-3.png",
        "assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/assets/sim-live-ch2-4-4.png",
        "assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/assets/sim-live-ch3-6-2.png",
    )
    for relative_path in presentation_images:
        capture_path = ROOT / relative_path
        require(capture_path.is_file(), f"missing presentation capture: {relative_path}")
        image_provenance[relative_path] = {
            "sha256": sha256_file(capture_path),
            "authority": "browser capture bound to presentation evidence; not independent review",
        }

    runtime_manifest_path = "js/gif-figures.js"
    require(
        runtime_manifest_path in release_files,
        "candidate omits GIF runtime manifest",
    )
    verify_hashed_input(
        runtime_manifest_path,
        release_files[runtime_manifest_path]["sha256"],
        "candidate GIF runtime manifest",
    )
    runtime_gif_map = load_runtime_gif_map()
    release_gif_paths = {
        path
        for path in release_files
        if path.startswith("assets/gifs/") and path.endswith(".gif")
    }
    validate_gif_inventory(GIF_ROWS, runtime_gif_map, release_gif_paths)

    for gif_path, _, fallback_path in GIF_ROWS:
        for relative_path in (gif_path, fallback_path):
            require(relative_path in release_files, f"candidate omits media: {relative_path}")
            verify_hashed_input(
                relative_path,
                release_files[relative_path]["sha256"],
                "candidate media",
            )

    routes = content_manifest["routes"]
    chapter_counts = {
        chapter: sum(
            route.get("routeId", "").startswith(f"ch{chapter}")
            for route in routes
        )
        for chapter in (1, 2, 3)
    }
    other_routes = len(routes) - sum(chapter_counts.values())
    quiz_counts = {chapter: len(items) for chapter, items in quizzes.items()}
    specs = simulation_specs["specifications"]
    sim3_records = sim3_reviews["reviews"]
    require(other_routes >= 0, "chapter route counts exceed total routes")
    require(specs, "simulation specifications are empty")
    require(set(SIM_INTERACTIONS) == {spec["id"] for spec in specs}, "simulation interaction map drift")

    return {
        "acceptance": acceptance,
        "releaseCandidate": release_candidate,
        "releaseSummary": release_summary,
        "releaseManifest": release_manifest,
        "accessibility": accessibility,
        "lmsTargets": lms_targets,
        "legal": legal,
        "learningOutcomes": learning_outcomes,
        "routes": routes,
        "chapterCounts": chapter_counts,
        "otherRoutes": other_routes,
        "equationCount": len(equations),
        "equationOccurrenceCount": sum(
            len(route.get("equationRefs", [])) for route in routes
        ),
        "quizCounts": quiz_counts,
        "simulationSpecs": specs,
        "sim3Reviews": sim3_records,
        "imageProvenance": image_provenance,
        "candidateEvidence": {
            **candidate_binding,
            "observedAt": candidate_record["observedAt"],
        },
    }


def presentation_snapshot(evidence):
    specification = load_json("data/presentation-specification.json")
    acceptance = evidence["acceptance"]
    summary = acceptance["gateSummary"]
    targets = evidence["lmsTargets"]
    stages = targets["stages"]
    video_suffixes = {".mp4", ".webm", ".mov", ".avi", ".m4v", ".mkv", ".mpeg", ".mpg", ".ogv"}
    audio_suffixes = {".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac", ".opus", ".aiff", ".aif", ".wma"}
    video_count = 0
    audio_count = 0
    for record in evidence["releaseManifest"]["files"]:
        suffix = Path(record["path"]).suffix.lower()
        video_count += suffix in video_suffixes
        audio_count += suffix in audio_suffixes
    checked_suffixes = ", ".join(sorted(video_suffixes | audio_suffixes))
    media_inventory = (
        f"Danh mục tệp gói ứng viên ghi nhận {video_count} tệp video và {audio_count} tệp âm thanh "
        f"theo các đuôi được kiểm kê ({checked_suffixes}); không suy ra đã duyệt nội dung hoặc khả năng phát."
        if video_count or audio_count
        else f"Không thấy tệp video/âm thanh theo các đuôi được kiểm kê ({checked_suffixes}) "
        "trong danh mục gói ứng viên; kết luận chỉ giới hạn ở danh mục và định dạng này."
    )
    context = {
        "candidateVersion": evidence["releaseCandidate"]["releaseVersion"],
        "snapshotTime": acceptance["generatedAt"],
        "candidateBinding": "current" if evidence["candidateEvidence"]["current"] else "mismatch",
        "gifCount": len(GIF_ROWS),
        "sim2Count": len(evidence["simulationSpecs"]),
        "sim3Count": len(evidence["sim3Reviews"]),
        "quizCount": sum(evidence["quizCounts"].values()),
        "gatePass": summary["pass"],
        "gateFail": summary["fail"],
        "gateBlocked": summary["blocked"],
        "gateNotRun": summary["notRun"],
        "gateTotal": summary["total"],
        "overallStatus": acceptance["overallStatus"],
        "releaseDecision": acceptance["releaseDecision"]["decision"],
        "qtiReadiness": stages["qti3"]["readiness"],
        "ccReadiness": stages["commonCartridge"]["readiness"],
        "scormReadiness": stages["scorm"]["readiness"],
        "xapiReadiness": stages["xapiCmi5"]["readiness"],
        "qtiMaxItems": stages["qti3"]["maximumValidationItems"],
        "lmsStatus": targets["status"],
        "mediaInventory": media_inventory,
    }
    return {
        "basis": specification["basis"].format_map(context),
        "headers": [value.format_map(context) for value in specification["headers"]],
        "rows": [[value.format_map(context) for value in row] for row in specification["rows"]],
        "workflowHeaders": [value.format_map(context) for value in specification["workflowHeaders"]],
        "workflowRows": [
            [value.format_map(context) for value in row] for row in specification["workflowRows"]
        ],
    }


def set_cell_background(cell, fill_hex):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:val="clear" w:color="auto" w:fill="{fill_hex}"/>')
    tc_mar = tc_pr.find(qn("w:tcMar"))
    v_align = tc_pr.find(qn("w:vAlign"))
    if tc_mar is not None:
        tc_mar.addprevious(shd)
    elif v_align is not None:
        v_align.addprevious(shd)
    else:
        tc_pr.append(shd)


def set_cell_margins(cell, top=120, bottom=120, left=160, right=160):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        "</w:tcMar>"
    )
    v_align = tc_pr.find(qn("w:vAlign"))
    if v_align is not None:
        v_align.addprevious(tc_mar)
    else:
        tc_pr.append(tc_mar)


def set_cell_border(cell, color="D0D0D0", size=2):
    tc_pr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="{size}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="single" w:sz="{size}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="single" w:sz="{size}" w:space="0" w:color="{color}"/>'
        f'<w:right w:val="single" w:sz="{size}" w:space="0" w:color="{color}"/>'
        "</w:tcBorders>"
    )
    shd = tc_pr.find(qn("w:shd"))
    tc_mar = tc_pr.find(qn("w:tcMar"))
    v_align = tc_pr.find(qn("w:vAlign"))
    if shd is not None:
        shd.addprevious(borders)
    elif tc_mar is not None:
        tc_mar.addprevious(borders)
    elif v_align is not None:
        v_align.addprevious(borders)
    else:
        tc_pr.append(borders)


def mark_repeat_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    header = OxmlElement("w:tblHeader")
    tr_pr.append(header)

def set_run_font(run, size=10, color=COLOR_BODY, bold=False, italic=False):
    run.font.name = FONT_NAME
    run._element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), FONT_NAME)
    run.font.size = Pt(size)
    run.font.color.rgb = color
    run.bold = bold
    run.italic = italic
def _omml_run(text):
    run = OxmlElement("m:r")
    text_node = OxmlElement("m:t")
    if text.startswith(" ") or text.endswith(" "):
        text_node.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    text_node.text = text
    run.append(text_node)
    return run


def _omml_subscript(base, subscript):
    node = OxmlElement("m:sSub")
    base_node = OxmlElement("m:e")
    base_node.append(_omml_run(base))
    sub_node = OxmlElement("m:sub")
    sub_node.append(_omml_run(subscript))
    node.append(base_node)
    node.append(sub_node)
    return node


def append_omml_formula(paragraph, tokens):
    math = OxmlElement("m:oMath")
    for token in tokens:
        if isinstance(token, tuple) and token[0] == "sub":
            math.append(_omml_subscript(token[1], token[2]))
        else:
            math.append(_omml_run(str(token)))
    paragraph._p.append(math)


def omml_value(tokens):
    return {"kind": "omml", "tokens": tokens}



def configure_styles(doc):
    styles = doc.styles
    specs = {
        "Normal": (11.5, COLOR_BODY, False),
        "Title": (20, COLOR_NAVY, True),
        "Heading 1": (15, COLOR_RED, True),
        "Heading 2": (13, COLOR_NAVY, True),
        "Heading 3": (11.5, COLOR_BODY, True),
        "Caption": (9.5, COLOR_MUTED, False),
    }
    for name, (size, color, bold) in specs.items():
        style = styles[name]
        style.font.name = FONT_NAME
        style._element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), FONT_NAME)
        style.font.size = Pt(size)
        style.font.color.rgb = color
        style.font.bold = bold
    styles["Normal"].paragraph_format.space_after = Pt(6)
    styles["Normal"].paragraph_format.line_spacing = 1.2
    styles["Heading 1"].paragraph_format.space_before = Pt(16)
    styles["Heading 1"].paragraph_format.space_after = Pt(7)
    styles["Heading 1"].paragraph_format.keep_with_next = True
    styles["Heading 2"].paragraph_format.space_before = Pt(12)
    styles["Heading 2"].paragraph_format.space_after = Pt(5)
    styles["Heading 2"].paragraph_format.keep_with_next = True
    styles["Heading 3"].paragraph_format.space_before = Pt(8)
    styles["Heading 3"].paragraph_format.space_after = Pt(3)
    styles["Heading 3"].paragraph_format.keep_with_next = True
    styles["Caption"].paragraph_format.space_before = Pt(2)
    styles["Caption"].paragraph_format.space_after = Pt(8)
    styles["Caption"].paragraph_format.keep_with_next = False
    styles["Caption"].paragraph_format.keep_together = True


def add_field(paragraph, instruction, cached_value=""):
    begin_run = paragraph.add_run()
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    begin_run._r.append(begin)

    instruction_run = paragraph.add_run()
    instruction_text = OxmlElement("w:instrText")
    instruction_text.set(qn("xml:space"), "preserve")
    instruction_text.text = instruction
    instruction_run._r.append(instruction_text)

    separate_run = paragraph.add_run()
    separate = OxmlElement("w:fldChar")
    separate.set(qn("w:fldCharType"), "separate")
    separate_run._r.append(separate)

    value_run = paragraph.add_run(cached_value)
    set_run_font(value_run, size=9, color=COLOR_MUTED)

    end_run = paragraph.add_run()
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    end_run._r.append(end)


def enable_field_updates(doc):
    settings = doc.settings._element
    existing = settings.find(qn("w:updateFields"))
    if existing is not None:
        settings.remove(existing)
    uf = OxmlElement("w:updateFields")
    uf.set(qn("w:val"), "true")
    compat = settings.find(qn("w:compat"))
    if compat is not None:
        compat.addprevious(uf)
    else:
        settings.append(uf)

def add_caption(doc, label, sequence_name, text):
    counts = getattr(doc, "_report_sequence_counts", {})
    counts[sequence_name] = counts.get(sequence_name, 0) + 1
    doc._report_sequence_counts = counts
    paragraph = doc.add_paragraph(style="Caption")
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    paragraph.paragraph_format.keep_with_next = sequence_name == "Table"
    paragraph.paragraph_format.keep_together = True
    prefix = paragraph.add_run(f"{label} ")
    set_run_font(prefix, size=9, color=COLOR_MUTED, italic=True)
    add_field(
        paragraph,
        f" SEQ {sequence_name} \\* ARABIC ",
        str(counts[sequence_name]),
    )
    suffix = paragraph.add_run(f". {text}")
    set_run_font(suffix, size=9, color=COLOR_MUTED, italic=True)
    return paragraph

def set_image_alt(inline_shape, alt_text):
    properties = inline_shape._inline.docPr
    properties.set("title", alt_text[:120])
    properties.set("descr", alt_text)


def add_callout(doc, items, title, border_color="1F3864", fill_color="F4F6F9"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.rows[0]._tr.get_or_add_trPr().append(OxmlElement("w:cantSplit"))
    cell = table.cell(0, 0)
    cell.width = Cm(16.0)
    tc_pr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        '<w:top w:val="none"/>'
        f'<w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color}"/>'
        '<w:bottom w:val="none"/>'
        '<w:right w:val="none"/>'
        "</w:tcBorders>"
    )
    tc_pr.append(borders)
    set_cell_background(cell, fill_color)
    set_cell_margins(cell, top=160, bottom=160, left=240, right=200)
    heading = cell.paragraphs[0]
    heading.paragraph_format.space_after = Pt(4)
    title_run = heading.add_run(title)
    set_run_font(title_run, size=10.5, color=COLOR_NAVY, bold=True)
    for item in items:
        paragraph = cell.add_paragraph(style="List Bullet")
        paragraph.paragraph_format.space_after = Pt(2)
        run = paragraph.add_run(item)
        set_run_font(run, size=9.5)


def add_block_diagram(doc, blocks, caption):
    require(blocks, "block diagram requires at least one block")
    arrow_width_cm = 0.45
    box_width_cm = (16.0 - arrow_width_cm * (len(blocks) - 1)) / len(blocks)
    columns = len(blocks) * 2 - 1
    table = doc.add_table(rows=1, cols=columns)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    for index, block in enumerate(blocks):
        cell = table.cell(0, index * 2)
        cell.width = Cm(box_width_cm)
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        set_cell_background(cell, "E8EEF7" if index % 2 == 0 else "F7EEDC")
        set_cell_border(cell, color="8EA9C1", size=6)
        set_cell_margins(cell, top=150, bottom=150, left=100, right=100)
        paragraph = cell.paragraphs[0]
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = paragraph.add_run(block)
        set_run_font(run, size=8.5, color=COLOR_NAVY, bold=True)
        if index < len(blocks) - 1:
            arrow_cell = table.cell(0, index * 2 + 1)
            arrow_cell.width = Cm(arrow_width_cm)
            arrow_cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            arrow = arrow_cell.paragraphs[0]
            arrow.alignment = WD_ALIGN_PARAGRAPH.CENTER
            arrow_run = arrow.add_run("→")
            set_run_font(arrow_run, size=14, color=COLOR_RED, bold=True)
    add_caption(doc, "Sơ đồ", "Diagram", caption)


def add_data_table(doc, headers, rows, widths, font_size=8.5):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    header_row = table.rows[0]
    mark_repeat_header(header_row)
    for index, heading in enumerate(headers):
        cell = header_row.cells[index]
        cell.width = widths[index]
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        set_cell_background(cell, "1F3864")
        set_cell_border(cell, color="FFFFFF", size=2)
        set_cell_margins(cell, top=90, bottom=90, left=90, right=90)
        paragraph = cell.paragraphs[0]
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        paragraph.paragraph_format.keep_with_next = True
        run = paragraph.add_run(str(heading))
        set_run_font(run, size=9, color=RGBColor(0xFF, 0xFF, 0xFF), bold=True)
    for row_index, values in enumerate(rows):
        row = table.add_row()
        for column_index, value in enumerate(values):
            cell = row.cells[column_index]
            cell.width = widths[column_index]
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            set_cell_background(cell, "F4F6F9" if row_index % 2 else "FFFFFF")
            set_cell_border(cell)
            set_cell_margins(cell, top=65, bottom=65, left=80, right=80)
            paragraph = cell.paragraphs[0]
            paragraph.alignment = (
                WD_ALIGN_PARAGRAPH.CENTER
                if column_index == 0 and len(headers) > 2
                else WD_ALIGN_PARAGRAPH.LEFT
            )
            if isinstance(value, dict) and value.get("kind") == "omml":
                append_omml_formula(paragraph, value["tokens"])
            else:
                run = paragraph.add_run(str(value))
                set_run_font(run, size=font_size)
    for row in table.rows:
        row._tr.get_or_add_trPr().append(OxmlElement("w:cantSplit"))
    return table


def format_megabytes(size_bytes):
    return f"{size_bytes / 1_000_000:.1f} MB ({size_bytes:,} byte; {size_bytes / 1_048_576:.1f} MiB)".replace(",", ".")


def build_report(output_path=DEFAULT_OUTPUT, evidence=None):
    evidence = load_evidence() if evidence is None else evidence
    acceptance = evidence["acceptance"]
    gate_summary = acceptance["gateSummary"]
    release = evidence["releaseSummary"]
    release_candidate = evidence["releaseCandidate"]
    accessibility = evidence["accessibility"]
    lms_targets = evidence["lmsTargets"]
    presentation = presentation_snapshot(evidence)
    profile = decision_profile(
        acceptance,
        evidence["candidateEvidence"]["current"],
    )
    gate_status = {
        gate["gateId"]: gate["status"] for gate in acceptance["gates"]
    }

    output_path = Path(output_path)
    doc = Document()
    configure_styles(doc)
    enable_field_updates(doc)
    snapshot_time = datetime.fromisoformat(
        acceptance["generatedAt"].replace("Z", "+00:00")
    ).replace(tzinfo=None)
    doc.core_properties.title = "Báo cáo khoa học Giáo trình điện tử Cơ học lý thuyết"
    doc.core_properties.subject = "Báo cáo kỹ thuật phục vụ thẩm định độc lập"
    doc.core_properties.author = "Dự án Giáo trình điện tử Cơ học lý thuyết"
    doc.core_properties.created = snapshot_time
    doc.core_properties.modified = snapshot_time

    for section in doc.sections:
        section.page_width = Cm(21.0)
        section.page_height = Cm(29.7)
        section.top_margin = Cm(2.0)
        section.bottom_margin = Cm(2.0)
        section.left_margin = Cm(3.0)
        section.right_margin = Cm(2.0)
        section.different_first_page_header_footer = True

        first_header = section.first_page_header
        first_header.paragraphs[0].text = ""
        first_footer = section.first_page_footer
        first_footer.paragraphs[0].text = ""

        header = section.header
        header_paragraph = header.paragraphs[0]
        header_paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        header_text = profile["header"]
        header_run = header_paragraph.add_run(header_text)
        set_run_font(header_run, size=8.5, color=COLOR_MUTED, italic=True)

        footer = section.footer
        footer_paragraph = footer.paragraphs[0]
        footer_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        footer_run = footer_paragraph.add_run("Báo cáo kỹ thuật có kiểm soát bằng chứng • Trang ")
        set_run_font(footer_run, size=8.5, color=COLOR_MUTED)
        add_field(footer_paragraph, " PAGE ", "1")
        middle_run = footer_paragraph.add_run(" / ")
        set_run_font(middle_run, size=8.5, color=COLOR_MUTED)
        add_field(footer_paragraph, " NUMPAGES ", "1")

    def add_h1(text, new_page=False):
        paragraph = doc.add_paragraph(style="Heading 1")
        paragraph.paragraph_format.page_break_before = new_page
        run = paragraph.add_run(text.upper())
        set_run_font(run, size=15, color=COLOR_RED, bold=True)
        p_pr = paragraph._p.get_or_add_pPr()
        p_pr.append(
            parse_xml(
                f'<w:pBdr {nsdecls("w")}>'
                '<w:bottom w:val="single" w:sz="12" w:space="4" w:color="C00000"/>'
                "</w:pBdr>"
            )
        )
        return paragraph

    def add_h2(text):
        paragraph = doc.add_paragraph(style="Heading 2")
        run = paragraph.add_run(text)
        set_run_font(run, size=12.5, color=COLOR_NAVY, bold=True)
        return paragraph


    def add_body(text, bold_prefix=None, italic=False):
        paragraph = doc.add_paragraph(style="Normal")
        paragraph.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        paragraph.paragraph_format.first_line_indent = Cm(0.75)
        if bold_prefix:
            prefix = paragraph.add_run(bold_prefix)
            set_run_font(prefix, size=11.5, color=COLOR_NAVY, bold=True)
        run = paragraph.add_run(text)
        set_run_font(run, size=11.5, italic=italic)
        return paragraph

    def add_bullet(text, bold_prefix=None):
        paragraph = doc.add_paragraph(style="List Bullet")
        paragraph.paragraph_format.space_after = Pt(2)
        if bold_prefix:
            prefix = paragraph.add_run(bold_prefix)
            set_run_font(prefix, size=11, color=COLOR_NAVY, bold=True)
        run = paragraph.add_run(text)
        set_run_font(run, size=11)
        return paragraph

    def add_image_box(relative_path, caption, alt_text, width_cm=13.5):
        image_path = ROOT / relative_path
        provenance = evidence["imageProvenance"].get(relative_path)
        require(provenance is not None, f"unbound report image: {relative_path}")
        require(image_path.is_file(), f"missing report image: {relative_path}")
        evidence_id = f"EV-IMG-{list(evidence['imageProvenance']).index(relative_path) + 1:02d}"
        paragraph = doc.add_paragraph()
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        paragraph.paragraph_format.space_before = Pt(6)
        paragraph.paragraph_format.space_after = Pt(2)
        paragraph.paragraph_format.keep_with_next = True
        shape = paragraph.add_run().add_picture(str(image_path), width=Cm(width_cm))
        set_image_alt(shape, alt_text)
        add_caption(
            doc,
            "Hình",
            "Figure",
            f"{caption} Nguồn: {evidence_id}; {relative_path}; SHA-256 "
            f"{provenance['sha256']}; thẩm quyền: {provenance['authority']}.",
        )

    def add_meta_line(label, value):
        paragraph = doc.add_paragraph()
        paragraph.paragraph_format.first_line_indent = Cm(0.75)
        paragraph.paragraph_format.space_before = Pt(2)
        paragraph.paragraph_format.space_after = Pt(2)
        label_run = paragraph.add_run(f"{label}: ")
        set_run_font(label_run, size=10, color=COLOR_NAVY, bold=True)
        value_run = paragraph.add_run(value)
        set_run_font(value_run, size=10)

    # Neutral project cover; institutional mastheads require separate authority evidence.
    cover_line = doc.add_paragraph()
    cover_line.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cover_line.paragraph_format.space_before = Pt(10)
    cover_run = cover_line.add_run(
        "DỰ ÁN GIÁO TRÌNH ĐIỆN TỬ CƠ HỌC LÝ THUYẾT"
    )
    set_run_font(cover_run, size=11, color=COLOR_NAVY, bold=True)

    council_line = doc.add_paragraph()
    council_line.alignment = WD_ALIGN_PARAGRAPH.CENTER
    council_line.paragraph_format.space_after = Pt(26)
    council_run = council_line.add_run(
        "BÁO CÁO KỸ THUẬT PHỤC VỤ THẨM ĐỊNH ĐỘC LẬP"
    )
    set_run_font(council_run, size=12, color=COLOR_RED, bold=True)

    title_table = doc.add_table(rows=1, cols=1)
    title_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    title_cell = title_table.cell(0, 0)
    title_cell.width = Cm(16.0)
    set_cell_background(title_cell, "1F3864")
    set_cell_margins(title_cell, top=280, bottom=280, left=240, right=240)
    title_paragraph = title_cell.paragraphs[0]
    title_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title_paragraph.add_run(
        "BÁO CÁO KHOA HỌC\n"
        "ĐÁNH GIÁ GIÁO TRÌNH ĐIỆN TỬ CƠ HỌC LÝ THUYẾT"
    )
    set_run_font(title_run, size=15.5, color=RGBColor(0xFF, 0xFF, 0xFF), bold=True)
    subtitle = title_cell.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    subtitle.paragraph_format.space_before = Pt(8)
    subtitle_run = subtitle.add_run(
        "GIÁO TRÌNH ĐIỆN TỬ CƠ HỌC LÝ THUYẾT "
        "(TĨNH HỌC – ĐỘNG HỌC – ĐỘNG LỰC HỌC)"
    )
    set_run_font(subtitle_run, size=12, color=RGBColor(0xDB, 0xB3, 0x6A), bold=True)

    status_table = doc.add_table(rows=1, cols=1)
    status_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    status_cell = status_table.cell(0, 0)
    set_cell_background(status_cell, "FCE4D6" if not profile["accepted"] else "E2F0D9")
    set_cell_border(
        status_cell,
        color="C00000" if not profile["accepted"] else "548235",
        size=10,
    )
    status_paragraph = status_cell.paragraphs[0]
    status_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    status_run = status_paragraph.add_run(profile["cover"])
    set_run_font(
        status_run,
        size=11,
        color=COLOR_RED if not profile["accepted"] else COLOR_NAVY,
        bold=True,
    )

    add_meta_line("Đối tượng thẩm định", "Giáo trình điện tử Cơ học lý thuyết chạy tĩnh trên trình duyệt")
    add_meta_line("Nguồn nội dung chuẩn", "CoHocLyThuyet_Full_New.docx và CoHocLyThuyet.pdf")
    add_meta_line(
        "Phiên bản candidate",
        f"{release['releaseVersion']} — {release['staging']['fileCount']} tệp — "
        f"SHA-256 {release['package']['sha256']}",
    )
    add_meta_line(
        "Snapshot nghiệm thu",
        f"{acceptance['generatedAt']} — overallStatus={acceptance['overallStatus']} — "
        f"decision={acceptance['releaseDecision']['decision']}",
    )
    binding = evidence["candidateEvidence"]
    binding_issues = []
    if binding["missingInputs"]:
        binding_issues.append("thiếu input: " + ", ".join(binding["missingInputs"]))
    if binding["hashMismatches"]:
        binding_issues.append(
            "hash lệch: " + ", ".join(binding["hashMismatches"])
        )
    if binding["joinMismatches"]:
        binding_issues.append(
            "acceptance join lệch: " + ", ".join(binding["joinMismatches"])
        )
    add_meta_line(
        "Ràng buộc snapshot–candidate",
        (
            f"current; observedAt={binding['observedAt']}"
            if binding["current"]
            else "stale; " + "; ".join(binding_issues)
        ),
    )
    add_meta_line(
        "Tổng hợp cổng trong snapshot",
        f"{gate_summary['pass']}/{gate_summary['total']} pass; "
        f"{gate_summary['fail']} fail; {gate_summary['blocked']} blocked; "
        f"{gate_summary['notRun']} not run",
    )
    add_meta_line(
        "Giới hạn tuyên bố",
        "Không phải chứng nhận học thuật, WCAG, CDIO/ABET hoặc bằng chứng nhập LMS.",
    )

    doc.add_page_break()

    # TOC
    toc_title = doc.add_paragraph(style="Title")
    toc_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    toc_run = toc_title.add_run("MỤC LỤC")
    set_run_font(toc_run, size=20, color=COLOR_NAVY, bold=True)
    toc_paragraph = doc.add_paragraph()
    add_field(
        toc_paragraph,
        ' TOC \\o "1-3" \\h \\z \\u ',
        "Mục lục sẽ được cập nhật khi mở tài liệu trong Microsoft Word.",
    )
    table_list_title = doc.add_paragraph(style="Title")
    table_list_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    table_list_run = table_list_title.add_run("DANH MỤC BẢNG")
    set_run_font(table_list_run, size=16, color=COLOR_NAVY, bold=True)
    add_field(
        doc.add_paragraph(), ' TOC \\h \\z \\c "Table" ',
        "Danh mục bảng được cập nhật từ các trường SEQ Table trong Microsoft Word.",
    )
    doc.add_page_break()

    # Executive summary and method
    add_h1("TÓM TẮT KHOA HỌC")
    add_body(profile["summary"])
    add_body(
        "Cơ sở bằng chứng gồm manifest nội dung, registry mô phỏng, ma trận câu hỏi, "
        f"snapshot {gate_summary['total']} cổng QA và gói candidate đã khóa hash. Kết quả phân biệt rõ "
        "giữa kiểm chứng kỹ thuật, thẩm định khoa học và đánh giá người dùng."
    )
    add_body(
        "giáo trình điện tử; cơ học lý thuyết; mô phỏng tương tác; kiểm chứng khoa học; "
        "truy vết bằng chứng; học liệu ngoại tuyến",
        bold_prefix="Từ khóa: ",
        italic=True,
    )
    add_callout(
        doc,
        [
            f"Snapshot {acceptance['generatedAt']}: {gate_summary['pass']} pass; "
            f"{gate_summary['fail']} fail; {gate_summary['blocked']} blocked; "
            f"{gate_summary['notRun']} chưa chạy.",
            (
                "Candidate và snapshot acceptance đã cùng bộ input hash."
                if binding["current"]
                else "Candidate hiện hành chưa được cổng acceptance snapshot này xác nhận."
            ),
            "Kết quả tự động chứng minh hợp đồng kỹ thuật trong phạm vi đã khai báo; "
            "không thay thế kết luận của chuyên gia.",
            "Mọi tuyên bố về WCAG, CDIO/ABET, pháp lý và khả năng nhập LMS được giữ ở mức "
            "sơ bộ cho đến khi có bằng chứng độc lập.",
            "Sim2 là lớp canonical; Sim3 là pilot tùy chọn và phải fallback về Sim2.",
        ],
        "KẾT LUẬN ĐIỀU HÀNH DỰA TRÊN BẰNG CHỨNG",
        border_color="548235" if profile["accepted"] else "C00000",
        fill_color="F2F8EF" if profile["accepted"] else "FFF4F0",
    )

    add_h2("Mục tiêu, phạm vi và phương pháp")
    add_h2("Câu hỏi đánh giá")
    add_bullet(
        "Phạm vi nội dung và chuẩn đầu ra có được truy vết nhất quán từ nguồn chuẩn đến route, mô phỏng và câu hỏi hay không?",
        "Câu hỏi 1: ",
    )
    add_bullet(
        "Các mô phỏng đại diện có nêu đúng mô hình, giả thiết, đại lượng, oracle và điều kiện biên của bài toán cơ học hay không?",
        "Câu hỏi 2: ",
    )
    add_bullet(
        "Bằng chứng hiện có đủ thẩm quyền để kết luận ở mức nào, và những điều kiện nào phải hoàn tất trước nghiệm thu chính thức?",
        "Câu hỏi 3: ",
    )
    add_body(
        "Báo cáo đánh giá quy cách trình bày, kiến trúc kỹ thuật, phạm vi mô phỏng, "
        "khả năng tiếp cận, gói LMS và mức độ ràng buộc giữa candidate với snapshot bằng chứng."
    )
    add_bullet(
        "Đếm route, công thức, câu hỏi và mô phỏng trực tiếp từ manifest hoặc registry chuẩn.",
        "Định lượng: ",
    )
    add_bullet(
        "Đọc trạng thái từng gate từ data/acceptance-report.json; không suy diễn pass từ việc lệnh tồn tại.",
        "QA: ",
    )
    add_bullet(
        "Phân biệt kiểm thử tự động, technical review nội bộ và independent review.",
        "Thẩm quyền: ",
    )
    add_bullet(
        "Không thực hiện nghiên cứu thực nghiệm về hiệu quả học tập trong phạm vi báo cáo này.",
        "Ngoài phạm vi: ",
    )
    add_h2("Ma trận chuẩn đầu ra")
    outcome_rows = []
    for outcome in evidence["learningOutcomes"]["learningOutcomes"]:
        outcome_rows.append(
            (
                outcome["id"],
                outcome["title"],
                outcome["criterion"],
                outcome["status"],
            )
        )
    add_caption(
        doc,
        "Bảng",
        "Table",
        "Ma trận chuẩn đầu ra, tiêu chí đánh giá và trạng thái thẩm quyền.",
    )
    add_data_table(
        doc,
        ["Mã", "Chuẩn đầu ra", "Tiêu chí đánh giá", "Trạng thái"],
        outcome_rows,
        [Cm(3.0), Cm(3.7), Cm(7.7), Cm(2.0)],
        font_size=8.5,
    )
    add_body(
        "Ma trận hiện ở trạng thái provisional. Vì vậy báo cáo dùng các chuẩn này để kiểm tra "
        "độ phủ và truy vết, không dùng để tuyên bố chương trình đã đạt chuẩn đầu ra được phê duyệt."
    )
    add_block_diagram(
        doc,
        [
            "DOCX nguồn chuẩn",
            "Trích xuất và chuẩn hóa",
            "Runtime offline",
            f"{gate_summary['total']} cổng QA",
            "Candidate",
            "Đánh giá độc lập",
        ],
        "Luồng tạo học liệu, kiểm soát chất lượng và chuyển giao nghiệm thu.",
    )

    # Chapter 1
    add_h1("Chương 1: Tổng quan hệ thống và kiến trúc kỹ thuật", new_page=True)
    add_h2("1.1. Kiến trúc và nguồn chuẩn")
    add_body(
        "Giáo trình vận hành bằng HTML, CSS và JavaScript tĩnh qua file://, USB hoặc static server. "
        "DOCX giữ vai trò nguồn narrative chuẩn; các fragment, bundle và manifest sinh tự động "
        "không được sửa tay."
    )
    add_bullet(
        "Runtime không yêu cầu backend hoặc CDN; npm chỉ phục vụ phát triển và QA.",
        "Ngoại tuyến: ",
    )
    add_bullet(
        "KaTeX, Three.js và PDF.js được đóng gói cục bộ trong candidate.",
        "Phụ thuộc: ",
    )
    add_bullet(
        "Dữ liệu người học như tiến độ, ghi chú và quiz attempt lưu cục bộ trong trình duyệt.",
        "Dữ liệu người dùng: ",
    )
    add_image_box(
        "images/ch1/hinh-002.png",
        "Mô hình liên kết lực và sơ đồ phân tích vật thể tự do trong Tĩnh học.",
        "Sơ đồ vật thể tự do và các lực liên kết dùng trong nội dung Chương 1.",
        12.0,
    )

    add_h2("1.2. Quy mô nội dung")
    chapter_counts = evidence["chapterCounts"]
    add_body(
        f"Hệ thống có {len(evidence['routes'])} route: Chương 1 có {chapter_counts[1]}, "
        f"Chương 2 có {chapter_counts[2]}, Chương 3 có {chapter_counts[3]} và "
        f"{evidence['otherRoutes']} route dẫn nhập/tra cứu."
    )
    route_rows = [
        ("Chương 1", "Tĩnh học", chapter_counts[1]),
        ("Chương 2", "Động học", chapter_counts[2]),
        ("Chương 3", "Động lực học", chapter_counts[3]),
        ("Bổ trợ", "Lời nói đầu, tác giả, tài liệu tham khảo", evidence["otherRoutes"]),
    ]
    add_caption(doc, "Bảng", "Table", "Phân bố route theo chương.")
    add_data_table(doc, ["Phần", "Phạm vi", "Số route"], route_rows, [Cm(3.0), Cm(10.0), Cm(3.0)])

    method_heading = add_h2("1.3. Phương pháp xây dựng giáo trình điện tử")
    method_heading.paragraph_format.page_break_before = True
    method_heading.paragraph_format.space_before = Pt(0)
    method_paragraphs = [
        (
            "Nội dung và thiết kế sư phạm. ",
            "Nguồn Word được tổ chức theo chương, mục, mục tiêu, lý thuyết, ví dụ và bài tập. "
            "Số hóa trích xuất văn bản, hình và công thức thành nội dung web, rồi đối chiếu ký hiệu, "
            "đơn vị, số hình và liên kết với nguồn. Câu hỏi và mô phỏng được biên soạn riêng, "
            "không mặc nhiên sinh từ Word; mục tiêu provisional chưa phải chuẩn đầu ra đã duyệt.",
        ),
        (
            "Hình tĩnh và hình ảnh động. ",
            f"Hình có chú thích và văn bản thay thế. {len(GIF_ROWS)} GIF trong gói ứng viên được "
            "dựng bằng mã Python theo hình học và quan hệ cơ học, tạo chuỗi khung hình rồi xuất GIF. "
            "Người học có thể chuyển về PNG. Trước khi publish, cần duyệt vật lý, nhãn, trình tự "
            "chuyển động và dung lượng, không chỉ hiệu ứng thị giác.",
        ),
        (
            "Mô phỏng 2D, 3D và thời gian. ",
            "Mỗi bài xác định giả thiết, phương trình, hệ quy chiếu, tham số và miền áp dụng; "
            "phần tính toán nối với hình và điều khiển. "
            f"Có {len(evidence['simulationSpecs'])} vị trí 2D, trong đó {len(evidence['sim3Reviews'])} "
            "vị trí có bản 3D thử nghiệm Three.js/WebGL và dự phòng 2D. Hình học, vật thể và véc tơ "
            "gắn với state, không chỉ xoay hình tĩnh. Hồ sơ chỉnh sửa dùng 4D theo nghĩa 3D+t "
            "khi có diễn biến thời gian; đổi tham số tĩnh học không tự động là 4D.",
        ),
        (
            "Video và âm thanh — phương án bổ sung. ",
            "Hiện trạng được kiểm kê riêng tại mục 1.4; không tính prototype media thành video. "
            "Nếu được duyệt: chọn mục tiêu → kịch bản/lời đọc → quay hoặc ghi màn hình → thu âm "
            "→ dựng, đồng bộ → duyệt chuyên môn → xuất MP4/H.264 và AAC. Cần phụ đề, bản chép lời "
            "và mô tả tương đương; phát theo yêu cầu, không tự phát âm thanh, đóng gói tệp cục bộ.",
        ),
        (
            "Tìm kiếm và tự đánh giá. ",
            "Chỉ mục từ nội dung bài hỗ trợ tiếng Việt có dấu/không dấu và dẫn tới đoạn liên quan, "
            "không phải tìm công thức theo ngữ nghĩa. "
            f"Ngân hàng {sum(evidence['quizCounts'].values())} câu có phản hồi đúng/sai và giải thích. "
            "Kết quả, tiến độ lưu trên trình duyệt, chưa gắn danh tính hoặc sổ điểm LMS. Đánh giá "
            "chính thức cần ma trận mục tiêu, quy tắc chấm, rubric và tổ chức kiểm tra được duyệt.",
        ),
        (
            "Đóng gói và bàn giao. ",
            "Sản phẩm chính là web tĩnh HTML/CSS/JavaScript, ZIP kèm thư viện/tài nguyên cục bộ, "
            "danh mục tệp, phiên bản, SHA-256 và giấy phép; giải nén mở index.html hoặc dùng máy chủ web. "
            "QTI 3/CC 1.4 chỉ có phạm vi kiểm cục bộ giới hạn; chưa chứng minh LMS đích, "
            "SCORM hay xAPI/cmi5. Mức chuẩn bị adapter không thay kết quả gate trong snapshot.",
        ),
        (
            "Quy trình tổng thể và trách nhiệm. ",
            "Biên soạn → thiết kế kịch bản → số hóa/sản xuất → tích hợp → kiểm chuyên môn/kỹ thuật "
            "→ thử người học theo kế hoạch → chỉnh sửa → đóng gói, phê duyệt, bàn giao. Chủ biên "
            "chốt phạm vi; chuyên gia duyệt mô hình; kỹ thuật giữ nguồn và phiên bản; QA lưu minh chứng "
            "đúng gói. Review độc lập và quyết định của đơn vị có thẩm quyền là bước riêng; "
            "gói ứng viên hoặc kiểm kỹ thuật không thay nghiệm thu.",
        ),
    ]
    for prefix, text in method_paragraphs:
        paragraph = add_body(text, bold_prefix=prefix)
        paragraph.paragraph_format.first_line_indent = Cm(0)
        paragraph.paragraph_format.line_spacing = 1.05
        paragraph.paragraph_format.space_before = Pt(0)
        paragraph.paragraph_format.space_after = Pt(5)
        paragraph.paragraph_format.keep_together = True
        for run in paragraph.runs:
            run.font.size = Pt(11)

    scope_heading = add_h2("1.4. Hiện trạng và phạm vi cam kết")
    scope_heading.paragraph_format.page_break_before = True
    add_body(presentation["basis"])
    add_caption(doc, "Bảng", "Table", "Hiện trạng và phạm vi cam kết thống nhất với đề cương chỉnh sửa.")
    add_data_table(
        doc, presentation["headers"], presentation["rows"],
        [Cm(3.0), Cm(6.6), Cm(6.4)], font_size=8.5,
    )
    add_body(
        "Bốn pilot đa phương tiện Chương 1 gồm hình động, biểu đồ, mô phỏng và tương tác từng bước; "
        "không phải bốn video. Bảng trên là đối chiếu thuyết minh, không tạo kết quả QA mới. "
        "Các snapshot cũ được giữ làm lịch sử của đúng phiên bản và phạm vi, không tự đóng finding cũ."
    )

    add_h2("1.5. Quy trình tổ chức và pipeline xây dựng")
    add_body(
        "Workflow là luồng tổ chức, duyệt và bàn giao; pipeline là chuỗi biến đổi kỹ thuật từ "
        "nguồn sang hiện vật. Trách nhiệm dưới đây là phương án tổ chức, không ghi nhận đã hoàn tất "
        "mọi bước, đặc biệt thử nghiệm người học và phê duyệt độc lập."
    )
    add_caption(doc, "Bảng", "Table", "Workflow, đầu ra và trách nhiệm đề xuất.")
    add_data_table(
        doc, presentation["workflowHeaders"], presentation["workflowRows"],
        [Cm(2.6), Cm(6.6), Cm(6.8)], font_size=8.5,
    )
    pipeline_rows = [
        (
            "Nội dung — hiện có",
            "DOCX, ánh xạ công thức và dữ liệu tham chiếu; quiz biên soạn riêng",
            "analyze_docx.py → extract_docx.py → chapters/images → update_nav.py → bundle_pages.py "
            "→ build_content_manifest.py/validate_content_manifest.py → build_search_index.py → audit.py; "
            "quiz qua gen_quiz_pages.py → trang câu hỏi",
            "Chủ biên đối chiếu nguồn; kỹ thuật tái tạo; QA kiểm liên kết, ký hiệu và công thức",
        ),
        (
            "GIF — hiện có",
            "PNG tham chiếu, ý nghĩa vật lý và kịch bản chuyển động",
            "generate-gifs.py dựng hình học/chuỗi frame → GIF và contact sheet → duyệt/kiểm "
            "→ publish-gifs.py → assets/gifs và ánh xạ GIF/PNG",
            "Người biên soạn/chuyên gia duyệt vật lý; kỹ thuật sinh/publish; QA kiểm tệp và fallback",
        ),
        (
            "Mô phỏng — hiện có",
            "Bài toán, phương trình, giả thiết, hệ quy chiếu và đặc tả",
            "Hàm tính/state → hình 2D hoặc hình học Three.js → control/readout/thời gian khi có "
            "→ đối chiếu nghiệm chuẩn và biên → tích hợp bài, bằng chứng",
            "Chuyên gia xác nhận mô hình; kỹ thuật giữ ngữ nghĩa 2D/3D; QA kiểm tương đương và fallback",
        ),
        (
            "Video/âm thanh — đề xuất",
            "Mục tiêu được duyệt, kịch bản/lời đọc, mô hình hoặc thí nghiệm và quyền sử dụng",
            "Ghi hình/thu âm → dựng/đồng bộ → phụ đề/chép lời/mô tả → duyệt → mã hóa "
            "→ tệp cục bộ/player và kiểm ngoại tuyến",
            "Chủ biên duyệt phạm vi; chuyên gia duyệt nội dung; kỹ thuật sản xuất; QA kiểm phát/a11y",
        ),
        (
            "Đóng gói — hiện có",
            "Nội dung đồng bộ và policy/danh sách tệp cho phép",
            "tools/release/release.py: staging → manifest/SHA-256/thông tin thư viện "
            "→ kiểm staging → ZIP → kiểm ZIP → gói ứng viên; review/phê duyệt là bước riêng",
            "Kỹ thuật khóa gói; QA tạo bằng chứng đúng phiên bản; đơn vị có thẩm quyền quyết định bàn giao",
        ),
    ]
    add_caption(doc, "Bảng", "Table", "Pipeline: đầu vào, biến đổi, đầu ra và trách nhiệm.")
    add_data_table(
        doc, ["Pipeline", "Đầu vào", "Biến đổi và đầu ra", "Trách nhiệm/kiểm soát"],
        pipeline_rows, [Cm(2.4), Cm(3.4), Cm(6.2), Cm(4.0)], font_size=8.2,
    )
    add_body(
        "Sửa nguồn hoặc dữ liệu có thẩm quyền rồi tái tạo phần bị ảnh hưởng; không vá rời HTML, "
        "bundle hay manifest đã sinh. Các công cụ hiện có chứng minh đường sản xuất, không tự "
        "chứng minh các cổng của gói đang pass hoặc học liệu đã được nghiệm thu."
    )

    # Chapter 2
    add_h1("Chương 2: Quy cách trình bày và chuẩn tiêu chí", new_page=True)
    add_h2("2.1. Toán học ngữ nghĩa")
    add_body(
        f"Content manifest ghi {evidence['equationOccurrenceCount']} lần xuất hiện công thức; "
        f"registry ngữ nghĩa hiện có {evidence['equationCount']} hàng ánh xạ. "
        "Hai chỉ số phục vụ hai mục đích khác nhau và không được dùng thay thế nhau."
    )
    add_bullet(
        "KaTeX/MathML cung cấp hiển thị vector sắc nét và nội dung ngữ nghĩa trong phạm vi mapping.",
        "Hiển thị: ",
    )
    add_bullet(
        "Extractor loại placeholder '(.)' và strict tests bảo vệ hồi quy.",
        "Làm sạch: ",
    )
    add_bullet(
        "Technical PASS không thay thế kiểm tra ý nghĩa, đơn vị và ngữ cảnh của chuyên gia cơ học.",
        "Giới hạn: ",
    )
    add_image_box(
        "images/ch1/hinh-078.png",
        "Sơ đồ dầm chịu tải trọng phân bố và biểu đồ nội lực.",
        "Dầm chịu tải phân bố và biểu đồ nội lực dùng làm mẫu kiểm tra trình bày công thức–hình.",
        13.0,
    )

    add_h2("2.2. Ảnh động và phương án giảm chuyển động")
    add_body(
        f"{len(GIF_ROWS)} GIF trong gói ứng viên được ánh xạ sang ảnh PNG canonical. Runtime chuyển "
        "về PNG khi người dùng bật prefers-reduced-motion hoặc khi GIF không tải được."
    )
    add_body(
        "Chọn hình theo mục tiêu và ý nghĩa vật lý, dùng PNG làm tham chiếu rồi dựng lại hình học "
        "và chuyển động bằng gif-conversion-workspace/generate-gifs.py. Bộ sinh tạo chuỗi frame, "
        "GIF và contact sheet để đối chiếu nhãn, hệ quy chiếu, chiều chuyển động và tính liên tục. "
        "Sau duyệt chuyên môn, publish-gifs.py kiểm tệp và đưa vào assets/gifs; js/gif-figures.js "
        "sở hữu ánh xạ và lựa chọn GIF/PNG. Kiểm sinh/publish không phải duyệt vật lý độc lập."
    )
    add_caption(
        doc,
        "Bảng",
        "Table",
        f"Danh mục {len(GIF_ROWS)} GIF và ảnh PNG dự phòng.",
    )
    gif_table_rows = [
        (index, gif_path, description, fallback)
        for index, (gif_path, description, fallback) in enumerate(GIF_ROWS, 1)
    ]
    add_data_table(
        doc,
        ["STT", "GIF", "Hiện tượng", "PNG dự phòng"],
        gif_table_rows,
        [Cm(1.0), Cm(4.6), Cm(6.5), Cm(4.3)],
        font_size=7.8,
    )
    add_image_box(
        "images/ch2/hinh-196.png",
        "Cơ cấu truyền động bánh răng ăn khớp trong.",
        "Hình cơ cấu truyền động bánh răng thuộc nội dung Chương 2.",
        12.5,
    )

    add_h2("2.3. Trắc nghiệm và gói LMS")
    quiz_total = sum(evidence["quizCounts"].values())
    quiz_distribution = ", ".join(
        f"Chương {chapter}: {count}"
        for chapter, count in sorted(evidence["quizCounts"].items())
    )
    lms_gate_status = gate_status["lms-adapters"]
    lms_result = (
        "Gate adapter QTI 3/Common Cartridge 1.4 đã pass kiểm tra cục bộ."
        if lms_gate_status == "pass"
        else f"Gate adapter LMS có trạng thái {lms_gate_status}; không tuyên bố đã đạt."
    )
    add_body(
        f"Kho câu hỏi có {quiz_total} mục ({quiz_distribution}). {lms_result}"
    )
    add_body(
        "Đây là tự đánh giá trực tiếp trên giáo trình: trả lời nhận phản hồi đúng/sai và giải thích; "
        "attempt, kết quả và tiến độ lưu cục bộ trên trình duyệt qua js/quiz-state.js và js/quiz.js. "
        "Chưa có danh tính người học, sổ điểm tập trung hoặc đồng bộ LMS. Số câu không tự chứng minh "
        "độ phủ chuẩn đầu ra hay độ đúng học thuật của toàn bộ ngân hàng."
    )
    add_body(
        "Phương án biên soạn/đánh giá: lập ma trận mục tiêu–nội dung–mức độ → viết câu hỏi, đáp án "
        "và phản hồi → phản biện chuyên môn → kiểm quy tắc chấm → thử người học → phân tích, chỉnh sửa. "
        "Ngưỡng 70% trong dữ liệu chỉ là quy tắc kỹ thuật tự đánh giá, không phải chuẩn đạt học phần. "
        "Hoạt động mô phỏng có thể dùng dự đoán → đổi tham số → quan sát → giải thích với rubric "
        "giảng viên duyệt nếu cho điểm; chưa có chức năng tự chấm thao tác mô phỏng. Đánh giá chính "
        "thức cần quy trình danh tính, kết quả đáng tin cậy, phân quyền và bảo vệ dữ liệu được phê duyệt."
    )
    add_bullet(
        "Không có target LMS hoặc execution evidence; chưa tuyên bố nhập thành công vào "
        "Canvas, Moodle hay Blackboard.",
        "Giới hạn liên thông: ",
    )
    add_bullet(
        f"Trạng thái data/lms-targets.json: {lms_targets['status']}.",
        "Nguồn trạng thái: ",
    )

    add_h2("2.4. Khả năng tiếp cận")
    accessibility_gate_status = gate_status["phase-08-accessibility"]
    if accessibility_gate_status == "pass":
        accessibility_result = (
            f"Automation bằng {accessibility['automation']['runner']} trên "
            f"{accessibility['automation']['transport']} có trạng thái "
            f"{accessibility['automation']['status']}."
        )
    else:
        accessibility_result = (
            f"Gate accessibility automation có trạng thái "
            f"{accessibility_gate_status}; không tuyên bố đã đạt."
        )
    add_body(
        f"{accessibility_result} Manual review hiện là "
        f"{accessibility['manualReview']['status']}."
    )
    add_bullet(
        "Automation bao phủ shell, search, quiz, PDF chrome và một số điều khiển mô phỏng đại diện.",
        "Đã kiểm: ",
    )
    add_bullet(
        "Screen reader, text spacing, focus-obscured, motion comprehension và scientific "
        "visualization equivalence còn cần đánh giá thủ công.",
        "Chưa đủ bằng chứng: ",
    )
    add_bullet(
        "Báo cáo không tuyên bố tuân thủ WCAG 2.2 AA toàn hệ thống.",
        "Phạm vi tuyên bố: ",
    )
    add_image_box(
        "assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/assets/img-02-trang-chu-mobile-390x844.png",
        "Giao diện trang chủ tại viewport 390 × 844, bằng chứng responsive đại diện.",
        "Ảnh chụp giao diện mobile 390 × 844; bằng chứng trình bày, không phải chứng nhận WCAG.",
        6.5,
    )

    add_h2("2.5. Video và âm thanh")
    add_body(
        "Hiện trạng video/âm thanh giới hạn ở danh mục tệp và các đuôi đã kiểm kê trong bảng tại mục 1.4, "
        "không suy từ số prototype. Bốn pilot Chương 1 không được tính thành bốn video. Các yêu cầu "
        "dưới đây là phương án bổ sung khi mục tiêu và phạm vi được chủ biên duyệt, chưa phải kết quả đã làm."
    )
    add_body(
        "Chọn mục tiêu → viết kịch bản/bảng phân cảnh và lời đọc → chuẩn bị mô hình hoặc thí nghiệm "
        "→ quay/ghi màn hình và thu âm → dựng, đồng bộ → bổ sung phụ đề, bản chép lời, mô tả tương đương "
        "→ duyệt cơ học và quyền sử dụng → mã hóa → tích hợp, thử ngoại tuyến/thiết bị đích. Có thể chọn "
        "OBS và FFmpeg để ghi hình/mã hóa; đây là lựa chọn đề xuất, không xác nhận dự án đã sử dụng. "
        "Video ghi một diễn biến lựa chọn, không thay tương tác đổi tham số của mô phỏng."
    )
    add_body(
        "Đề xuất phân phối MP4 với H.264 và AAC; âm thanh riêng có thể dùng MP3/AAC, cần thử "
        "trên thiết bị đích. Có điều khiển phát/dừng/âm lượng, không tự phát âm thanh; tệp bắt buộc "
        "đóng gói cục bộ. Mỗi học liệu lưu mã, bài/mục, mục tiêu, tác giả/nguồn, quyền sử dụng, phiên bản, "
        "tệp nguồn/xuất bản, nội dung thay thế và trạng thái duyệt. Phụ đề tự sinh hoặc AI hỗ trợ "
        "phải được người biên soạn kiểm, nhất là tên đại lượng, đơn vị và quan hệ vật lý."
    )

    add_h2("2.6. Điều hướng và tìm kiếm")
    add_body(
        "Mục lục phân cấp, breadcrumb và điều hướng trước/sau dẫn tới bài học và học liệu liên quan. "
        "tools/build_search_index.py sở hữu chỉ mục nội dung cục bộ; js/search.js sở hữu xử lý "
        "tiếng Việt có dấu/không dấu, trích đoạn và route/anchor kết quả. Khi chỉ mục không khả dụng, "
        "runtime thông báo chế độ tìm theo mục lục. Sau sửa nội dung phải tái tạo chỉ mục và kiểm liên kết."
    )
    add_body(
        "Phạm vi là văn bản đã lập chỉ mục, không mặc nhiên là tìm công thức theo ngữ nghĩa hoặc "
        "tìm trong trình đọc PDF. Quan sát cây làm việc chỉ chứng minh luồng đã thao tác; không "
        "thay QA toàn bộ gói đóng băng hoặc tự xóa finding của snapshot lịch sử."
    )

    add_h2("2.7. Cấu trúc, văn bản, bảng và hình")
    add_body(
        "Quy cách biên soạn đề xuất giữ chương/mục thống nhất đề cương, mục tiêu, lý thuyết, ví dụ, "
        "câu hỏi ôn tập, bài tập và tham khảo phù hợp. Dùng Unicode tiếng Việt, tiêu đề có phân cấp, "
        "thuật ngữ/ký hiệu/đơn vị nhất quán; đối chiếu véc tơ, chỉ số, phân số và số công thức với nguồn. "
        "Nguồn narrative và đường đồng bộ thuộc CoHocLyThuyet_Full_New.docx và tools/extract_docx.py; "
        "dữ liệu tham chiếu và ánh xạ toán học có owner riêng, không suy mọi học liệu tự sinh từ Word."
    )
    add_body(
        "Hình/bảng cần số, tên, chú thích, nguồn/quyền sử dụng; alt phải diễn đạt ý nghĩa thay vì tên tệp. "
        "Chữ trong hình không mất nét hoặc quá nhỏ khi phóng to; PNG/JPEG/SVG chọn theo nguồn. "
        "Bản điện tử cho phép điều chỉnh chữ và bố cục màn hình hẹp, không áp một cỡ pixel cho mọi "
        "thiết bị. Word/PDF theo mẫu cơ sở duyệt; đối chiếu nguồn, khả năng tiếp cận và chuyên môn "
        "là điều kiện kiểm riêng, không tuyên bố mọi hình/bảng đã đạt chỉ vì xuất được tài liệu."
    )

    add_h2("2.8. Đóng gói và quản lý phiên bản")
    add_body(
        "Gói chính là web tĩnh HTML/CSS/JavaScript với thư viện và tài nguyên cục bộ, phân phối ZIP; "
        "giải nén mở index.html hoặc triển khai máy chủ web. tools/release/release.py và policy/schema "
        "phát hành sở hữu staging, danh mục tệp, phiên bản, SHA-256 và thông tin thư viện/giấy phép. "
        "ZIP là cách phân phối, HTML là nền tảng nội dung, không đồng nghĩa SCORM hay nghiệm thu cuối."
    )
    add_body(
        f"Theo data/lms-targets.json: QTI 3={lms_targets['stages']['qti3']['readiness']}, "
        f"Common Cartridge 1.4={lms_targets['stages']['commonCartridge']['readiness']}; "
        f"QTI kiểm câu một lựa chọn, tối đa {lms_targets['stages']['qti3']['maximumValidationItems']} mục, "
        "không chứng minh đã chuyển đủ ngân hàng câu hỏi. CC chỉ là static webcontent. "
        f"Trạng thái liên thông={lms_targets['status']}; mức chuẩn bị không thay kết quả gate LMS "
        "trong snapshot và chưa chứng minh nhập/chạy, lưu điểm trên hệ thống đích."
    )
    add_body(
        f"SCORM={lms_targets['stages']['scorm']['readiness']}; "
        f"xAPI/cmi5={lms_targets['stages']['xapiCmi5']['readiness']}, chưa triển khai trong phạm vi hiện tại. "
        "Chỉ chọn edition/profile sau khi biết LMS/LRS, mục đích, danh tính và quyền riêng tư. "
        "Nếu có yêu cầu SCORM, phải xây manifest/gói/runtime API, ánh xạ completion/score/resume "
        "và kiểm nhập–mở–học–lưu–mở lại; tải ZIP lên LMS không đủ. xAPI là trao đổi sự kiện, cmi5 "
        "là cách sử dụng trong bối cảnh LMS, không gọi xAPI riêng là định dạng ZIP thay SCORM. "
        "Không bắt buộc đồng thời mọi chuẩn khi nhu cầu không yêu cầu."
    )
    add_body(
        "Khi cập nhật, sửa nguồn, tái tạo và khóa phiên bản; bằng chứng phải gắn đúng gói/hash. "
        "Giữ gói và snapshot cũ làm lịch sử, không sửa riêng dòng kết luận để nâng trạng thái. "
        "Tạo gói, kiểm kỹ thuật, review độc lập và quyết định sử dụng/công bố là các bước khác nhau."
    )

    # Chapter 3
    add_h1("Chương 3: Phương pháp luận và kiến trúc mô phỏng", new_page=True)
    add_h2("3.1. Giới hạn khái niệm 4D")
    add_body(
        "Hồ sơ chỉnh sửa chuẩn hóa 4D theo nghĩa quy ước 3D+t: ba chiều không gian và diễn biến "
        "theo thời gian khi phù hợp. Đây không phải bốn chiều không gian, chuẩn tệp hoặc runtime riêng. "
        "Ưu tiên tên ‘mô phỏng 3D tương tác, có diễn biến theo thời gian khi phù hợp’; không yêu cầu "
        "mọi bài có 3D/4D và không coi thay đổi tham số của bài tĩnh học là 4D."
    )
    add_bullet(
        "Biểu diễn 3D khi chiều sâu làm rõ quan hệ cơ học mà 2D khó phân biệt.",
        "Không gian: ",
    )
    add_bullet(
        "Chỉ dùng nhãn 3D+t khi có bài toán, chuỗi trạng thái theo thời gian, thao tác và tiêu chí "
        "kiểm chứng tương ứng; nhịp vẽ hình không chứng minh độ chính xác phép tính.",
        "Điều kiện dùng 3D+t: ",
    )
    add_bullet(
        "Điều khiển, drag handle hoặc chuyển giữa Sim2 và Sim3.",
        "Tương tác: ",
    )

    add_h2("3.2. Sim2 canonical")
    simulation_gate_status = gate_status["simulation-evidence-currentness"]
    simulation_evidence_text = (
        "Gate currentness mô phỏng đã pass."
        if simulation_gate_status == "pass"
        else f"Gate currentness mô phỏng có trạng thái {simulation_gate_status}; "
        "các mô tả sau chỉ là inventory."
    )
    add_body(
        f"Registry Sim2 có {len(evidence['simulationSpecs'])} route SVG-first. "
        f"{simulation_evidence_text} Đồng hồ fixed-step 1/60 s cung cấp nhịp cập nhật ổn định; "
        "phương pháp tính vật lý phụ thuộc từng route. RK4 chỉ dùng ở bài toán ODE phù hợp, "
        "không phải mặc định cho mọi mô phỏng."
    )
    add_bullet("Biến đổi world-to-screen và responsive CSS scale.", "Hình học: ")
    add_bullet("Native controls, drag handle và readout cùng dùng một state.", "Tương tác: ")
    add_bullet("dispose() dọn listener, observer, RAF và DOM thuộc route.", "Vòng đời: ")

    add_h2("3.3. Sim3 pilot và fallback")
    sim3_gate_status = gate_status["sim3-pilot"]
    sim3_evidence_text = (
        "Gate Sim3 pilot đã pass."
        if sim3_gate_status == "pass"
        else f"Gate Sim3 pilot có trạng thái {sim3_gate_status}; không tuyên bố đã đạt."
    )
    add_body(
        f"Registry có {len(evidence['simulationSpecs'])} vị trí Sim2 cơ sở; "
        f"{len(evidence['sim3Reviews'])} vị trí trong số đó có adapter Sim3 pilot, không phải "
        f"{len(evidence['simulationSpecs']) + len(evidence['sim3Reviews'])} bài độc lập. "
        f"{sim3_evidence_text} Đây là lớp tùy chọn; Sim2 vẫn là đường chạy canonical. "
        "Technical review không phải phê duyệt sư phạm độc lập."
    )
    add_body(
        "Phương pháp dựng 3D hiện có sử dụng hình học Three.js: trục, vật thể, đường/quỹ đạo và "
        "véc tơ trong js/sim3/sims, với primitives và hệ quy chiếu tại js/sim3/core. Adapter ánh xạ "
        "trạng thái tính toán sang vị trí, góc quay và hướng/độ lớn véc tơ; control và readout giữ "
        "ngữ nghĩa bài toán với lớp Sim2. Không chỉ xoay hình tĩnh, không có căn cứ tuyên bố "
        "đã dùng Blender, Unity, Unreal hay nguồn glTF. Cần đối chiếu nghiệm chuẩn, đơn vị/dấu, "
        "miền biên và tương đương 2D/3D trước duyệt giá trị sư phạm."
    )
    add_bullet("Hệ tọa độ tay phải: +X phải, +Y lên, +Z hướng về người xem.", "Tọa độ: ")
    add_bullet("Render theo nhu cầu, cap DPR và giải phóng tài nguyên GPU.", "Hiệu năng: ")
    add_bullet("WebGL/setup/render lỗi phải thông báo tiếng Việt và trở về Sim2.", "Fallback: ")
    add_block_diagram(
        doc,
        [
            "Sim2 canonical",
            "Đánh giá giá trị chiều sâu",
            "Bật Sim3 pilot",
            "Theo dõi lỗi/nhận thức",
            "Fallback Sim2",
        ],
        "Quan hệ Sim2 canonical, Sim3 pilot và đường fallback.",
    )
    add_h2("3.4. Ba mẫu kiểm chứng khoa học đại diện")
    add_body(
        "Ba mẫu được chọn theo ba mạch kiến thức chính. Mỗi mẫu ghi rõ mô hình, giả thiết, "
        "đại lượng quan sát, oracle đối chiếu và giới hạn kết luận; đây là mẫu thẩm định, "
        "không thay cho việc chuyên gia rà soát toàn bộ danh mục mô phỏng."
    )
    scientific_case_rows = [
        (
            "Chương 1 · ch1-6-3",
            "Trọng tâm hình phẳng ghép và khoét",
            omml_value([("sub", "x", "C"), " = Σ(Ax) / ΣA; ", ("sub", "y", "C"), " = Σ(Ay) / ΣA"]),
            "Đối xứng, giới hạn không khoét và dấu diện tích",
        ),
        (
            "Chương 2 · ch2-4-4",
            "Hợp chuyển động và gia tốc Coriolis",
            omml_value([("sub", "a", "C"), " = 2ω × ", ("sub", "v", "rel")]),
            "Chiều vectơ, đơn vị và trường hợp ω hoặc vrel bằng 0",
        ),
        (
            "Chương 3 · ch3-6-2",
            "Va chạm một chiều với hệ số phục hồi",
            omml_value([("sub", "p", "trước"), " = ", ("sub", "p", "sau"), "; 0 ≤ e ≤ 1"]),
            "Miền 0 ≤ e ≤ 1, dấu vận tốc và các trường hợp biên",
        ),
    ]
    add_caption(
        doc,
        "Bảng",
        "Table",
        "Ba ca kiểm chứng khoa học đại diện cho Tĩnh học, Động học và Động lực học.",
    )
    add_data_table(
        doc,
        ["Ca", "Bài toán", "Mô hình/giả thiết", "Oracle và biên"],
        scientific_case_rows,
        [Cm(3.1), Cm(4.0), Cm(4.8), Cm(4.5)],
        font_size=8.2,
    )
    add_image_box(
        "assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/assets/sim-live-ch1-6-3.png",
        "Chương 1 — ảnh chụp runtime kiểm chứng trọng tâm hình phẳng ghép và phần diện tích khoét, route ch1-6-3.",
        "Ảnh chụp runtime Chương 1 về trọng tâm hình phẳng ghép với phần diện tích âm.",
        15.5,
    )
    add_image_box(
        "assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/assets/sim-live-ch2-4-4.png",
        "Chương 2 — ảnh chụp runtime kiểm chứng hướng và độ lớn gia tốc Coriolis, route ch2-4-4.",
        "Ảnh chụp runtime Chương 2 về hợp chuyển động và gia tốc Coriolis.",
        15.5,
    )
    add_image_box(
        "assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/assets/sim-live-ch3-6-2.png",
        "Chương 3 — ảnh chụp runtime kiểm chứng trạng thái sau va chạm và hệ số phục hồi, route ch3-6-2.",
        "Ảnh chụp runtime Chương 3 về va chạm một chiều và hệ số phục hồi.",
        15.5,
    )

    # Chapter 4
    add_h1("Chương 4: Demo hệ thống và danh mục mô phỏng", new_page=True)
    add_h2("4.1. Kịch bản demo hệ thống trong 90 giây")
    add_body(
        "Kịch bản demo được giới hạn ở một chuỗi quan sát có thể kiểm chứng: mở gói ngoại tuyến, "
        "điều hướng đến bài Mô men, thao tác Sim2, đọc đầu ra và đối chiếu bản PDF cục bộ."
    )
    add_block_diagram(
        doc,
        [
            "Mở package qua file://",
            "Chương 1 › Mô men",
            "O cố định; F = 50 N; d⊥ = 4,00 m",
            "M = 200 N·m",
            "Đối chiếu PDF",
        ],
        "Luồng demo 90 giây từ gói ngoại tuyến đến đối chiếu nội dung.",
    )
    demo_rows = [
        ("00:00–00:15", "Mở gói", "package/index.html qua file://"),
        ("00:15–00:30", "Vào bài", "Chương 1 › I › 4. Mô men"),
        ("00:30–01:00", "Thao tác", "Giữ F = 50 N; kéo điểm đặt lực đến d⊥ = 4,00 m"),
        ("01:00–01:15", "Quan sát", "Readout M = 200 N·m; chiều quay cập nhật"),
        ("01:15–01:30", "Đối chiếu", "Mở PDF cục bộ và quay lại bài"),
    ]
    add_caption(doc, "Bảng", "Table", "Kịch bản demo hệ thống và tiêu chí quan sát.")
    add_data_table(
        doc,
        ["Thời gian", "Bước", "Quan sát bắt buộc"],
        demo_rows,
        [Cm(3.0), Cm(3.0), Cm(10.4)],
        font_size=8.5,
    )
    add_image_box(
        "assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/assets/img-01-trang-chu-desktop-1440x1000.png",
        "Bước 1: mở trang chủ candidate từ gói ngoại tuyến.",
        "Trang chủ giáo trình điện tử dùng làm bước mở đầu demo.",
        13.0,
    )
    add_image_box(
        "assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/assets/img-04-mo-men-ch1-1-4-1440x1000.png",
        "Bước 2–4: O cố định; giữ F = 50 N và kéo điểm đặt lực đến d⊥ = 4,00 m để đọc M = 200 N·m.",
        "Mô phỏng mô men lực với đầu vào, mô hình và readout đầu ra.",
        13.0,
    )
    add_image_box(
        "assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/assets/img-06-pdf-viewer-1440x1000.png",
        "Bước 5: mở PDF cục bộ để đối chiếu nội dung nguồn.",
        "PDF viewer cục bộ dùng trong bước đối chiếu cuối demo.",
        13.0,
    )

    add_h2("4.2. Danh mục mô phỏng đã công bố")
    add_body(
        "Danh mục dưới đây sinh từ data/simulation-specifications.json. Cột tương tác chỉ mô tả "
        "bề mặt người học; tính đúng học thuật vẫn cần reviewer độc lập."
    )
    sim3_ids = {record["id"] for record in evidence["sim3Reviews"]}
    sim_rows = []
    for spec in evidence["simulationSpecs"]:
        engine = "Sim2 SVG"
        if spec["id"] in sim3_ids:
            engine += " + Sim3 pilot"
        sim_rows.append(
            (
                spec["id"],
                f"Chương {spec['chapter']}",
                spec["title"],
                engine,
                SIM_INTERACTIONS.get(spec["id"], "Điều khiển theo route"),
            )
        )
    add_caption(
        doc,
        "Bảng",
        "Table",
        f"Danh mục {len(evidence['simulationSpecs'])} route Sim2 và "
        f"{len(evidence['sim3Reviews'])} adapter Sim3 pilot.",
    )
    add_data_table(
        doc,
        ["Route", "Chương", "Bài toán", "Động cơ", "Tương tác"],
        sim_rows,
        [Cm(2.3), Cm(1.8), Cm(5.2), Cm(3.1), Cm(4.0)],
        font_size=7.8,
    )
    add_image_box(
        "tools/sim2-visual/selective-baseline.spec.js-snapshots/ch2-3-2-transmission-win32.png",
        "Mô phỏng truyền động bánh răng, route ch2-3-2.",
        "Ảnh chụp mô phỏng cơ cấu truyền động tại route ch2-3-2.",
    )

    # Chapter 5
    add_h1("Chương 5: Kết quả định lượng và ma trận QA", new_page=True)
    add_h2("5.1. Candidate")
    add_body(
        f"Candidate {release['releaseVersion']} chứa {release['staging']['fileCount']} tệp; "
        f"gói ZIP có dung lượng {format_megabytes(release['package']['sizeBytes'])}."
    )
    add_bullet(release["package"]["sha256"], "SHA-256: ")
    add_bullet(
        f"{len(evidence['routes'])} route; {quiz_total} câu hỏi; {len(GIF_ROWS)} GIF.",
        "Inventory ràng buộc candidate: ",
    )
    add_bullet(
        f"{evidence['equationOccurrenceCount']} lần xuất hiện công thức trong content manifest; "
        f"{evidence['equationCount']} hàng mapping ngữ nghĩa; "
        f"{len(evidence['simulationSpecs'])} Sim2 và "
        f"{len(evidence['sim3Reviews'])} Sim3 pilot.",
        "Registry kỹ thuật có hash evidence: ",
    )

    add_h2(f"5.2. Snapshot trạng thái {gate_summary['total']} cổng")
    summary_rows = [
        ("Pass", gate_summary["pass"]),
        ("Fail", gate_summary["fail"]),
        ("Blocked", gate_summary["blocked"]),
        ("Not run", gate_summary["notRun"]),
        ("Tổng", gate_summary["total"]),
    ]
    add_caption(doc, "Bảng", "Table", "Tổng hợp trạng thái cổng QA trong snapshot.")
    add_data_table(doc, ["Trạng thái", "Số lượng"], summary_rows, [Cm(8.0), Cm(4.0)])
    add_block_diagram(
        doc,
        [
            f"{gate_summary['total']} cổng",
            f"{gate_summary['pass']} pass",
            f"{gate_summary['fail']} fail + {gate_summary['blocked']} blocked + "
            f"{gate_summary['notRun']} not run",
            f"Decision: {acceptance['releaseDecision']['decision']}",
            f"Report: {profile['key']}",
        ],
        "Luồng quyết định từ snapshot QA và kiểm tra ràng buộc candidate.",
    )

    gate_rows = [
        (
            gate["gateId"],
            gate["status"],
            gate["owner"],
            Path(gate["artifact"]).name,
        )
        for gate in acceptance["gates"]
    ]
    add_caption(
        doc,
        "Bảng",
        "Table",
        f"Chi tiết {gate_summary['total']} cổng và bằng chứng quan sát.",
    )
    add_data_table(
        doc,
        ["Gate ID", "Trạng thái", "Chủ sở hữu", "Artifact"],
        gate_rows,
        [Cm(4.2), Cm(2.0), Cm(4.5), Cm(5.7)],
        font_size=7.4,
    )

    # Chapter 6
    add_h1("Chương 6: Phản biện khoa học và hướng hoàn thiện", new_page=True)
    add_h2("Phân tích kết quả")
    add_body(
        f"Hiện vật cho thấy độ phủ nội dung và tính truy vết kỹ thuật đã hình thành: "
        f"{len(evidence['routes'])} tuyến nội dung, {evidence['equationOccurrenceCount']} lần xuất hiện công thức, "
        f"{quiz_total} câu hỏi, {len(evidence['simulationSpecs'])} mô phỏng Sim2 và "
        f"{gate_summary['pass']} cổng pass trong snapshot. Sổ kiểm tra {acceptance['generatedAt']} "
        f"ghi {gate_summary['total']} cổng: {gate_summary['pass']} pass, {gate_summary['fail']} fail, "
        f"{gate_summary['blocked']} blocked và {gate_summary['notRun']} not-run; trạng thái tổng thể "
        f"{acceptance['overallStatus']}, quyết định {acceptance['releaseDecision']['decision']}."
    )
    add_body(
        "Có cổng bắt buộc fail thì candidate bị từ chối; blocked là điều kiện chưa hoàn tất, "
        "not-run là chưa chạy, không đồng nhất với fail hoặc đều là review độc lập. Không có fail "
        "nhưng còn blocked/not-run thì chưa đủ cổng; chỉ khi mọi cổng bắt buộc pass mới chuyển "
        "sang quyết định theo thẩm quyền. Kết quả chỉ phản ánh thời điểm và phạm vi bộ bằng chứng. "
        + (
            "Ràng buộc candidate–snapshot hiện current; đây không phải lần QA hoặc nghiệm thu mới."
            if binding["current"]
            else "Binding mismatch: không quy trạng thái snapshot cũ cho candidate mới; cần bằng chứng đúng gói."
        )
    )
    add_h2("Đánh giá khoa học theo chuẩn đầu ra")
    outcome_assessment_rows = [
        (
            "lo-course-foundation",
            f"{len(evidence['routes'])} tuyến; mục lục, tìm kiếm và PDF cục bộ",
            "Có dấu vết kỹ thuật; chuẩn đầu ra chưa được phê duyệt",
        ),
        (
            "lo-ch1-statics",
            f"{evidence['chapterCounts'][1]} tuyến; {evidence['quizCounts'][1]} câu; ca ch1-6-3",
            "Có một ca kiểm chứng đại diện; cần SME xác nhận mô hình và tiêu chí",
        ),
        (
            "lo-ch2-kinematics",
            f"{evidence['chapterCounts'][2]} tuyến; {evidence['quizCounts'][2]} câu; ca ch2-4-4",
            "Có một ca kiểm chứng đại diện; cần SME xác nhận hệ quy chiếu và dấu",
        ),
        (
            "lo-ch3-dynamics",
            f"{evidence['chapterCounts'][3]} tuyến; {evidence['quizCounts'][3]} câu; ca ch3-6-2",
            "Có một ca kiểm chứng đại diện; cần SME xác nhận giả thiết va chạm",
        ),
    ]
    add_caption(
        doc,
        "Bảng",
        "Table",
        "Đánh giá mức độ hỗ trợ chuẩn đầu ra bằng bằng chứng hiện có.",
    )
    add_data_table(
        doc,
        ["Chuẩn đầu ra", "Bằng chứng hỗ trợ", "Kết luận thận trọng"],
        outcome_assessment_rows,
        [Cm(3.4), Cm(6.2), Cm(6.8)],
        font_size=8.5,
    )
    add_body(
        "Kết quả trên chỉ chứng minh sự hiện diện và khả năng truy vết của học liệu. Báo cáo chưa có "
        "dữ liệu trước–sau, nhóm đối chứng hoặc phân tích thống kê để suy luận hiệu quả học tập."
    )
    add_h2("6.1. Kết quả đã xác minh")
    add_bullet(
        f"Snapshot acceptance có {gate_summary['pass']} cổng pass; "
        f"trạng thái binding={profile['key']}.",
        "Bằng chứng: ",
    )
    add_bullet(
        (
            "Simulation currentness và Sim3 pilot đều pass trong snapshot."
            if simulation_gate_status == "pass" and sim3_gate_status == "pass"
            else f"Simulation currentness={simulation_gate_status}; "
            f"Sim3 pilot={sim3_gate_status}; không tuyên bố đã đạt."
        ),
        "Mô phỏng: ",
    )
    add_bullet(
        (
            "Adapter LMS pass kiểm tra cục bộ trong snapshot."
            if lms_gate_status == "pass"
            else f"Adapter LMS={lms_gate_status}; không tuyên bố đã đạt."
        ),
        "Liên thông: ",
    )

    unresolved = [
        gate for gate in acceptance["gates"]
        if gate["status"] in {"fail", "blocked", "not-run", "notRun"}
    ]
    unresolved_count = len(unresolved) + (0 if binding["current"] else 1)
    add_h2(f"6.2. {unresolved_count} điều kiện hoặc sai lệch còn mở")
    if not binding["current"]:
        add_bullet(
            "Acceptance snapshot không ràng buộc candidate hiện hành; "
            + "; ".join(binding_issues),
            "candidate-evidence-binding: ",
        )
    for gate in unresolved:
        add_bullet(
            f"{gate['status']}; owner={gate['owner']}; artifact={gate['artifact']}.",
            f"{gate['gateId']}: ",
        )

    add_h2("6.3. Đe dọa đối với độ giá trị")
    add_bullet(
        "Không có quyết định independent SME trong data/academic_signoffs.json.",
        "Học thuật: ",
    )
    add_bullet(
        "Learning outcomes và legal register còn provisional.",
        "Quản trị: ",
    )
    add_bullet(
        "Không có nghiên cứu đối chứng hoặc dữ liệu trước–sau để kết luận hiệu quả học tập.",
        "Hiệu quả sư phạm: ",
    )
    add_bullet(
        "Không có ma trận CDIO/ABET được cơ sở đào tạo phê duyệt.",
        "Kiểm định: ",
    )
    add_bullet(
        "Không có target LMS hoặc bằng chứng import.",
        "Liên thông thực tế: ",
    )

    add_h2("6.4. Khuyến nghị và lộ trình ưu tiên")
    add_body(
        "Thứ tự xử lý phải đóng bằng chứng trước khi mở rộng tính năng:"
    )
    add_bullet(
        "Sửa nguyên nhân các cổng fail tại nguồn có thẩm quyền; tái tạo nội dung, tạo đúng gói "
        "ứng viên và bằng chứng gắn phiên bản/hash; xử lý chênh lệch binding trước kết luận.",
        "Ưu tiên 1 — Khắc phục và tạo bằng chứng: ",
    )
    add_bullet(
        "Chạy ma trận phù hợp trên cùng gói, cập nhật acceptance qua công cụ sở hữu và tái sinh "
        "thuyết minh; giữ snapshot cũ là lịch sử, không sửa tay trạng thái bằng chứng.",
        "Ưu tiên 2 — Đồng bộ hồ sơ: ",
    )
    add_bullet(
        "Hoàn tất review học thuật/tiếp cận độc lập, smoke độc lập và Word round-trip theo "
        "điều kiện từng gate. Pass kỹ thuật không tự tạo thẩm quyền; đơn vị có thẩm quyền "
        "quyết định sử dụng, công bố hoặc nghiệm thu.",
        "Ưu tiên 3 — Review và phê duyệt: ",
    )
    add_bullet(
        "Thử import trên LMS được chỉ định nếu cần tuyên bố liên thông thực tế.",
        "Khi có yêu cầu — LMS: ",
    )
    add_bullet(
        "Thiết kế nghiên cứu hiệu quả học tập trước mọi tuyên bố sư phạm.",
        "Khi cần tuyên bố hiệu quả — Đánh giá giáo dục: ",
    )
    add_bullet(
        "Không mở rộng thêm Sim3 nếu chưa chứng minh giá trị 3D vượt 2D và kiểm soát tải nhận thức.",
        "Trước mở rộng — Mô phỏng: ",
    )

    add_h2("6.5. Kết luận")
    add_body(profile["conclusion"])

    add_h1("PHỤ LỤC A: ĐĂNG KÝ BẰNG CHỨNG", new_page=True)
    add_body(
        "Phụ lục ràng buộc từng hình được nhúng với đường dẫn, hash SHA-256 và nguồn có thẩm quyền. "
        "Mã EV-IMG được dùng nhất quán trong chú thích hình để kiểm tra ngược hiện vật."
    )
    provenance_rows = []
    for index, (relative_path, record) in enumerate(evidence["imageProvenance"].items(), 1):
        provenance_rows.append(
            (
                f"EV-IMG-{index:02d}",
                relative_path,
                record["sha256"],
                record["authority"],
            )
        )
    add_caption(doc, "Bảng", "Table", "Đăng ký bằng chứng hình ảnh nhúng trong báo cáo.")
    add_data_table(
        doc,
        ["Evidence ID", "Đường dẫn", "SHA-256", "Thẩm quyền"],
        provenance_rows,
        [Cm(2.2), Cm(6.0), Cm(4.3), Cm(3.9)],
        font_size=7.2,
    )

    # References and status registers
    add_h1("Tài liệu tham khảo và nguồn bằng chứng", new_page=True)
    add_h2("Tài liệu tham khảo")
    add_body(
        "Danh mục dưới đây ưu tiên nguồn chuẩn, registry và hồ sơ có thể kiểm tra lại. "
        "Các tài liệu ở trạng thái provisional được dùng để mô tả phạm vi, không được dùng "
        "như quyết định phê duyệt học thuật hoặc pháp lý."
    )
    source_rows = [
        ("Trạng thái nghiệm thu", "data/acceptance-report.json", acceptance["overallStatus"]),
        ("Candidate", release_candidate["summaryPath"], release_candidate["status"]),
        (
            "Ràng buộc candidate–acceptance",
            "data/evidence-registry.json",
            profile["key"],
        ),
        ("Khả năng tiếp cận", "data/accessibility-baseline.json", accessibility["manualReview"]["status"]),
        ("LMS", "data/lms-targets.json", lms_targets["status"]),
        ("Học thuật", "docs/academic-certification.md", "provisional"),
        ("Khung khái niệm và đặc tả mô phỏng", "docs/simulation-4d.md; data/simulation-specifications.json", "Nguồn khái niệm/đặc tả; kết quả gate ở snapshot QA, không phải nghiệm thu 4D"),
        ("Ma trận QA", "docs/qa-gate-matrix.md", "canonical definitions"),
        ("Chuẩn đầu ra", "data/learning-outcomes.json", evidence["learningOutcomes"]["status"]),
    ]
    for record in evidence["legal"]["records"]:
        source_rows.append(
            (
                record["title"],
                record["officialSource"],
                record["reviewStatus"],
            )
        )
    add_caption(doc, "Bảng", "Table", "Nguồn bằng chứng và trạng thái thẩm quyền.")
    add_data_table(
        doc,
        ["Chủ đề", "Nguồn", "Trạng thái"],
        source_rows,
        [Cm(4.0), Cm(8.5), Cm(3.9)],
        font_size=8.0,
    )

    # Signature slots are neutral until an authoritative institution supplies metadata.
    signature_table = doc.add_table(rows=1, cols=2)
    signature_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    left = signature_table.cell(0, 0)
    right = signature_table.cell(0, 1)
    for cell in (left, right):
        cell.width = Cm(8.0)
        set_cell_margins(cell, top=120, bottom=120, left=100, right=100)
    left_paragraph = left.paragraphs[0]
    left_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    left_run = left_paragraph.add_run(
        "NHÓM BIÊN SOẠN VÀ PHÁT TRIỂN\nKỸ THUẬT HỌC LIỆU SỐ\n\n\n\n"
        "(Ký và ghi rõ họ tên)"
    )
    set_run_font(left_run, size=10, color=COLOR_NAVY, bold=True)
    right_paragraph = right.paragraphs[0]
    right_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    right_run = right_paragraph.add_run(
        "ĐẠI DIỆN ĐƠN VỊ THẨM ĐỊNH ĐỘC LẬP\n\n\n\n\n"
        "(Chỉ ký sau khi đủ bằng chứng bắt buộc)"
    )
    set_run_font(right_run, size=10, color=COLOR_RED, bold=True)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    doc.save(output_path)
    normalize_docx_package(output_path)
    print(
        f"Report generated: {output_path} | snapshot={acceptance['overallStatus']} | "
        f"binding={profile['key']} | gates={gate_summary['pass']}/{gate_summary['total']}"
    )
    return output_path


def main():
    parser = argparse.ArgumentParser(
        description="Generate the evidence-calibrated scientific report DOCX."
    )
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    arguments = parser.parse_args()
    build_report(arguments.output)


if __name__ == "__main__":
    main()
