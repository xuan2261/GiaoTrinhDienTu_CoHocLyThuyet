from __future__ import annotations

import io
import os
import tempfile
from dataclasses import dataclass
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent
PROJECT_ROOT = ROOT.parent

SCENES = {
    ("ch1", "hinh-1-06"): (
        "Trượt lực trên vật rắn",
        "Giữ vật rắn, A và B cố định. Minh họa định lý trượt lực bằng cách dời biểu diễn lực F từ A đến B dọc đúng một đường tác dụng, có thể dựng tuần tự cặp lực cân bằng tại B; F trước và sau luôn cùng phương, cùng chiều, cùng độ lớn và cùng đường tác dụng. Không làm vật rắn chuyển động.",
    ),
    ("ch1", "hinh-1-28b"): (
        "Ma sát lăn với các con lăn",
        "Tấm ván tịnh tiến ngang; các con lăn vừa tịnh tiến vừa quay dưới ván, duy trì tiếp xúc không trượt với ván và nền. Bàn tay và nền đứng yên; không thêm số liệu vận tốc hoặc làm con lăn xuyên/hở khỏi mặt tiếp xúc.",
    ),
    ("ch1", "hinh-1-34"): (
        "Cân bằng trên mặt phẳng nghiêng điều chỉnh",
        "Thanh quay quanh bản lề, chốt đi theo rãnh và vật m luôn nằm trên thanh. W luôn thẳng đứng, N vuông góc mặt phẳng, F tiếp tuyến mặt phẳng; không suy đoán góc giới hạn hoặc làm mất tiếp xúc.",
    ),
    ("ch1", "hinh-1-35"): (
        "Hai vật và ròng rọc với dây không dãn",
        "Vật 2 dịch sang phải thì vật 1 dịch sang trái cùng độ lớn do chiều dài dây không đổi; ròng rọc quay phù hợp với chuyển động dây. Hai vật luôn tiếp xúc; các lực ma sát tương tác ngược chiều nhau.",
    ),
    ("ch2", "hinh-2-07"): (
        "Tọa độ và độ dời trên quỹ đạo thẳng",
        "Điểm P chuyển đến P′ trên trục s; OP biểu diễn s và PP′ biểu diễn Δs. O, trục và chiều +s cố định; chuyển động luôn thẳng hàng, và easing không được diễn giải thành vận tốc đều.",
    ),
    ("ch2", "hinh-2-22"): (
        "Chuyển động song phẳng của vật rắn",
        "Điểm A tịnh tiến theo quỹ đạo kín nhỏ trong khi vật quay góc φ quanh A. Hệ OXY cố định; hệ Aξη và các nhãn/điểm gắn vật đi cùng vật; hình dạng và mọi khoảng cách trên vật không đổi.",
    ),
    ("ch2", "hinh-2-26"): (
        "Tâm gia tốc tức thời",
        "Giữ hình học vật rắn cố định như một ảnh chụp tức thời; dựng tuần tự A, véc tơ a_A, ray AX lệch a_A một góc α với tan α = ε/ω², điểm J trên AX và hai véc tơ cân bằng tại J. Tại tâm gia tốc tức thời có a_J = 0 nên a_JA = −a_A: chúng cùng giá, ngược chiều và nói chung không thẳng hàng với AJ. Không ép a_JA dọc AJ và không phát minh độ lớn.",
    ),
    ("ch2", "hinh-2-34"): (
        "Cơ cấu tay quay – thanh truyền – con trượt nghiêng",
        "O cố định; giữ đúng OA:AB = 40:80 = 1:2, ray DE nghiêng α = 45° và cấu hình đầu β = 90°. OA và AB không đổi chiều dài; B luôn nằm trên ray DE. Mỗi frame giải đúng giao điểm đường tròn tâm A bán kính AB với ray, giữ liên tục đúng nhánh lắp ráp và chỉ dùng miền quay khả thi, không để thanh co giãn.",
    ),
    ("ch3", "hinh-3-06"): (
        "Va chạm mềm đầu đạn – xe cát",
        "Đầu đạn bay vào xe, có pha nén rất ngắn, sau đó gắn trong xe và cả hệ chuyển động cùng một vận tốc. Không vẽ bật lại; dùng fade để reset vòng lặp và bảo toàn động lượng ngang trong xung va chạm.",
    ),
    ("ch3", "hinh-3-17"): (
        "Vật trượt dưới lực kéo nghiêng",
        "Khối tịnh tiến sang phải dưới F; lực ma sát luôn ngược chiều chuyển động, P thẳng đứng xuống và N thẳng đứng lên. Các nhãn gắn khối đi cùng khối; không tự gán gia tốc, hệ số ma sát hoặc độ lớn số.",
    ),
    ("ch3", "hinh-3-20"): (
        "Hệ hai vật với ròng rọc động",
        "Ròng rọc động và m₁ dịch một đoạn s₁ thì m₂ dịch ngược chiều 2s₁, luôn thỏa 2s₁ + s₂ = hằng số. Dây luôn căng, cả hai ròng rọc quay phù hợp với chuyển động dây và không đổi bán kính.",
    ),
    ("ch3", "hinh-3-21"): (
        "Vật trượt trên nêm chuyển động",
        "Nêm tịnh tiến sang phải so với nền; vật m giữ tiếp xúc và trượt xuống dọc mặt nêm. Không để hở hoặc xuyên mặt; mũi tên a₀ và nhãn gắn nêm đi cùng nêm, còn nền đứng yên.",
    ),
}

PROMPT = """Bạn đang làm việc trên ChatGPT Web có khả năng phân tích ảnh và chạy Python. Tôi đã đính kèm tệp `{basename}.png`.

MỤC TIÊU
Tạo GIF minh họa Cơ học lý thuyết chất lượng cao cho chủ đề: {title}.

BẮT BUỘC VẬT LÝ
{invariant}

PHƯƠNG PHÁP DỰNG
- Phân tích ảnh đính kèm và ý nghĩa của hình trong chương trước khi dựng; dùng chúng làm tài liệu tham chiếu cho bố cục, ký hiệu và cơ học.
- Dựng lại toàn bộ bằng hình học vector học thuật với Python (Pillow/NumPy hoặc thư viện vector phù hợp): nền sáng, nét navy, lực đỏ, chuyển động xanh, tham chiếu xanh lam, đại lượng kích hoạt vàng. Không đặt ảnh raster nguồn làm nền và không dùng pixel của ảnh nguồn trong bất kỳ frame nào.
- Chỉ cho các bộ phận được mô tả trong mục BẮT BUỘC VẬT LÝ chuyển động; mọi nền, gối tựa, trục hoặc vật được chỉ định cố định phải đứng yên. Không ép mọi vật thể/cơ cấu đều chuyển động.
- Nhãn, điểm và véc tơ gắn với vật phải đi cùng vật; nhãn hệ quy chiếu hoặc công thức không gắn vật giữ cố định. Mọi chữ luôn sắc nét, dễ đọc và không bị che; không tự phát minh lực, vận tốc, kích thước hay số liệu.

HỢP ĐỒNG ARTIFACT
- Tạo file thật `{basename}.gif`, `{basename}.py` chứa đúng mã nguồn bộ sinh đã thực thi, và `{basename}-contact-sheet.png`.
- GIF có đúng 60 frame lưu trữ, đúng 60 ms/frame, tổng đúng 3.600 ms (3,600 ms), `loop=0`; vòng lặp nối mượt.
- Mọi frame cùng kích thước, giữ đúng tỷ lệ, cạnh dài tối đa 1.200 px; file GIF phải dưới 12 MiB.
- Contact sheet gồm đúng bốn trạng thái đại diện tại frame 0, 15, 30 và 45.
- Không watermark, không chữ ký pixel ẩn, không frame trắng/hỏng và không để tối ưu hóa làm gộp frame.

KIỂM TRA TRƯỚC KHI TRẢ
- Mở lại chính file GIF bằng Pillow và xác nhận `is_animated=True`, `n_frames=60`, `loop=0`, mỗi frame `duration=60`, tổng duration 3.600 ms, kích thước đồng nhất, cạnh dài tối đa 1.200 px và dung lượng dưới 12 MiB.
- Xác nhận ít nhất 55/59 cặp frame kề nhau có thay đổi hình ảnh có ý nghĩa, đồng thời bốn trạng thái contact sheet thể hiện đúng cơ học.
- Trả link tải ba file thật và bảng kiểm tra. Không tuyên bố hoàn thành nếu chưa tạo được file tải xuống.
"""


@dataclass(frozen=True)
class PreparedPair:
    basename: str
    png_target: Path
    txt_target: Path
    png_bytes: bytes
    txt_bytes: bytes
    image_size: tuple[int, int]


def _render_canonical_png(
    source: Path, expected_relative: Path
) -> tuple[bytes, tuple[int, int]]:
    images_root = (PROJECT_ROOT / "images").resolve()
    if not source.is_file():
        raise FileNotFoundError(source)
    try:
        actual_relative = source.resolve(strict=True).relative_to(images_root)
    except ValueError as error:
        raise ValueError(f"Canonical source escapes images/: {source}") from error
    if actual_relative != expected_relative:
        raise ValueError(
            f"Unexpected canonical PNG identity: {actual_relative}; expected {expected_relative}"
        )

    source_bytes = source.read_bytes()
    with Image.open(io.BytesIO(source_bytes)) as image:
        if image.format != "PNG" or getattr(image, "n_frames", 1) != 1:
            raise ValueError(f"Expected a static PNG source: {source}")
        image.verify()

    with Image.open(io.BytesIO(source_bytes)) as image:
        if image.format != "PNG" or getattr(image, "n_frames", 1) != 1:
            raise ValueError(f"Expected a static PNG source: {source}")
        image.load()
        image_size = image.size
        rgba = image.convert("RGBA")

    rendered = io.BytesIO()
    rgba.save(rendered, format="PNG")
    return rendered.getvalue(), image_size


def _workspace_relative(target: Path) -> Path:
    if target.is_symlink():
        raise ValueError(f"Refusing symlink target: {target}")
    try:
        relative_parent = target.parent.resolve(strict=False).relative_to(ROOT)
    except ValueError as error:
        raise ValueError(f"Target escapes gif-conversion-workspace/: {target}") from error
    return relative_parent / target.name


def _prepare_pairs() -> list[PreparedPair]:
    if len(SCENES) != 12:
        raise ValueError(f"Expected exactly 12 expanded scenes, found {len(SCENES)}")

    rendered_sources: dict[tuple[str, str], tuple[bytes, tuple[int, int]]] = {}
    for chapter, basename in SCENES:
        expected_relative = Path(chapter) / f"{basename}.png"
        source = PROJECT_ROOT / "images" / expected_relative
        rendered_sources[(chapter, basename)] = _render_canonical_png(
            source, expected_relative
        )

    pairs: list[PreparedPair] = []
    seen_targets: set[Path] = set()
    for (chapter, basename), (title, invariant) in SCENES.items():
        target_dir = ROOT / chapter
        png_target = target_dir / f"{basename}.png"
        txt_target = target_dir / f"{basename}.txt"
        for target in (png_target, txt_target):
            relative = _workspace_relative(target)
            if relative in seen_targets:
                raise ValueError(f"Duplicate expanded target: {relative}")
            seen_targets.add(relative)

        png_bytes, image_size = rendered_sources[(chapter, basename)]
        prompt = PROMPT.format(basename=basename, title=title, invariant=invariant)
        pairs.append(
            PreparedPair(
                basename=basename,
                png_target=png_target,
                txt_target=txt_target,
                png_bytes=png_bytes,
                txt_bytes=prompt.encode("utf-8"),
                image_size=image_size,
            )
        )
    return pairs


def _target_is_complete(pair: PreparedPair) -> bool:
    png_present = os.path.lexists(pair.png_target)
    txt_present = os.path.lexists(pair.txt_target)
    if png_present != txt_present:
        raise FileExistsError(f"Refusing incomplete target pair: {pair.basename}")
    if not png_present:
        return False

    for target in (pair.png_target, pair.txt_target):
        if target.is_symlink() or not target.is_file():
            raise FileExistsError(f"Refusing non-regular target: {target}")
    if pair.png_target.read_bytes() != pair.png_bytes:
        raise FileExistsError(f"Refusing content-different target: {pair.png_target}")
    expected_prompt = pair.txt_bytes.decode("utf-8")
    if pair.txt_target.read_text(encoding="utf-8") != expected_prompt:
        raise FileExistsError(f"Refusing content-different target: {pair.txt_target}")
    return True


def _audit_targets(pairs: list[PreparedPair]) -> list[bool]:
    return [_target_is_complete(pair) for pair in pairs]


def _staged_path(stage_root: Path, target: Path) -> Path:
    return stage_root / _workspace_relative(target)


def _validate_staged_pair(pair: PreparedPair, stage_root: Path) -> None:
    png_stage = _staged_path(stage_root, pair.png_target)
    txt_stage = _staged_path(stage_root, pair.txt_target)
    if png_stage.read_bytes() != pair.png_bytes:
        raise RuntimeError(f"Staged PNG bytes differ: {pair.basename}")
    if txt_stage.read_bytes() != pair.txt_bytes:
        raise RuntimeError(f"Staged prompt bytes differ: {pair.basename}")
    txt_stage.read_text(encoding="utf-8")

    with Image.open(png_stage) as image:
        if image.format != "PNG" or getattr(image, "n_frames", 1) != 1:
            raise RuntimeError(f"Staged image is not a static PNG: {pair.basename}")
        image.verify()
    with Image.open(png_stage) as image:
        if image.format != "PNG" or image.mode != "RGBA":
            raise RuntimeError(f"Staged image has an unexpected identity: {pair.basename}")
        image.load()
        if image.size != pair.image_size:
            raise RuntimeError(f"Staged image dimensions differ: {pair.basename}")


def _stage_pairs(pairs: list[PreparedPair], stage_root: Path) -> None:
    for pair in pairs:
        png_stage = _staged_path(stage_root, pair.png_target)
        txt_stage = _staged_path(stage_root, pair.txt_target)
        png_stage.parent.mkdir(parents=True, exist_ok=True)
        png_stage.write_bytes(pair.png_bytes)
        txt_stage.write_bytes(pair.txt_bytes)

    for pair in pairs:
        _validate_staged_pair(pair, stage_root)

    expected_files = {
        _workspace_relative(target)
        for pair in pairs
        for target in (pair.png_target, pair.txt_target)
    }
    actual_files = {
        path.relative_to(stage_root)
        for path in stage_root.rglob("*")
        if path.is_file()
    }
    if actual_files != expected_files:
        raise RuntimeError("Staging manifest differs from the complete 12-pair set")


def _commit_staged_pairs(
    pairs: list[PreparedPair], existing: list[bool], stage_root: Path
) -> int:
    missing_pairs = [
        pair for pair, is_existing in zip(pairs, existing) if not is_existing
    ]
    created_directories: list[Path] = []
    committed: list[tuple[Path, Path]] = []
    try:
        for target_dir in sorted(
            {pair.png_target.parent for pair in missing_pairs}, key=str
        ):
            if target_dir.exists():
                if not target_dir.is_dir():
                    raise NotADirectoryError(target_dir)
                continue
            target_dir.mkdir()
            created_directories.append(target_dir)

        for pair in missing_pairs:
            for target in (pair.png_target, pair.txt_target):
                staged = _staged_path(stage_root, target)
                committed.append((target, staged))
                os.link(staged, target)
    except BaseException as error:
        rollback_errors: list[str] = []
        for target, staged in reversed(committed):
            try:
                if not os.path.lexists(target):
                    continue
                if os.path.samefile(target, staged):
                    target.unlink()
            except Exception as rollback_error:
                rollback_errors.append(f"{target}: {rollback_error}")
        for target_dir in reversed(created_directories):
            try:
                target_dir.rmdir()
            except OSError as rollback_error:
                rollback_errors.append(f"{target_dir}: {rollback_error}")
        if rollback_errors:
            raise RuntimeError(
                "Commit failed and rollback was incomplete: " + "; ".join(rollback_errors)
            ) from error
        raise
    return len(missing_pairs)


def main() -> None:
    pairs = _prepare_pairs()
    existing = _audit_targets(pairs)

    with tempfile.TemporaryDirectory(
        prefix=".prepare-expanded-assets-", dir=ROOT
    ) as stage_name:
        stage_root = Path(stage_name)
        _stage_pairs(pairs, stage_root)
        if _audit_targets(pairs) != existing:
            raise RuntimeError("Target state changed while expanded assets were staged")
        created_count = _commit_staged_pairs(pairs, existing, stage_root)

    existing_count = len(pairs) - created_count
    if created_count == 0:
        print(
            f"PASS verified {existing_count * 2} existing files for "
            f"{existing_count} expanded GIF scenes; no files overwritten"
        )
    else:
        print(
            f"PASS created {created_count * 2} files and verified "
            f"{existing_count * 2} existing files for {len(pairs)} expanded GIF scenes"
        )


if __name__ == "__main__":
    main()
