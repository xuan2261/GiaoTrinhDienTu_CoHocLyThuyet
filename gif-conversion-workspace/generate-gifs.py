from __future__ import annotations

import math
import os
import shutil
import tempfile
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Callable, Iterable

from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageStat

FRAME_COUNT = 60
FRAME_DURATION_MS = 60
MAX_EDGE = 1200
MAX_BYTES = 12 * 1024 * 1024
SUPERSAMPLE = 2
ROOT = Path(__file__).resolve().parent
OUTPUT_ROOT = ROOT / "output"

BG = (248, 250, 252, 255)
WHITE = (255, 255, 255, 255)
NAVY = (9, 35, 65, 255)
MUTED = (91, 111, 133, 255)
GRID = (226, 233, 240, 255)
RED = (211, 63, 63, 255)
GREEN = (36, 143, 93, 255)
BLUE = (43, 125, 184, 255)
GOLD = (205, 148, 43, 255)
ORANGE = (228, 120, 48, 255)
PURPLE = (139, 82, 173, 255)
CYAN = (224, 242, 248, 255)
LIGHT_BLUE = (222, 237, 248, 255)
LIGHT_GOLD = (250, 240, 211, 255)
LIGHT_RED = (250, 226, 226, 255)

Color = tuple[int, int, int, int]
Point = tuple[float, float]
Renderer = Callable[[int], Image.Image]


@dataclass(frozen=True)
class GifSpec:
    chapter: str
    basename: str
    size: tuple[int, int]
    renderer: Renderer


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def smooth(value: float) -> float:
    value = clamp(value)
    return value * value * (3.0 - 2.0 * value)


def mix(a: Color, b: Color, amount: float) -> Color:
    amount = clamp(amount)
    return tuple(round(a[i] + (b[i] - a[i]) * amount) for i in range(4))  # type: ignore[return-value]


def fade_window(t: float, fade_in: float, hold_end: float, fade_out_end: float) -> float:
    if t < fade_in:
        return smooth(t / fade_in)
    if t <= hold_end:
        return 1.0
    return 1.0 - smooth((t - hold_end) / max(0.001, fade_out_end - hold_end))


@lru_cache(maxsize=32)
def font(size: int, bold: bool = False, italic: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates: list[Path] = []
    windows_fonts = Path("C:/Windows/Fonts")
    if italic:
        candidates.extend([windows_fonts / "cambriai.ttf", windows_fonts / "segoeuii.ttf"])
    elif bold:
        candidates.extend([windows_fonts / "cambriab.ttf", windows_fonts / "segoeuib.ttf"])
    else:
        candidates.extend([windows_fonts / "cambria.ttc", windows_fonts / "segoeui.ttf"])
    for candidate in candidates:
        if candidate.is_file():
            return ImageFont.truetype(str(candidate), size * SUPERSAMPLE)
    return ImageFont.load_default()

MATH_SYMBOLS = frozenset("=+-/()[],:;<>⇒→↑↓⟂∥≤≥−∫√∞≈≠∑∏·")


@lru_cache(maxsize=32)
def formula_font(size: int, symbol: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    windows_fonts = Path("C:/Windows/Fonts")
    candidates = (
        [
            (windows_fonts / "cambria.ttc", 1),
            (windows_fonts / "seguisym.ttf", 0),
            (windows_fonts / "cambria.ttc", 0),
        ]
        if symbol
        else [
            (windows_fonts / "cambriai.ttf", 0),
            (windows_fonts / "segoeuii.ttf", 0),
            (windows_fonts / "cambria.ttc", 0),
        ]
    )
    for candidate, index in candidates:
        if candidate.is_file():
            return ImageFont.truetype(str(candidate), size * SUPERSAMPLE, index=index)
    return ImageFont.load_default()


def formula_atoms(value: str) -> list[dict[str, str]]:
    atoms: list[dict[str, str]] = []
    index = 0
    while index < len(value):
        marker = value[index]
        if marker not in "_^":
            atoms.append({"base": marker, "sub": "", "sup": ""})
            index += 1
            continue
        if not atoms:
            raise ValueError(f"Formula script {marker!r} has no base: {value!r}")
        script_key = "sub" if marker == "_" else "sup"
        index += 1
        if index >= len(value):
            raise ValueError(f"Formula script {marker!r} has no value: {value!r}")
        if value[index] == "{":
            close = value.find("}", index + 1)
            if close < 0:
                raise ValueError(f"Unclosed formula script group: {value!r}")
            script = value[index + 1 : close]
            index = close + 1
        else:
            script = value[index]
            index += 1
        if atoms[-1][script_key]:
            raise ValueError(f"Duplicate formula {script_key}: {value!r}")
        atoms[-1][script_key] = script

    compact: list[dict[str, str]] = []
    for atom in atoms:
        is_symbol = atom["base"] in MATH_SYMBOLS or atom["base"].isdigit()
        if (
            compact
            and not atom["sub"]
            and not atom["sup"]
            and not compact[-1]["sub"]
            and not compact[-1]["sup"]
            and (compact[-1]["base"][-1] in MATH_SYMBOLS or compact[-1]["base"][-1].isdigit()) == is_symbol
        ):
            compact[-1]["base"] += atom["base"]
        else:
            compact.append(atom)
    return compact


class Painter:
    def __init__(self, width: int, height: int, grid: bool = False, background: Color = BG):
        self.width = width
        self.height = height
        self.image = Image.new("RGBA", (width * SUPERSAMPLE, height * SUPERSAMPLE), background)
        self.draw = ImageDraw.Draw(self.image)
        if grid:
            self.grid()

    def s(self, value: float) -> int:
        return round(value * SUPERSAMPLE)

    def point(self, point: Point) -> tuple[int, int]:
        return self.s(point[0]), self.s(point[1])

    def grid(self, step: int = 50) -> None:
        for x in range(0, self.width + 1, step):
            self.line((x, 0), (x, self.height), GRID, 1)
        for y in range(0, self.height + 1, step):
            self.line((0, y), (self.width, y), GRID, 1)

    def line(self, a: Point, b: Point, color: Color = NAVY, width: int = 3) -> None:
        self.draw.line((*self.point(a), *self.point(b)), fill=color, width=self.s(width))

    def polyline(self, points: Iterable[Point], color: Color = NAVY, width: int = 3) -> None:
        converted = [self.point(point) for point in points]
        if len(converted) > 1:
            self.draw.line(converted, fill=color, width=self.s(width), joint="curve")

    def polygon(self, points: Iterable[Point], fill: Color, outline: Color = NAVY, width: int = 3) -> None:
        converted = [self.point(point) for point in points]
        self.draw.polygon(converted, fill=fill)
        self.draw.line(converted + [converted[0]], fill=outline, width=self.s(width), joint="curve")

    def rectangle(self, box: tuple[float, float, float, float], fill: Color | None = WHITE, outline: Color = NAVY, width: int = 2) -> None:
        converted = tuple(self.s(value) for value in box)
        self.draw.rectangle(converted, fill=fill, outline=outline, width=self.s(width))

    def rounded(self, box: tuple[float, float, float, float], radius: int, fill: Color = WHITE, outline: Color = NAVY, width: int = 2) -> None:
        converted = tuple(self.s(value) for value in box)
        self.draw.rounded_rectangle(converted, radius=self.s(radius), fill=fill, outline=outline, width=self.s(width))

    def ellipse(self, box: tuple[float, float, float, float], fill: Color = WHITE, outline: Color = NAVY, width: int = 3) -> None:
        converted = tuple(self.s(value) for value in box)
        self.draw.ellipse(converted, fill=fill, outline=outline, width=self.s(width))

    def arc(self, box: tuple[float, float, float, float], start: float, end: float, color: Color = NAVY, width: int = 3) -> None:
        converted = tuple(self.s(value) for value in box)
        self.draw.arc(converted, start=start, end=end, fill=color, width=self.s(width))

    def text(self, position: Point, value: str, size: int = 24, color: Color = NAVY, bold: bool = False, italic: bool = False, anchor: str = "la") -> None:
        self.draw.text(self.point(position), value, font=font(size, bold, italic), fill=color, anchor=anchor)

    def formula(self, position: Point, value: str, size: int = 24, color: Color = NAVY, anchor: str = "mm") -> None:
        atoms = formula_atoms(value)
        parts: list[tuple[float, float, str, ImageFont.FreeTypeFont | ImageFont.ImageFont]] = []
        cursor = 0.0
        min_x = min_y = math.inf
        max_x = max_y = -math.inf

        def add_part(
            x: float,
            baseline: float,
            text: str,
            selected_font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
        ) -> float:
            nonlocal min_x, min_y, max_x, max_y
            parts.append((x, baseline, text, selected_font))
            box = self.draw.textbbox((x, baseline), text, font=selected_font, anchor="ls")
            min_x = min(min_x, box[0])
            min_y = min(min_y, box[1])
            max_x = max(max_x, box[2])
            max_y = max(max_y, box[3])
            return self.draw.textlength(text, font=selected_font)

        script_size = max(10, round(size * 0.65))
        for atom in atoms:
            base_text = atom["base"]
            base_is_symbol = all(character in MATH_SYMBOLS or character.isdigit() for character in base_text)
            base_width = add_part(cursor, 0, base_text, formula_font(size, base_is_symbol))
            script_x = cursor + 0.88 * base_width
            script_widths = [0.0]
            if atom["sup"]:
                script_text = atom["sup"]
                script_is_symbol = all(character in MATH_SYMBOLS or character.isdigit() for character in script_text)
                script_widths.append(
                    add_part(
                        script_x,
                        -0.43 * size * SUPERSAMPLE,
                        script_text,
                        formula_font(script_size, script_is_symbol),
                    )
                )
            if atom["sub"]:
                script_text = atom["sub"]
                script_is_symbol = all(character in MATH_SYMBOLS or character.isdigit() for character in script_text)
                script_widths.append(
                    add_part(
                        script_x,
                        0.28 * size * SUPERSAMPLE,
                        script_text,
                        formula_font(script_size, script_is_symbol),
                    )
                )
            cursor += max(base_width, 0.88 * base_width + max(script_widths))

        target_x, target_y = self.point(position)
        horizontal = anchor[0] if anchor else "m"
        vertical = anchor[1] if len(anchor) > 1 else "m"
        if horizontal == "l":
            offset_x = target_x - min_x
        elif horizontal == "r":
            offset_x = target_x - max_x
        else:
            offset_x = target_x - (min_x + max_x) / 2
        if vertical in {"t", "a"}:
            offset_y = target_y - min_y
        elif vertical == "b":
            offset_y = target_y - max_y
        else:
            offset_y = target_y - (min_y + max_y) / 2
        for x, baseline, text, selected_font in parts:
            self.draw.text(
                (x + offset_x, baseline + offset_y),
                text,
                font=selected_font,
                fill=color,
                anchor="ls",
            )

    def arrow(self, start: Point, end: Point, color: Color = RED, width: int = 5, head: int = 14, label: str | None = None, label_offset: Point = (0, -12)) -> None:
        x0, y0 = start
        x1, y1 = end
        dx, dy = x1 - x0, y1 - y0
        length = max(0.001, math.hypot(dx, dy))
        ux, uy = dx / length, dy / length
        bx, by = x1 - ux * head, y1 - uy * head
        nx, ny = -uy, ux
        self.line(start, (bx, by), color, width)
        self.draw.polygon(
            [self.point((x1, y1)), self.point((bx + nx * head * 0.48, by + ny * head * 0.48)), self.point((bx - nx * head * 0.48, by - ny * head * 0.48))],
            fill=color,
        )
        if label:
            mx, my = (x0 + x1) / 2 + label_offset[0], (y0 + y1) / 2 + label_offset[1]
            self.formula((mx, my), label, 24, color, anchor="mm")

    def dashed_line(self, start: Point, end: Point, color: Color = MUTED, width: int = 2, dash: int = 10, gap: int = 8, offset: float = 0.0) -> None:
        x0, y0 = start
        x1, y1 = end
        length = math.hypot(x1 - x0, y1 - y0)
        if length <= 0:
            return
        ux, uy = (x1 - x0) / length, (y1 - y0) / length
        cursor = -offset % (dash + gap)
        while cursor < length:
            a = max(0.0, cursor)
            b = min(length, cursor + dash)
            if b > a:
                self.line((x0 + ux * a, y0 + uy * a), (x0 + ux * b, y0 + uy * b), color, width)
            cursor += dash + gap

    def title(self, title: str, subtitle: str) -> None:
        self.text((self.width / 2, 34), title, 30, NAVY, bold=True, anchor="ma")
        self.text((self.width / 2, 72), subtitle, 17, MUTED, anchor="ma")

    def composite(self, layer: "Painter", opacity: float = 1.0) -> None:
        overlay = layer.image.copy()
        if opacity < 1.0:
            alpha = overlay.getchannel("A").point(lambda value: round(value * clamp(opacity)))
            overlay.putalpha(alpha)
        self.image = Image.alpha_composite(self.image, overlay)
        self.draw = ImageDraw.Draw(self.image)

    def finish(self) -> Image.Image:
        return self.image.resize((self.width, self.height), Image.Resampling.LANCZOS).convert("RGB")


def draw_spring(p: Painter, x0: float, x1: float, y: float, amplitude: float, coils: int = 9, color: Color = NAVY) -> None:
    lead = 28
    p.line((x0, y), (x0 + lead, y), color, 5)
    p.line((x1 - lead, y), (x1, y), color, 5)
    usable = max(20.0, x1 - x0 - 2 * lead)
    points: list[Point] = []
    samples = max(90, coils * 16)
    for index in range(samples + 1):
        u = index / samples
        x = x0 + lead + usable * u
        yy = y + amplitude * math.sin(2 * math.pi * coils * u)
        points.append((x, yy))
    p.polyline(points, NAVY, 5)


def draw_wheel(p: Painter, center: Point, radius: float, theta: float, fill: Color = LIGHT_BLUE, outline: Color = NAVY, spokes: int = 6) -> None:
    cx, cy = center
    p.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill, outline, 4)
    p.ellipse((cx - 10, cy - 10, cx + 10, cy + 10), WHITE, outline, 3)
    for index in range(spokes):
        angle = theta + 2 * math.pi * index / spokes
        p.line((cx, cy), (cx + radius * 0.78 * math.cos(angle), cy + radius * 0.78 * math.sin(angle)), outline, 3)
    marker = theta
    p.ellipse((cx + radius * 0.82 * math.cos(marker) - 6, cy + radius * 0.82 * math.sin(marker) - 6, cx + radius * 0.82 * math.cos(marker) + 6, cy + radius * 0.82 * math.sin(marker) + 6), ORANGE, WHITE, 2)


def draw_gear(p: Painter, center: Point, radius: float, teeth: int, theta: float, fill: Color) -> None:
    cx, cy = center
    points: list[Point] = []
    for index in range(teeth * 2):
        angle = theta + math.pi * index / teeth
        rr = radius + (6 if index % 2 == 0 else 0)
        points.append((cx + rr * math.cos(angle), cy + rr * math.sin(angle)))
    p.polygon(points, fill, NAVY, 3)
    p.ellipse((cx - radius * 0.76, cy - radius * 0.76, cx + radius * 0.76, cy + radius * 0.76), WHITE, NAVY, 2)
    for index in range(4):
        angle = theta + math.pi * index / 2
        p.line((cx, cy), (cx + radius * 0.65 * math.cos(angle), cy + radius * 0.65 * math.sin(angle)), NAVY, 3)
    p.ellipse((cx - 8, cy - 8, cx + 8, cy + 8), NAVY, NAVY, 1)


def draw_moving_belt(p: Painter, segments: list[tuple[Point, Point]], offset: float, color: Color = GREEN) -> None:
    for index, (start, end) in enumerate(segments):
        p.line(start, end, NAVY, 5)
        direction = 1 if index % 2 == 0 else -1
        p.dashed_line(start, end, color, 5, 14, 12, direction * offset)


def draw_arc_arrow(
    p: Painter,
    center: Point,
    radius: float,
    start_degrees: float,
    end_degrees: float,
    color: Color = PURPLE,
    width: int = 4,
) -> None:
    p.arc(
        (center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius),
        start_degrees,
        end_degrees,
        color,
        width,
    )
    direction = 1.0 if end_degrees >= start_degrees else -1.0
    previous = math.radians(end_degrees - 8.0 * direction)
    end = math.radians(end_degrees)
    p.arrow(
        point_on_ray(center, previous, radius),
        point_on_ray(center, end, radius),
        color,
        width,
        11,
    )


def belt_tangent_segments(
    first: Point,
    first_radius: float,
    second: Point,
    second_radius: float,
    crossed: bool,
) -> list[tuple[Point, Point]]:
    dx = second[0] - first[0]
    dy = second[1] - first[1]
    distance = math.hypot(dx, dy)
    require(distance > 0, "belt: coincident pulley centers")
    along = (dx / distance, dy / distance)
    ratio = (first_radius + second_radius if crossed else first_radius - second_radius) / distance
    require(abs(ratio) < 1, "belt: no real common tangent")
    perpendicular_scale = math.sqrt(1 - ratio * ratio)
    segments: list[tuple[Point, Point]] = []
    for side in (-1.0, 1.0):
        normal = (
            ratio * along[0] - side * perpendicular_scale * along[1],
            ratio * along[1] + side * perpendicular_scale * along[0],
        )
        first_contact = (
            first[0] + first_radius * normal[0],
            first[1] + first_radius * normal[1],
        )
        second_sign = -1.0 if crossed else 1.0
        second_contact = (
            second[0] + second_sign * second_radius * normal[0],
            second[1] + second_sign * second_radius * normal[1],
        )
        segments.append((first_contact, second_contact))
    return segments


def render_spring(index: int) -> Image.Image:
    t = index / FRAME_COUNT
    pulse = 0.5 - 0.5 * math.cos(2 * math.pi * t)
    p = Painter(960, 600, grid=True)
    p.title("HAI TRẠNG THÁI BIẾN DẠNG LÒ XO", "So sánh độc lập trạng thái nén và kéo; không nội suy qua cân bằng")
    wall_x = 145
    p.rectangle((wall_x, 155, wall_x + 24, 485), LIGHT_BLUE, NAVY, 3)
    for yy in range(165, 485, 25):
        p.line((wall_x - 3, yy), (wall_x + 27, yy - 18), MUTED, 2)

    force_color = mix(RED, GOLD, 0.32 * pulse)
    compressed = (245, 655, 255)
    stretched = (225, 760, 430)
    draw_spring(p, compressed[0], compressed[1], compressed[2], 38, 8, BLUE)
    draw_spring(p, stretched[0], stretched[1], stretched[2], 34, 10, RED)
    p.line((wall_x + 24, compressed[2]), (compressed[0], compressed[2]), NAVY, 5)
    p.line((wall_x + 24, stretched[2]), (stretched[0], stretched[2]), NAVY, 5)
    p.rounded((720, 225, 770, 285), 8, WHITE, NAVY, 3)
    p.rounded((825, 400, 875, 460), 8, WHITE, NAVY, 3)
    p.arrow((compressed[0] - 120, compressed[2]), (compressed[0], compressed[2]), force_color, 6, 15, "F", (0, -22))
    p.arrow((compressed[1] + 120, compressed[2]), (compressed[1], compressed[2]), force_color, 6, 15, "F′", (0, -22))
    p.arrow((stretched[0], stretched[2]), (stretched[0] - 120, stretched[2]), force_color, 6, 15, "F", (0, -22))
    p.arrow((stretched[1], stretched[2]), (stretched[1] + 120, stretched[2]), force_color, 6, 15, "F′", (0, -22))
    trace_offset = (52 * t) % 26
    for start, end in (
        ((compressed[0] - 120, compressed[2]), (compressed[0], compressed[2])),
        ((compressed[1] + 120, compressed[2]), (compressed[1], compressed[2])),
        ((stretched[0], stretched[2]), (stretched[0] - 120, stretched[2])),
        ((stretched[1], stretched[2]), (stretched[1] + 120, stretched[2])),
    ):
        p.dashed_line(start, end, WHITE, 2, 8, 5, trace_offset)
    p.text((480, 185), "NÉN", 22, BLUE, bold=True, anchor="mm")
    p.text((480, 360), "KÉO", 22, RED, bold=True, anchor="mm")
    p.text((480, 540), "Hình học giữ nguyên · véc tơ lực cân bằng được nhấn sáng", 18, MUTED, anchor="mm")
    return p.finish()


def render_friction(index: int) -> Image.Image:
    t = index / FRAME_COUNT
    stage = 0.5 - 0.5 * math.cos(2 * math.pi * t)
    p = Painter(900, 650, grid=True)
    p.title("MA SÁT LĂN VÀ ĐỘ LỆCH PHẢN LỰC", "Vật đứng yên; đường tác dụng của phản lực dịch từ N đến N′")
    ground_y = 520
    cx, radius = 450, 125
    p.line((80, ground_y), (820, ground_y), NAVY, 5)
    for x in range(90, 820, 30):
        p.line((x, ground_y), (x - 18, ground_y + 18), MUTED, 2)
    draw_wheel(p, (cx, ground_y - radius), radius, 0, LIGHT_BLUE, NAVY, 8)
    p.ellipse((cx - 7, ground_y - 7, cx + 7, ground_y + 7), GREEN, GREEN, 1)
    p.text((cx + 18, ground_y - 12), "I", 21, GREEN, bold=True)
    p.arrow((cx, ground_y - radius - 10), (cx, ground_y - radius + 112), RED, 5, 14, "G", (40, 30))
    p.arrow((cx, ground_y - 10), (cx - 105, ground_y - 10), GREEN, 5, 14, "F_{ms}", (0, -30))
    q_color = mix(GOLD, RED, 0.28 * stage)
    p.arrow((cx, ground_y - radius), (cx + 150, ground_y - radius), q_color, 6, 14, "Q", (0, -20))
    p.dashed_line(
        (cx, ground_y - radius),
        (cx + 150, ground_y - radius),
        WHITE,
        2,
        9,
        6,
        (48 * t) % 15,
    )

    reaction_x = cx + 24 * stage
    original_color = mix(BLUE, BG, 0.65 * stage)
    shifted_color = mix(GREEN, BG, 0.75 * (1 - stage))
    p.arrow((cx, ground_y - 3), (cx, ground_y - radius + 22), original_color, 4, 12, "N", (-32, -45))
    p.arrow((reaction_x, ground_y - 3), (reaction_x, ground_y - radius + 22), shifted_color, 5, 13, "N^{′}", (36, -45))
    p.arrow((cx, ground_y + 38), (reaction_x, ground_y + 38), PURPLE, 3, 9, "d", (0, -16))
    p.formula((450, 600), "d = M_1/N ≤ k · khi d = k, vật ở ngưỡng bắt đầu lăn", 18, MUTED, anchor="mm")
    return p.finish()


def render_fixed_axis(index: int) -> Image.Image:
    t = index / FRAME_COUNT
    theta = 2 * math.pi * t
    p = Painter(900, 650, grid=True)
    p.title("VẬT RẮN QUAY QUANH TRỤC CỐ ĐỊNH z", "π₁ cố định · π₂ quay · điểm C chuyển động trên đường tròn ngang")
    cx = 450
    p.dashed_line((210, 360), (690, 360), MUTED, 2, 10, 8)
    p.ellipse((200, 300, 700, 420), WHITE, BLUE, 2)
    p.text((235, 395), "π₁", 22, BLUE, italic=True, anchor="mm")
    p.line((cx, 110), (cx, 560), NAVY, 6)
    p.arrow((cx, 145), (cx, 90), NAVY, 5, 14, "z", (-24, -6))
    top_axis, bottom_axis = (cx, 245), (cx, 470)
    ox = cx + 245 * math.cos(theta)
    oy = 360 + 58 * math.sin(theta)
    body_fill = mix(LIGHT_BLUE, LIGHT_GOLD, 0.5 + 0.5 * math.sin(theta))
    p.polygon([top_axis, (ox, oy - 98), (ox, oy + 98), bottom_axis], body_fill, NAVY, 4)
    p.text(((cx + ox) / 2, (360 + oy) / 2 - 25), "π₂", 22, PURPLE, italic=True, anchor="mm")
    p.line((cx, 360), (ox, oy), GOLD, 5)
    p.ellipse((ox - 10, oy - 10, ox + 10, oy + 10), GREEN, WHITE, 2)
    p.text((ox + 16, oy - 8), "C", 24, GREEN, bold=True)
    p.ellipse((cx - 9, top_axis[1] - 9, cx + 9, top_axis[1] + 9), RED, WHITE, 2)
    p.ellipse((cx - 9, bottom_axis[1] - 9, cx + 9, bottom_axis[1] + 9), RED, WHITE, 2)
    p.text((cx + 18, top_axis[1]), "B", 24, NAVY, bold=True, anchor="lm")
    p.text((cx + 18, bottom_axis[1]), "A", 24, NAVY, bold=True, anchor="lm")
    draw_arc_arrow(p, (cx, 360), 100, 205, 335, PURPLE, 5)
    p.text((555, 270), "ω", 28, PURPLE, italic=True)
    p.formula((450, 595), "z_{C} = hằng số", 20, MUTED, anchor="mm")
    return p.finish()


def panel_title(p: Painter, center_x: float, title: str, subtitle: str) -> None:
    p.text((center_x, 125), title, 22, NAVY, bold=True, anchor="ma")
    p.text((center_x, 154), subtitle, 15, MUTED, anchor="ma")


def render_transmissions(index: int) -> Image.Image:
    t = index / FRAME_COUNT
    theta = 4 * math.pi * t
    p = Painter(1200, 680, grid=False)
    p.title("TRUYỀN ĐỘNG QUAY", "Tiếp tuyến đúng hình học · không trượt · tỉ số tốc độ theo bán kính/số răng")
    p.line((400, 105), (400, 620), GRID, 2)
    p.line((800, 105), (800, 620), GRID, 2)

    panel_title(p, 200, "ĐAI THẲNG", "Hai bánh quay cùng chiều")
    c1, c2, r1, r2 = (125, 360), (305, 360), 76, 50
    draw_moving_belt(p, belt_tangent_segments(c1, r1, c2, r2, crossed=False), (t * 52) % 26)
    draw_wheel(p, c1, r1, -theta, LIGHT_GOLD, NAVY, 8)
    draw_wheel(p, c2, r2, -theta * r1 / r2, LIGHT_GOLD, NAVY, 6)
    p.formula((200, 535), "ω_1 r_1 = ω_2 r_2 · cùng chiều", 17, GREEN, anchor="mm")

    panel_title(p, 600, "ĐAI CHÉO", "Hai bánh quay ngược chiều")
    c3, c4, r3, r4 = (515, 360), (695, 360), 76, 50
    draw_moving_belt(p, belt_tangent_segments(c3, r3, c4, r4, crossed=True), (t * 52) % 26)
    draw_wheel(p, c3, r3, -theta, LIGHT_BLUE, NAVY, 8)
    draw_wheel(p, c4, r4, theta * r3 / r4, LIGHT_BLUE, NAVY, 6)
    p.formula((600, 535), "ω_1 r_1 = ω_2 r_2 · ngược chiều", 17, GREEN, anchor="mm")

    panel_title(p, 1000, "BỘ TRUYỀN BÁNH RĂNG", "Bánh kề nhau quay ngược chiều")
    g1, g2, g3 = (840, 365), (966, 365), (1092, 365)
    draw_gear(p, g1, 42, 12, theta, LIGHT_GOLD)
    draw_gear(p, g2, 84, 24, -theta / 2, LIGHT_BLUE)
    draw_gear(p, g3, 42, 12, theta, LIGHT_RED)
    p.formula((966, 515), "z_1:z_2:z_3 = 12:24:12", 20, MUTED, anchor="mm")
    p.text((600, 645), "Đai tiếp tuyến với puly; bánh răng ăn khớp theo vòng chia", 18, MUTED, anchor="mm")
    return p.finish()


def render_mechanisms(index: int) -> Image.Image:
    t = index / FRAME_COUNT
    theta = 4 * math.pi * t
    phase = 2 * math.pi * t
    p = Painter(1200, 650, grid=False)
    p.title("BIẾN ĐỔI CHUYỂN ĐỘNG", "Ba cơ cấu hoạt động độc lập và giữ tiếp xúc hình học")
    p.line((400, 105), (400, 600), GRID, 2)
    p.line((800, 105), (800, 600), GRID, 2)

    panel_title(p, 200, "BÁNH – THANH", "Thanh tịnh tiến, bánh quay không trượt")
    rack_shift = 55 * math.sin(phase)
    rack_x, rack_width = 70 + rack_shift, 260
    p.rectangle((rack_x, 405, rack_x + rack_width, 445), WHITE, NAVY, 3)
    for tooth_x in range(12, rack_width - 10, 30):
        xx = rack_x + tooth_x
        p.line((xx, 405), (xx + 12, 390), GREEN, 3)
    draw_wheel(p, (200, 315), 90, -rack_shift / 90, LIGHT_BLUE, NAVY, 8)
    rack_rate = math.cos(phase)
    if abs(rack_rate) > 0.04:
        if rack_rate > 0:
            p.arrow((135, 478), (265, 478), GREEN, 5, 14, "v", (0, -16))
        else:
            p.arrow((265, 478), (135, 478), GREEN, 5, 14, "v", (0, -16))
    p.formula((200, 540), "v = Rω", 20, MUTED, anchor="mm")

    panel_title(p, 600, "NÊM – CẦN", "Nêm ngang tạo chuyển động đứng")
    wedge_motion = math.sin(phase)
    wedge_x = 505 + 70 * wedge_motion
    wedge_w, wedge_h, base_y = 260, 150, 445
    p.polygon([(wedge_x, base_y), (wedge_x + wedge_w, base_y), (wedge_x + wedge_w, base_y - wedge_h)], LIGHT_GOLD, NAVY, 3)
    follower_x = 650
    local_x = clamp((follower_x - wedge_x) / wedge_w)
    contact_y = base_y - wedge_h * local_x
    p.line((follower_x, 230), (follower_x, contact_y - 13), NAVY, 14)
    p.ellipse((follower_x - 13, contact_y - 13, follower_x + 13, contact_y + 13), WHITE, NAVY, 3)
    p.rectangle((625, 190, 675, 230), LIGHT_BLUE, NAVY, 2)
    wedge_rate = math.cos(phase)
    if abs(wedge_rate) > 0.04:
        if wedge_rate > 0:
            p.arrow((wedge_x + 35, 500), (wedge_x + 125, 500), GREEN, 4, 12, "v₁")
            p.arrow((690, 250), (690, 340), BLUE, 4, 12, "v₂")
        else:
            p.arrow((wedge_x + 125, 500), (wedge_x + 35, 500), GREEN, 4, 12, "v₁")
            p.arrow((690, 340), (690, 250), BLUE, 4, 12, "v₂")

    panel_title(p, 1000, "CAM LỆCH TÂM", "Cam quay tạo chuyển động tịnh tiến")
    shaft = (1000, 405)
    eccentricity, cam_radius = 34, 84
    cam_center = (shaft[0] + eccentricity * math.cos(theta), shaft[1] + eccentricity * math.sin(theta))
    p.ellipse((cam_center[0] - cam_radius, cam_center[1] - cam_radius, cam_center[0] + cam_radius, cam_center[1] + cam_radius), LIGHT_RED, NAVY, 4)
    p.line(shaft, cam_center, RED, 4)
    p.text((shaft[0] - 18, shaft[1] + 18), "O", 18, NAVY, bold=True, anchor="rm")
    p.text((cam_center[0] + 14, cam_center[1] - 14), "C", 18, RED, bold=True)
    p.ellipse((shaft[0] - 9, shaft[1] - 9, shaft[0] + 9, shaft[1] + 9), NAVY, WHITE, 2)
    horizontal_offset = shaft[0] - cam_center[0]
    follower_y = cam_center[1] - math.sqrt(cam_radius * cam_radius - horizontal_offset * horizontal_offset)
    p.line((1000, 230), (1000, follower_y - 13), NAVY, 14)
    p.ellipse((987, follower_y - 13, 1013, follower_y + 13), WHITE, NAVY, 3)
    p.rectangle((975, 190, 1025, 230), LIGHT_BLUE, NAVY, 2)
    draw_arc_arrow(p, shaft, 105, 190, 330, PURPLE, 4)
    p.text((1090, 340), "ω", 25, PURPLE, italic=True)
    return p.finish()


def impact_force(u: float) -> float:
    return math.sin(math.pi * clamp(u)) ** 1.8


def render_impact(index: int) -> Image.Image:
    t = index / FRAME_COUNT
    visibility = fade_window(t, 0.04, 0.82, 1.0)
    progress = clamp(t / 0.78)
    p = Painter(850, 700, grid=True)
    p.title("XUNG LỰC VA CHẠM", "Diện tích dưới N(t) biểu diễn xung lực trong thời gian τ")
    x0, x1, y0, y_top = 135, 720, 590, 135
    p.arrow((x0, y0), (770, y0), NAVY, 4, 14, "t", (0, 28))
    p.arrow((x0, y0), (x0, 100), NAVY, 4, 14, "N", (-32, 0))
    tau_x = x1
    p.dashed_line((tau_x, y0), (tau_x, y_top), MUTED, 2, 8, 7)
    p.text((tau_x, y0 + 35), "τ", 26, NAVY, italic=True, anchor="mm")
    points: list[Point] = []
    steps = max(2, round(160 * progress))
    curve_color = mix(BLUE, BG, 1 - visibility)
    fill_color = mix(CYAN, BG, 1 - visibility)
    for step in range(steps + 1):
        u = progress * step / steps
        x = x0 + (x1 - x0) * u
        y = y0 - 390 * impact_force(u)
        points.append((x, y))
    if points:
        p.polygon([(x0, y0), *points, (points[-1][0], y0)], fill_color, curve_color, 2)
        p.polyline(points, curve_color, 5)
        cursor_x = points[-1][0]
        p.line((cursor_x, y0), (cursor_x, points[-1][1]), GOLD, 4)
    average_level = math.sqrt(math.pi) * math.gamma(1.4) / (math.pi * math.gamma(1.9))
    nstar_y = y0 - 390 * average_level
    equivalent = smooth(clamp((t - 0.52) / 0.30)) * visibility
    rect_right = x0 + (x1 - x0) * equivalent
    if equivalent > 0:
        p.rectangle((x0, nstar_y, rect_right, y0), None, GOLD, 4)
        p.formula((x0 - 20, nstar_y), "N^{*}", 24, GOLD, anchor="rm")
    p.formula((425, 640), "∫_0^τ N(t) dt = N^{*}·τ", 22, MUTED, anchor="mm")
    return p.finish()


def draw_body(p: Painter, center: Point, size: Point, color: Color, squash: float = 0.0) -> None:
    cx, cy = center
    width = size[0] * (1 + squash)
    height = size[1] * (1 - 0.55 * squash)
    p.ellipse((cx - width / 2, cy - height / 2, cx + width / 2, cy + height / 2), color, NAVY, 4)
    p.ellipse((cx - 6, cy - 6, cx + 6, cy + 6), NAVY, NAVY, 1)


def render_collision(index: int) -> Image.Image:
    t = index / FRAME_COUNT
    if t < 0.58:
        approach = smooth(clamp(t / 0.50))
    elif t < 0.70:
        approach = 1.0
    else:
        approach = 1.0 - smooth(clamp((t - 0.70) / 0.28))
    compression = math.sin(math.pi * clamp((t - 0.52) / 0.20)) ** 2
    p = Painter(1200, 560, grid=False)
    p.title("VA CHẠM THẲNG XUYÊN TÂM", "Vận tốc trước va chạm cùng phương đường nối tâm; tách ra chỉ để đặt lại vòng lặp")
    p.line((600, 105), (600, 520), GRID, 2)
    panel_title(p, 300, "TRƯỜNG HỢP XIÊN", "C₁, I, C₂ luôn thẳng hàng")
    panel_title(p, 900, "TRƯỜNG HỢP TRỰC DIỆN", "Hai vận tốc cùng phương với C₁C₂")

    contact_left = (330, 330)
    angle = math.atan2(0.5, 1.0)
    direction = (math.cos(angle), math.sin(angle))
    oblique_support = 1 / math.sqrt(
        (direction[0] / 75) ** 2 + (direction[1] / 52.5) ** 2
    )
    c1_contact = (contact_left[0] - oblique_support * direction[0], contact_left[1] - oblique_support * direction[1])
    c2_contact = (contact_left[0] + oblique_support * direction[0], contact_left[1] + oblique_support * direction[1])
    c1_start = (contact_left[0] - 255 * direction[0], contact_left[1] - 255 * direction[1])
    c2_start = (contact_left[0] + 255 * direction[0], contact_left[1] + 255 * direction[1])
    c1 = tuple(c1_start[i] + (c1_contact[i] - c1_start[i]) * approach for i in (0, 1))
    c2 = tuple(c2_start[i] + (c2_contact[i] - c2_start[i]) * approach for i in (0, 1))
    p.dashed_line(
        (contact_left[0] - 285 * direction[0], contact_left[1] - 285 * direction[1]),
        (contact_left[0] + 285 * direction[0], contact_left[1] + 285 * direction[1]),
        NAVY,
        2,
        10,
        8,
        (52 * t) % 18,
    )
    draw_body(p, c1, (150, 105), (175, 215, 240, 255))
    draw_body(p, c2, (150, 105), (248, 211, 145, 255))
    if t < 0.52:
        p.arrow(c1, (c1[0] + 75 * direction[0], c1[1] + 75 * direction[1]), GREEN, 5, 13, "v₁")
        p.arrow(c2, (c2[0] - 75 * direction[0], c2[1] - 75 * direction[1]), GREEN, 5, 13, "v₂")
    contact_radius = 8 + 4 * compression
    p.ellipse((contact_left[0] - contact_radius, contact_left[1] - contact_radius, contact_left[0] + contact_radius, contact_left[1] + contact_radius), mix(RED, GOLD, compression), WHITE, 2)
    p.text((contact_left[0] + 12, contact_left[1] - 12), "I", 22, RED, bold=True)
    p.text((c1[0], c1[1] - 65), "C₁", 18, NAVY, bold=True, anchor="mm")
    p.text((c2[0], c2[1] - 65), "C₂", 18, NAVY, bold=True, anchor="mm")

    contact_right = (900, 335)
    left_start, right_start = 660, 1140
    direct_support = 145 / 2
    left_x = left_start + (contact_right[0] - direct_support - left_start) * approach
    right_x = right_start + (contact_right[0] + direct_support - right_start) * approach
    p.dashed_line((630, 335), (1170, 335), NAVY, 2, 10, 8, (52 * t) % 18)
    draw_body(p, (left_x, 335), (145, 125), (175, 215, 240, 255))
    draw_body(p, (right_x, 335), (145, 125), (248, 211, 145, 255))
    if t < 0.52:
        p.arrow((left_x, 335), (left_x + 78, 335), GREEN, 5, 13, "v₁")
        p.arrow((right_x, 335), (right_x - 78, 335), GREEN, 5, 13, "v₂")
    p.ellipse((contact_right[0] - contact_radius, contact_right[1] - contact_radius, contact_right[0] + contact_radius, contact_right[1] + contact_radius), mix(RED, GOLD, compression), WHITE, 2)
    p.text((contact_right[0] + 12, contact_right[1] - 12), "I", 22, RED, bold=True)
    p.text((900, 500), "Tiếp cận → nén nhỏ → đặt lại, không gán vận tốc sau va chạm", 17, MUTED, anchor="mm")
    return p.finish()


def render_motor(index: int) -> Image.Image:
    t = index / FRAME_COUNT
    theta = 2 * math.pi * t
    p = Painter(850, 760, grid=True)
    p.title("DAO ĐỘNG DO KHỐI LƯỢNG LỆCH TÂM", "m₂ quay quanh O làm vỏ động cơ m₁ dao động theo phương ngang")
    ground_y = 680
    amplitude = 18
    shift_x = amplitude * math.sin(theta)
    p.line((60, ground_y), (790, ground_y), NAVY, 6)
    for x in range(70, 790, 30):
        p.line((x, ground_y), (x - 18, ground_y + 20), MUTED, 2)
    p.dashed_line((425, 105), (425, ground_y), BLUE, 2, 9, 7)

    base_top = 555
    p.polygon(
        [(235 + shift_x, base_top), (615 + shift_x, base_top), (675 + shift_x, ground_y), (175 + shift_x, ground_y)],
        LIGHT_BLUE,
        NAVY,
        4,
    )
    p.rectangle((260 + shift_x, 590, 590 + shift_x, 625), WHITE, MUTED, 2)
    housing_center = (425 + shift_x, 350)
    housing_radius = 205
    p.ellipse((housing_center[0] - housing_radius, housing_center[1] - housing_radius, housing_center[0] + housing_radius, housing_center[1] + housing_radius), (101, 181, 224, 255), NAVY, 5)
    p.ellipse((housing_center[0] - 160, housing_center[1] - 160, housing_center[0] + 160, housing_center[1] + 160), WHITE, NAVY, 3)
    shaft = housing_center
    eccentric_radius = 128
    mass = (shaft[0] - eccentric_radius * math.sin(theta), shaft[1] - eccentric_radius * math.cos(theta))
    p.line(shaft, mass, GOLD, 9)
    p.ellipse((shaft[0] - 12, shaft[1] - 12, shaft[0] + 12, shaft[1] + 12), NAVY, WHITE, 2)
    p.ellipse((mass[0] - 30, mass[1] - 30, mass[0] + 30, mass[1] + 30), ORANGE, NAVY, 4)
    p.text(mass, "m₂", 18, NAVY, bold=True, anchor="mm")
    p.text((shaft[0] - 24, shaft[1]), "O", 24, NAVY, bold=True, anchor="rm")
    p.arrow(mass, (mass[0], mass[1] + 90), RED, 5, 13, "P_2", (26, 0))
    p.arrow(shaft, (shaft[0], shaft[1] + 110), RED, 5, 13, "P_1", (-25, 0))
    n_length = 110 + 18 * math.cos(theta)
    p.arrow((425 + shift_x, ground_y - 2), (425 + shift_x, ground_y - n_length), GREEN, 5, 13, "N(t)", (30, 0))
    p.arrow((105, 535), (105 + 3 * shift_x, 535), BLUE, 4, 12, "x_1(t)", (0, -22))
    p.formula((425, 720), "x_1(t) = a·sin(ωt) · đáy luôn tiếp xúc nền", 20, MUTED, anchor="mm")
    return p.finish()


def rotated_box(center: Point, width: float, height: float, angle: float) -> list[Point]:
    cx, cy = center
    cosine, sine = math.cos(angle), math.sin(angle)
    points: list[Point] = []
    for local_x, local_y in (
        (-width / 2, -height / 2),
        (width / 2, -height / 2),
        (width / 2, height / 2),
        (-width / 2, height / 2),
    ):
        points.append((cx + local_x * cosine - local_y * sine, cy + local_x * sine + local_y * cosine))
    return points


def point_on_ray(origin: Point, angle: float, distance: float) -> Point:
    return origin[0] + distance * math.cos(angle), origin[1] + distance * math.sin(angle)


# The rigid body stays fixed: only the equivalent force representation slides along AB.
def render_force_slide(index: int) -> Image.Image:
    t = index / FRAME_COUNT
    cycle_visibility = fade_window(t, 0.02, 0.84, 1.0)
    pair_visibility = smooth(clamp((t - 0.18) / 0.18))
    cancellation = smooth(clamp((t - 0.50) / 0.18))
    pulse = 0.5 - 0.5 * math.cos(4 * math.pi * t)
    p = Painter(900, 520, grid=True)
    p.title("TRƯỢT LỰC TRÊN VẬT RẮN", "Thêm cặp lực cân bằng tại B rồi khử cặp đối nhau")
    body = [(105, 295), (155, 190), (355, 150), (650, 175), (795, 260), (735, 390), (430, 425), (185, 390)]
    p.polygon(body, (219, 239, 241, 255), NAVY, 4)
    a, b = (250, 292), (630, 292)
    p.line((150, 292), (760, 292), MUTED, 2)
    for point, label in ((a, "A"), (b, "B")):
        p.ellipse((point[0] - 9, point[1] - 9, point[0] + 9, point[1] + 9), NAVY, WHITE, 2)
        p.text((point[0], point[1] - 28), label, 24, NAVY, bold=True, anchor="mm")

    force_color = mix(RED, GOLD, 0.18 * pulse)
    at_a = Painter(900, 520, background=(0, 0, 0, 0))
    at_a.arrow(a, (a[0] + 118, a[1]), force_color, 7, 17, "F_{A}", (0, -26))
    p.composite(at_a, (1 - cycle_visibility) + cycle_visibility * (1 - cancellation))

    pair = Painter(900, 520, background=(0, 0, 0, 0))
    pair.arrow(b, (b[0] + 118, b[1]), force_color, 7, 17, "F^{′}_{B}", (0, -28))
    p.composite(pair, cycle_visibility * pair_visibility)

    cancelling = Painter(900, 520, background=(0, 0, 0, 0))
    cancelling.arrow(b, (b[0] - 118, b[1]), force_color, 7, 17, "F_{B}", (0, 27))
    p.composite(cancelling, cycle_visibility * pair_visibility * (1 - cancellation))
    marker = Painter(900, 520, background=(0, 0, 0, 0))
    marker.line((280, 430), (620, 430), MUTED, 2)
    marker.ellipse((270 + 360 * t, 422, 286 + 360 * t, 438), GOLD, WHITE, 2)
    marker.text((450, 410), "TIẾN TRÌNH DỰNG  1 → 2 → 3", 16, MUTED, bold=True, anchor="mm")
    p.composite(marker, cycle_visibility)
    p.formula((450, 470), "F_{A} + F_{B} = 0  ⇒  hệ lực còn F^{′}_{B} = F_{A}", 19, MUTED, anchor="mm")
    return p.finish()


# For fixed-ground rolling: x_center=s/2 and the screen-clockwise angle is theta=s/(2R).
def render_roller_board(index: int) -> Image.Image:
    t = index / FRAME_COUNT
    board_shift = 105 * math.sin(2 * math.pi * t)
    roller_shift = board_shift / 2
    p = Painter(1000, 620, grid=True)
    p.title("TẤM VÁN LĂN TRÊN CÁC CON LĂN", "Tiếp xúc dưới đứng yên; tâm con lăn dịch bằng nửa độ dời của ván")
    ground_y, radius = 505, 42
    p.line((70, ground_y), (930, ground_y), NAVY, 5)
    for x in range(80, 930, 30):
        p.line((x, ground_y), (x - 18, ground_y + 17), MUTED, 2)
    board_x = 250 + board_shift
    board_y = ground_y - 2 * radius - 90
    p.polygon([(board_x, board_y), (board_x + 560, board_y), (board_x + 520, board_y + 90), (board_x + 20, board_y + 90)], LIGHT_GOLD, NAVY, 4)
    for base_x in (330, 450, 570, 690):
        cx = base_x + roller_shift
        theta = board_shift / (2 * radius)
        draw_wheel(p, (cx, ground_y - radius), radius, theta, LIGHT_BLUE, NAVY, 5)
    if abs(board_shift) > 4:
        start = (250, 175)
        end = (250 + board_shift, 175)
        p.arrow(start, end, GREEN, 4, 12, "s", (0, -18))
    p.formula((500, 575), "s_{tâm} = s_{ván} / 2 · không trượt tại hai tiếp điểm", 18, MUTED, anchor="mm")
    return p.finish()


# Hinge fixed; W remains vertical, N normal to the bar, and F tangent to it.
def render_adjustable_incline(index: int) -> Image.Image:
    t = index / FRAME_COUNT
    angle = math.radians(18 + 11 * math.sin(2 * math.pi * t))
    p = Painter(1100, 650, grid=False)
    p.title("CÂN BẰNG TRÊN THANH NGHIÊNG", "Thay đổi θ để thấy hệ trục cục bộ quay còn trọng lực vẫn thẳng đứng")
    p.line((560, 105), (560, 605), GRID, 2)
    hinge = (135, 500)
    length = 375
    endpoint = point_on_ray(hinge, -angle, length)
    p.line((70, 520), (520, 520), NAVY, 5)
    p.ellipse((hinge[0] - 17, hinge[1] - 17, hinge[0] + 17, hinge[1] + 17), LIGHT_GOLD, NAVY, 3)
    p.line(hinge, endpoint, GOLD, 18)
    p.arc((hinge[0] - length, hinge[1] - length, hinge[0] + length, hinge[1] + length), 331, 353, MUTED, 18)
    p.ellipse((endpoint[0] - 11, endpoint[1] - 11, endpoint[0] + 11, endpoint[1] + 11), WHITE, GOLD, 3)
    block_center = point_on_ray(hinge, -angle, length * 0.55)
    normal = (-math.sin(-angle), math.cos(-angle))
    block_center = (block_center[0] - normal[0] * 32.5, block_center[1] - normal[1] * 32.5)
    p.polygon(rotated_box(block_center, 92, 65, -angle), (174, 185, 194, 255), NAVY, 3)
    p.text(block_center, "m", 24, NAVY, bold=True, italic=True, anchor="mm")
    p.arc((hinge[0] - 75, hinge[1] - 75, hinge[0] + 75, hinge[1] + 75), 360 - math.degrees(angle), 360, PURPLE, 4)
    p.text(point_on_ray(hinge, -angle / 2, 98), "θ", 24, PURPLE, italic=True, anchor="mm")

    fbd_center = (810, 375)
    p.line(point_on_ray(fbd_center, -angle, -190), point_on_ray(fbd_center, -angle, 190), NAVY, 4)
    p.polygon(rotated_box(fbd_center, 110, 72, -angle), LIGHT_BLUE, NAVY, 3)
    p.arrow(fbd_center, (fbd_center[0], fbd_center[1] + 145), RED, 5, 14, "W=mg", (38, 0))
    normal_end = (fbd_center[0] - normal[0] * 130, fbd_center[1] - normal[1] * 130)
    p.arrow(fbd_center, normal_end, GREEN, 5, 14, "N", (22, -3))
    tangent_end = point_on_ray(fbd_center, -angle, 145)
    p.arrow(fbd_center, tangent_end, GOLD, 5, 14, "F", (0, -20))
    p.formula((810, 555), "W thẳng đứng · N ⟂ mặt · F ∥ mặt", 18, MUTED, anchor="mm")
    return p.finish()


# Taut rope around a fixed pulley enforces equal and opposite endpoint displacements.
def render_two_blocks(index: int) -> Image.Image:
    t = index / FRAME_COUNT
    visibility = fade_window(t, 0.03, 0.82, 1.0)
    progress = smooth(clamp((t - 0.03) / 0.76))
    displacement = 38 * progress
    p = Painter(950, 640, grid=True)
    p.title("HAI VẬT NỐI QUA RÒNG RỌC CỐ ĐỊNH", "Dây không dãn; hai lực ma sát tương tác bằng nhau và ngược chiều")
    p.line((60, 515), (890, 515), NAVY, 5)
    layer = Painter(950, 640, background=(0, 0, 0, 0))
    pulley = (150, 365)
    pulley_radius = 65
    draw_wheel(layer, pulley, pulley_radius, -displacement / pulley_radius, LIGHT_BLUE, NAVY, 8)
    lower_center = (565 + displacement, 430)
    upper_center = (565 - displacement, 300)
    layer.line((pulley[0], pulley[1] - pulley_radius), (upper_center[0] - 85, upper_center[1]), GOLD, 5)
    layer.line((pulley[0], pulley[1] + pulley_radius), (lower_center[0] - 145, lower_center[1]), GOLD, 5)
    layer.dashed_line((pulley[0], pulley[1] - pulley_radius), (upper_center[0] - 85, upper_center[1]), GREEN, 2, 10, 8, (52 * t) % 18)
    layer.dashed_line((pulley[0], pulley[1] + pulley_radius), (lower_center[0] - 145, lower_center[1]), GREEN, 2, 10, 8, (52 * t) % 18)
    layer.rectangle((lower_center[0] - 145, lower_center[1] - 70, lower_center[0] + 145, lower_center[1] + 70), LIGHT_GOLD, NAVY, 4)
    layer.rectangle((upper_center[0] - 85, upper_center[1] - 60, upper_center[0] + 85, upper_center[1] + 60), LIGHT_BLUE, NAVY, 4)
    layer.text(upper_center, "1", 34, NAVY, bold=True, anchor="mm")
    layer.text(lower_center, "2", 34, NAVY, bold=True, anchor="mm")
    layer.arrow((lower_center[0] + 155, lower_center[1]), (lower_center[0] + 245, lower_center[1]), RED, 6, 15, "F")
    layer.arrow((upper_center[0] - 35, 356), (upper_center[0] + 55, 356), PURPLE, 4, 12, "F_{21}", (0, -18))
    layer.arrow((lower_center[0] + 35, 364), (lower_center[0] - 55, 364), PURPLE, 4, 12, "F_{12}", (0, 20))
    reference = Painter(950, 640, background=(0, 0, 0, 0))
    draw_wheel(reference, pulley, pulley_radius, 0, LIGHT_BLUE, NAVY, 8)
    reference.line((pulley[0], pulley[1] - pulley_radius), (480, 300), GOLD, 5)
    reference.line((pulley[0], pulley[1] + pulley_radius), (420, 430), GOLD, 5)
    reference.rectangle((420, 360, 710, 500), LIGHT_GOLD, NAVY, 4)
    reference.rectangle((480, 240, 650, 360), LIGHT_BLUE, NAVY, 4)
    reference.text((565, 300), "1", 34, NAVY, bold=True, anchor="mm")
    reference.text((565, 430), "2", 34, NAVY, bold=True, anchor="mm")
    reference.arrow((720, 430), (810, 430), RED, 6, 15, "F")
    reference.arrow((530, 356), (620, 356), PURPLE, 4, 12, "F_{21}", (0, -18))
    reference.arrow((600, 364), (510, 364), PURPLE, 4, 12, "F_{12}", (0, 20))
    p.composite(reference, 1 - visibility)
    p.composite(layer, visibility)
    p.formula((475, 585), "Δx_1 + Δx_2 = 0 · F_{12} = −F_{21}", 21, MUTED, anchor="mm")
    return p.finish()


# Signed rectilinear coordinate: s=OP and delta-s is the finite displacement.
def render_rectilinear(index: int) -> Image.Image:
    t = index / FRAME_COUNT
    visibility = fade_window(t, 0.04, 0.76, 1.0)
    progress = clamp(t / 0.80)
    p = Painter(900, 500, grid=True)
    p.title("TỌA ĐỘ VÀ ĐỘ DỜI TRÊN ĐƯỜNG THẲNG", "s = OP là tọa độ đầu; Δs = PP′ là độ dời hữu hạn")
    y, origin_x, initial_x, final_x = 260, 210, 500, 720
    current_x = initial_x + (final_x - initial_x) * progress
    p.arrow((90, y), (820, y), NAVY, 5, 15)
    p.dashed_line((90, y), (820, y), BLUE, 2, 12, 10, (52 * t) % 22)
    p.text((80, y), "−s", 25, NAVY, italic=True, anchor="rm")
    p.text((830, y), "+s", 25, NAVY, italic=True, anchor="lm")
    for x, label in ((origin_x, "O"), (initial_x, "P")):
        p.ellipse((x - 10, y - 10, x + 10, y + 10), BLUE, WHITE, 2)
        p.text((x, y - 40), label, 28, NAVY, italic=True, anchor="mm")
    p.dashed_line((origin_x, 355), (initial_x, 355), BLUE, 3, 12, 7)
    p.formula(((origin_x + initial_x) / 2, 385), "s = OP", 22, BLUE, anchor="mm")
    layer = Painter(900, 500, background=(0, 0, 0, 0))
    layer.ellipse((current_x - 13, y - 13, current_x + 13, y + 13), ORANGE, WHITE, 3)
    layer.text((current_x, y + 43), "P′", 28, ORANGE, italic=True, anchor="mm")
    if current_x - initial_x > 8:
        layer.arrow((initial_x, 430), (current_x, 430), GOLD, 4, 12, "Δs = PP′", (0, 22))
    p.composite(layer, visibility)
    return p.finish()


# A carries the body-fixed frame; OXY remains fixed while the rigid shape translates and rotates.
def render_planar_body(index: int) -> Image.Image:
    t = index / FRAME_COUNT
    phase = 2 * math.pi * t
    body_angle = phase
    a = (485 + 105 * math.cos(phase), 350 + 58 * math.sin(phase))
    p = Painter(950, 650, grid=True)
    p.title("CHUYỂN ĐỘNG SONG PHẲNG CỦA VẬT RẮN", "Tịnh tiến OXY → AX′Y′ rồi quay một góc φ đến Aξη")
    origin = (115, 540)
    p.arrow(origin, (850, 540), RED, 4, 14, "X", (0, 24))
    p.arrow(origin, (115, 115), RED, 4, 14, "Y", (-25, 0))
    p.dashed_line((a[0], origin[1]), a, BLUE, 2, 9, 7)
    p.dashed_line((origin[0], a[1]), a, BLUE, 2, 9, 7)
    p.dashed_line(a, (a[0] + 155, a[1]), BLUE, 3, 9, 7)
    p.dashed_line(a, (a[0], a[1] - 125), BLUE, 3, 9, 7)
    p.text((a[0] + 145, a[1] + 12), "X′", 19, BLUE, italic=True)
    p.text((a[0] - 12, a[1] - 125), "Y′", 19, BLUE, italic=True, anchor="rm")
    local_shape = [(-120, -65), (70, -90), (145, -15), (85, 80), (-75, 95), (-145, 20)]
    cosine, sine = math.cos(body_angle), math.sin(body_angle)
    shape = [(a[0] + x * cosine - y * sine, a[1] + x * sine + y * cosine) for x, y in local_shape]
    p.polygon(shape, LIGHT_BLUE, NAVY, 4)
    p.ellipse((a[0] - 9, a[1] - 9, a[0] + 9, a[1] + 9), RED, WHITE, 2)
    p.text((a[0] - 17, a[1] + 18), "A", 23, NAVY, bold=True, anchor="rm")
    p.arrow(a, point_on_ray(a, body_angle, 185), PURPLE, 4, 12, "ξ", (12, -10))
    p.arrow(a, point_on_ray(a, body_angle - math.pi / 2, 145), PURPLE, 4, 12, "η", (-12, -8))
    phi = math.degrees(body_angle)
    if phi > 180:
        phi -= 360
    if abs(phi) > 3:
        if phi > 0:
            p.arc((a[0] - 72, a[1] - 72, a[0] + 72, a[1] + 72), 0, phi, GOLD, 4)
        else:
            p.arc((a[0] - 72, a[1] - 72, a[0] + 72, a[1] + 72), 360 + phi, 360, GOLD, 4)
    p.text(point_on_ray(a, math.radians(phi) / 2, 88), "φ", 22, GOLD, italic=True, anchor="mm")
    p.formula((475, 605), "X_{A}, Y_{A}, φ xác định hoàn toàn tư thế", 18, MUTED, anchor="mm")
    return p.finish()


# J lies on AX; the equal and opposite a_A and a_JA vectors expose a_J=0.
def render_acceleration_center(index: int) -> Image.Image:
    t = index / FRAME_COUNT
    pulse = 1 - abs(2 * ((4 * t) % 1) - 1)
    ray_visibility = smooth(clamp((t - 0.12) / 0.18))
    point_visibility = smooth(clamp((t - 0.30) / 0.18))
    sum_visibility = smooth(clamp((t - 0.48) / 0.18))
    cycle_visibility = fade_window(t, 0.02, 0.84, 1.0)
    p = Painter(950, 650, grid=True)
    p.title("TÂM GIA TỐC TỨC THỜI J", "Dựng AX bằng cách quay véc tơ gia tốc tại A một góc α, rồi xác định J")
    a = (180, 450)
    alpha = math.radians(-32)
    distance = 360
    j = point_on_ray(a, alpha, distance)
    body_points = [(100, 490), (145, 330), (350, 145), (670, 130), (800, 315), (650, 470), (310, 545)]
    p.polygon(body_points, (226, 242, 239, 255), mix(NAVY, GOLD, pulse), 6)
    p.ellipse((a[0] - 10, a[1] - 10, a[0] + 10, a[1] + 10), WHITE, NAVY, 3)
    p.text((a[0] - 18, a[1]), "A", 26, NAVY, bold=True, anchor="rm")
    p.arrow(a, (a[0] + 175, a[1]), mix(PURPLE, GOLD, pulse), 5, 14, "a_{A}", (0, 25))
    p.dashed_line(a, (a[0] + 175, a[1]), GOLD, 3, 10, 8, (52 * t) % 18)

    ray = Painter(950, 650, background=(0, 0, 0, 0))
    ray.line(a, point_on_ray(a, alpha, 590), GOLD, 5)
    ray.text(point_on_ray(a, alpha, 575), "X", 26, NAVY, bold=True, anchor="mm")
    ray.arc((a[0] - 85, a[1] - 85, a[0] + 85, a[1] + 85), 360 + math.degrees(alpha), 360, BLUE, 4)
    ray.text(point_on_ray(a, alpha / 2, 105), "α", 23, BLUE, italic=True, anchor="mm")
    p.composite(ray, cycle_visibility * ray_visibility)

    point = Painter(950, 650, background=(0, 0, 0, 0))
    point.ellipse((j[0] - 11, j[1] - 11, j[0] + 11, j[1] + 11), WHITE, GOLD, 3)
    point.text((j[0] + 18, j[1]), "J", 26, NAVY, bold=True, anchor="lm")
    point.formula(((a[0] + j[0]) / 2, (a[1] + j[1]) / 2 - 25), "AJ = a_{A} / √(ω^4 + ε^2)", 18, MUTED, anchor="mm")
    p.composite(point, cycle_visibility * point_visibility)

    vector_color = mix(RED, GOLD, 0.55 * pulse)
    vector_sum = Painter(950, 650, background=(0, 0, 0, 0))
    vector_sum.arrow(j, (j[0] + 145, j[1]), vector_color, 5, 14, "a_{A}", (0, -22))
    vector_sum.arrow(j, (j[0] - 145, j[1]), vector_color, 5, 14, "a_{JA}", (0, -22))
    p.composite(vector_sum, cycle_visibility * sum_visibility)
    p.formula((475, 595), "tan α = ε/ω^2 · a_{J} = a_{A} + a_{JA} = 0", 21, MUTED, anchor="mm")
    return p.finish()


# B is the continuous right-hand circle-line intersection, keeping OA and AB rigid.
def render_crank_slider(index: int) -> Image.Image:
    t = index / FRAME_COUNT
    visibility = fade_window(t, 0.03, 0.82, 1.0)
    progress = smooth(clamp((t - 0.03) / 0.76))
    theta = -math.pi / 2 - math.radians(28) * progress
    p = Painter(1000, 700, grid=True)
    p.title("TAY QUAY – THANH TRUYỀN – CON TRƯỢT NGHIÊNG", "OA:AB = 1:2 · ray DE nghiêng α = 45° · cấu hình đầu β = 90°")
    o = (300, 500)
    crank_length, rod_length = 125, 250
    initial_a = point_on_ray(o, -math.pi / 2, crank_length)
    guide_origin = (initial_a[0] + rod_length, initial_a[1])
    guide_angle = math.radians(45)
    guide_direction = (math.cos(guide_angle), math.sin(guide_angle))
    a = point_on_ray(o, theta, crank_length)
    projection = (a[0] - guide_origin[0]) * guide_direction[0] + (a[1] - guide_origin[1]) * guide_direction[1]
    perpendicular_sq = (a[0] - guide_origin[0]) ** 2 + (a[1] - guide_origin[1]) ** 2 - projection**2
    discriminant = rod_length * rod_length - perpendicular_sq
    require(discriminant >= -1e-6, f"crank-slider: no circle-line intersection at frame {index}")
    along = projection + math.sqrt(max(0.0, discriminant))
    b = (guide_origin[0] + along * guide_direction[0], guide_origin[1] + along * guide_direction[1])
    guide_start = point_on_ray(guide_origin, guide_angle, -300)
    guide_end = point_on_ray(guide_origin, guide_angle, 380)
    p.line(guide_start, guide_end, GOLD, 16)
    p.dashed_line(guide_start, guide_end, GREEN, 3, 12, 10, (52 * t) % 22)
    p.text((guide_start[0] - 18, guide_start[1] - 20), "E", 24, NAVY, bold=True)
    p.text((guide_end[0] + 8, guide_end[1]), "D", 24, NAVY, bold=True)
    p.rectangle((240, 585, 360, 640), (202, 205, 208, 255), NAVY, 3)

    layer = Painter(1000, 700, background=(0, 0, 0, 0))
    layer.line(o, a, BLUE, 18)
    layer.line(a, b, RED, 16)
    layer.polygon(rotated_box(b, 105, 78, guide_angle), (90, 93, 88, 255), NAVY, 4)
    for point_value, label in ((o, "O"), (a, "A"), (b, "B")):
        layer.ellipse((point_value[0] - 10, point_value[1] - 10, point_value[0] + 10, point_value[1] + 10), NAVY, WHITE, 2)
        layer.text((point_value[0] + 18, point_value[1] - 20), label, 24, NAVY, bold=True)
    layer.arc((o[0] - 145, o[1] - 145, o[0] + 145, o[1] + 145), 220, 255, PURPLE, 5)
    layer.arrow(point_on_ray(o, math.radians(228), 145), point_on_ray(o, math.radians(220), 145), PURPLE, 5, 11)
    layer.formula((420, 510), "ω_{OA}", 25, PURPLE, anchor="lm")
    reference = Painter(1000, 700, background=(0, 0, 0, 0))
    reference.line(o, initial_a, BLUE, 18)
    reference.line(initial_a, guide_origin, RED, 16)
    reference.polygon(rotated_box(guide_origin, 105, 78, guide_angle), (90, 93, 88, 255), NAVY, 4)
    for point_value, label in ((o, "O"), (initial_a, "A"), (guide_origin, "B")):
        reference.ellipse((point_value[0] - 10, point_value[1] - 10, point_value[0] + 10, point_value[1] + 10), NAVY, WHITE, 2)
        reference.text((point_value[0] + 18, point_value[1] - 20), label, 24, NAVY, bold=True)
    reference.arc((o[0] - 145, o[1] - 145, o[0] + 145, o[1] + 145), 220, 255, PURPLE, 5)
    reference.arrow(point_on_ray(o, math.radians(228), 145), point_on_ray(o, math.radians(220), 145), PURPLE, 5, 11)
    reference.formula((420, 510), "ω_{OA}", 25, PURPLE, anchor="lm")
    p.composite(reference, 1 - visibility)
    p.composite(layer, visibility)
    return p.finish()


# Perfectly inelastic impact: after contact the bullet and cart share one velocity.
def render_bullet_cart(index: int) -> Image.Image:
    t = index / FRAME_COUNT
    visibility = fade_window(t, 0.02, 0.84, 1.0)
    p = Painter(1100, 620, grid=True)
    p.title("VA CHẠM MỀM: ĐẦU ĐẠN – XE CÁT", "Đầu đạn chạm đúng mặt xe, lún vào cát rồi cùng xe chuyển động đều")
    ground_y = 520
    p.line((70, ground_y), (1030, ground_y), NAVY, 5)
    initial_cart_x = 660
    impact_time = 0.42
    embed_end = 0.50
    post_shift = 0.0 if t <= embed_end else 440 * min(t - embed_end, 0.34)
    cart_x = initial_cart_x + post_shift
    cart_y = 405
    initial_contact_x = initial_cart_x - 170
    bullet_contact_center = initial_contact_x - 52
    if t < impact_time:
        approach = smooth(clamp((t - 0.02) / (impact_time - 0.02)))
        bullet_x = 125 + (bullet_contact_center - 125) * approach
    elif t < embed_end:
        penetration = smooth((t - impact_time) / (embed_end - impact_time))
        bullet_x = bullet_contact_center + 94 * penetration
    else:
        bullet_x = initial_contact_x + 42 + post_shift

    layer = Painter(1100, 620, background=(0, 0, 0, 0))
    layer.rectangle((cart_x - 170, cart_y - 115, cart_x + 170, cart_y + 65), LIGHT_BLUE, NAVY, 4)
    for wheel_x in (cart_x - 105, cart_x + 105):
        draw_wheel(layer, (wheel_x, ground_y - 42), 42, post_shift / 42, WHITE, NAVY, 6)
    layer.polygon([(bullet_x - 70, 372), (bullet_x + 25, 372), (bullet_x + 52, 388), (bullet_x + 25, 404), (bullet_x - 70, 404)], LIGHT_GOLD, NAVY, 3)
    if t < impact_time:
        layer.arrow((bullet_x - 60, 345), (bullet_x + 70, 345), RED, 5, 14, "u")
    elif t >= embed_end:
        layer.arrow((cart_x - 45, 270), (cart_x + 90, 270), GREEN, 5, 14, "V = const")
    else:
        layer.ellipse((initial_contact_x - 18, 365, initial_contact_x + 18, 411), mix(GOLD, WHITE, 0.45), GOLD, 3)
    layer.text((cart_x, 420), "M", 30, NAVY, bold=True, anchor="mm")
    layer.text((bullet_x - 20, 388), "m", 20, NAVY, bold=True, anchor="mm")
    reference = Painter(1100, 620, background=(0, 0, 0, 0))
    reference.rectangle((490, 290, 830, 470), LIGHT_BLUE, NAVY, 4)
    for wheel_x in (555, 765):
        draw_wheel(reference, (wheel_x, ground_y - 42), 42, 0, WHITE, NAVY, 6)
    reference.polygon([(55, 372), (150, 372), (177, 388), (150, 404), (55, 404)], LIGHT_GOLD, NAVY, 3)
    reference.arrow((65, 345), (195, 345), RED, 5, 14, "u")
    reference.text((660, 420), "M", 30, NAVY, bold=True, anchor="mm")
    reference.text((105, 388), "m", 20, NAVY, bold=True, anchor="mm")
    p.composite(reference, 1 - visibility)
    p.composite(layer, visibility)
    p.formula((550, 575), "m·u = (m + M)V · sau va chạm không bật lại", 20, MUTED, anchor="mm")
    return p.finish()


# The block translates with F; friction stays opposite the motion while P and N remain vertical.
def render_sliding_block(index: int) -> Image.Image:
    t = index / FRAME_COUNT
    visibility = fade_window(t, 0.04, 0.78, 1.0)
    normalized_time = clamp((t - 0.04) / 0.74)
    progress = normalized_time * normalized_time
    p = Painter(900, 600, grid=True)
    p.title("VẬT TRƯỢT DƯỚI LỰC KÉO NGHIÊNG", "Hợp lực ngang không đổi làm vật tăng tốc theo chiều chuyển động")
    ground_y = 465
    p.line((70, ground_y), (830, ground_y), NAVY, 5)
    for x in range(80, 830, 28):
        p.line((x, ground_y), (x - 16, ground_y + 16), MUTED, 2)
    layer = Painter(900, 600, background=(0, 0, 0, 0))
    center = (245 + 360 * progress, ground_y - 62)
    layer.rectangle((center[0] - 70, center[1] - 62, center[0] + 70, center[1] + 62), LIGHT_BLUE, NAVY, 4)
    force_end = (center[0] + 150, center[1] - 95)
    layer.arrow(center, force_end, BLUE, 6, 15, "F", (15, -12))
    layer.arrow((center[0] - 20, ground_y - 4), (center[0] - 150, ground_y - 4), PURPLE, 5, 14, "F_{ms}", (0, -18))
    layer.arrow(center, (center[0], center[1] + 145), RED, 5, 14, "P", (-24, 0))
    layer.arrow((center[0] + 25, ground_y - 4), (center[0] + 25, center[1] - 130), GREEN, 5, 14, "N", (23, 0))
    layer.text(center, "m", 28, NAVY, bold=True, italic=True, anchor="mm")
    reference = Painter(900, 600, background=(0, 0, 0, 0))
    reference_center = (245, ground_y - 62)
    reference.rectangle((175, ground_y - 124, 315, ground_y), LIGHT_BLUE, NAVY, 4)
    reference.arrow(reference_center, (reference_center[0] + 150, reference_center[1] - 95), BLUE, 6, 15, "F", (15, -12))
    reference.arrow((reference_center[0] - 20, ground_y - 4), (reference_center[0] - 150, ground_y - 4), PURPLE, 5, 14, "F_{ms}", (0, -18))
    reference.arrow(reference_center, (reference_center[0], reference_center[1] + 145), RED, 5, 14, "P", (-24, 0))
    reference.arrow((reference_center[0] + 25, ground_y - 4), (reference_center[0] + 25, reference_center[1] - 130), GREEN, 5, 14, "N", (23, 0))
    reference.text(reference_center, "m", 28, NAVY, bold=True, italic=True, anchor="mm")
    p.composite(reference, 1 - visibility)
    p.composite(layer, visibility)
    p.formula((450, 550), "F_{x} − F_{ms} > 0 ⇒ a_{x} > 0 · N↑ · P↓", 19, MUTED, anchor="mm")
    return p.finish()


# Rope length gives 2*s1+s2=constant; the moving pulley and m1 share displacement s1.
def render_movable_pulley(index: int) -> Image.Image:
    t = index / FRAME_COUNT
    s1 = 42 * math.sin(2 * math.pi * t)
    s2 = -2 * s1
    p = Painter(850, 760, grid=True)
    p.title("HỆ HAI VẬT VỚI RÒNG RỌC ĐỘNG", "Ràng buộc dây không dãn: 2s₁ + s₂ = hằng số")
    ceiling_y = 145
    p.rectangle((80, 105, 770, ceiling_y), (185, 145, 95, 255), NAVY, 3)
    moving = (280, 430 + s1)
    fixed = (410, 220)
    m1 = (280, 600 + s1)
    m2 = (470, 440 + s2)
    p.line((210, ceiling_y), (210, moving[1]), GOLD, 5)
    p.arc((moving[0] - 70, moving[1] - 70, moving[0] + 70, moving[1] + 70), 0, 180, GOLD, 5)
    p.line((350, moving[1]), (350, fixed[1]), GOLD, 5)
    p.arc((fixed[0] - 60, fixed[1] - 60, fixed[0] + 60, fixed[1] + 60), 180, 360, GOLD, 5)
    p.line((470, fixed[1]), (470, m2[1] - 55), GOLD, 5)
    draw_wheel(p, moving, 70, s1 / 70, LIGHT_BLUE, NAVY, 8)
    draw_wheel(p, fixed, 60, -2 * s1 / 60, LIGHT_GOLD, NAVY, 8)
    p.line((moving[0], moving[1] + 70), (m1[0], m1[1] - 55), NAVY, 8)
    p.rectangle((m1[0] - 55, m1[1] - 55, m1[0] + 55, m1[1] + 55), LIGHT_BLUE, NAVY, 4)
    p.rectangle((m2[0] - 50, m2[1] - 55, m2[0] + 50, m2[1] + 55), LIGHT_GOLD, NAVY, 4)
    p.formula(m1, "m_1", 25, NAVY, anchor="mm")
    p.formula(m2, "m_2", 25, NAVY, anchor="mm")
    p.arrow((120, 345), (120, 345 + s1), BLUE, 4, 12, "s_1", (-24, 0))
    p.arrow((650, 400), (650, 400 + s2), GREEN, 4, 12, "s_2", (24, 0))
    p.formula((425, 720), "m_1↓ một đoạn s_1 ⇒ m_2↑ hai đoạn", 18, MUTED, anchor="mm")
    return p.finish()


# The wedge translates relative to fixed ground while the block remains on and slides down its plane.
def render_moving_wedge(index: int) -> Image.Image:
    t = index / FRAME_COUNT
    visibility = fade_window(t, 0.04, 0.78, 1.0)
    normalized_time = clamp((t - 0.04) / 0.74)
    progress = normalized_time * normalized_time
    p = Painter(950, 620, grid=True)
    p.title("VẬT TRƯỢT TRÊN NÊM CHUYỂN ĐỘNG", "Nêm có gia tốc a₀ sang phải; vật giữ tiếp xúc và trượt xuống mặt nêm")
    ground_y = 520
    p.line((55, ground_y), (895, ground_y), NAVY, 5)
    for x in range(65, 895, 28):
        p.line((x, ground_y), (x - 16, ground_y + 16), MUTED, 2)
    layer = Painter(950, 620, background=(0, 0, 0, 0))
    wedge_x = 115 + 180 * progress
    wedge_width, wedge_height = 450, 270
    layer.polygon([(wedge_x, ground_y), (wedge_x + wedge_width, ground_y), (wedge_x, ground_y - wedge_height)], LIGHT_BLUE, NAVY, 4)
    relative = 0.28 + 0.48 * progress
    slope_angle = math.atan2(wedge_height, wedge_width)
    contact = (wedge_x + relative * wedge_width, ground_y - wedge_height + relative * wedge_height)
    normal = (math.sin(slope_angle), -math.cos(slope_angle))
    block_center = (contact[0] + normal[0] * 36, contact[1] + normal[1] * 36)
    layer.polygon(rotated_box(block_center, 105, 72, slope_angle), (174, 185, 194, 255), NAVY, 4)
    layer.text(block_center, "m", 26, NAVY, bold=True, italic=True, anchor="mm")
    layer.arrow((wedge_x + 90, ground_y - 48), (wedge_x + 240, ground_y - 48), GOLD, 5, 14, "a₀", (0, -20))
    layer.arrow(block_center, point_on_ray(block_center, slope_angle, 135), GREEN, 5, 14, "v_{rel}", (0, -18))
    reference = Painter(950, 620, background=(0, 0, 0, 0))
    reference_wedge_x = 115
    reference.polygon([(reference_wedge_x, ground_y), (reference_wedge_x + wedge_width, ground_y), (reference_wedge_x, ground_y - wedge_height)], LIGHT_BLUE, NAVY, 4)
    reference_contact = (
        reference_wedge_x + 0.28 * wedge_width,
        ground_y - wedge_height + 0.28 * wedge_height,
    )
    reference_center = (
        reference_contact[0] + normal[0] * 36,
        reference_contact[1] + normal[1] * 36,
    )
    reference.polygon(rotated_box(reference_center, 105, 72, slope_angle), (174, 185, 194, 255), NAVY, 4)
    reference.text(reference_center, "m", 26, NAVY, bold=True, italic=True, anchor="mm")
    reference.arrow((205, ground_y - 48), (355, ground_y - 48), GOLD, 5, 14, "a₀", (0, -20))
    reference.arrow(reference_center, point_on_ray(reference_center, slope_angle, 135), GREEN, 5, 14, "v_{rel}", (0, -18))
    p.composite(reference, 1 - visibility)
    p.composite(layer, visibility)
    p.formula((475, 580), "a_0 → phải · vật trượt xuống dọc mặt nghiêng", 18, MUTED, anchor="mm")
    return p.finish()


SPECS = [
    GifSpec("ch1", "hinh-1-06", (900, 520), render_force_slide),
    GifSpec("ch1", "hinh-1-09", (960, 600), render_spring),
    GifSpec("ch1", "hinh-1-28b", (1000, 620), render_roller_board),
    GifSpec("ch1", "hinh-1-34", (1100, 650), render_adjustable_incline),
    GifSpec("ch1", "hinh-1-35", (950, 640), render_two_blocks),
    GifSpec("ch1", "hinh-1-minh-hoa-02", (900, 650), render_friction),
    GifSpec("ch2", "hinh-2-07", (900, 500), render_rectilinear),
    GifSpec("ch2", "hinh-2-09", (900, 650), render_fixed_axis),
    GifSpec("ch2", "hinh-2-15", (1200, 680), render_transmissions),
    GifSpec("ch2", "hinh-2-16", (1200, 650), render_mechanisms),
    GifSpec("ch2", "hinh-2-22", (950, 650), render_planar_body),
    GifSpec("ch2", "hinh-2-26", (950, 650), render_acceleration_center),
    GifSpec("ch2", "hinh-2-34", (1000, 700), render_crank_slider),
    GifSpec("ch3", "hinh-3-06", (1100, 620), render_bullet_cart),
    GifSpec("ch3", "hinh-3-10", (850, 700), render_impact),
    GifSpec("ch3", "hinh-3-11", (1200, 560), render_collision),
    GifSpec("ch3", "hinh-3-17", (900, 600), render_sliding_block),
    GifSpec("ch3", "hinh-3-20", (850, 760), render_movable_pulley),
    GifSpec("ch3", "hinh-3-21", (950, 620), render_moving_wedge),
    GifSpec("ch3", "hinh-3-22", (850, 760), render_motor),
]
EXPECTED_COUNTS = {"ch1": 6, "ch2": 7, "ch3": 7}
EXPECTED_TOTAL = 20


def shared_palette(frames: list[Image.Image]) -> Image.Image:
    thumb_width = min(160, frames[0].width)
    ratio = thumb_width / frames[0].width
    thumb_height = max(1, round(frames[0].height * ratio))
    columns = 10
    rows = math.ceil(len(frames) / columns)
    montage = Image.new("RGB", (thumb_width * columns, thumb_height * rows), "white")
    for frame_index, frame in enumerate(frames):
        thumb = frame.resize((thumb_width, thumb_height), Image.Resampling.LANCZOS)
        montage.paste(thumb, ((frame_index % columns) * thumb_width, (frame_index // columns) * thumb_height))
    return montage.quantize(colors=256, method=Image.Quantize.MEDIANCUT)


def save_gif(frames: list[Image.Image], output: Path) -> None:
    palette = shared_palette(frames)
    quantized = [frame.quantize(palette=palette, dither=Image.Dither.NONE) for frame in frames]
    output.parent.mkdir(parents=True, exist_ok=True)
    quantized[0].save(
        output,
        save_all=True,
        append_images=quantized[1:],
        duration=FRAME_DURATION_MS,
        loop=0,
        optimize=False,
        disposal=2,
    )


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def validate_manifest() -> set[Path]:
    keys = [(spec.chapter, spec.basename) for spec in SPECS]
    require(len(keys) == EXPECTED_TOTAL, f"manifest: {len(keys)} specs, expected {EXPECTED_TOTAL}")
    require(len(set(keys)) == EXPECTED_TOTAL, "manifest: duplicate chapter/basename")
    require(keys == sorted(keys), "manifest: specs must be sorted by chapter/basename")
    counts = {chapter: sum(spec.chapter == chapter for spec in SPECS) for chapter in EXPECTED_COUNTS}
    require(counts == EXPECTED_COUNTS, f"manifest: chapter counts={counts}")

    expected_sources = {
        ROOT / chapter / f"{basename}{suffix}"
        for chapter, basename in keys
        for suffix in (".png", ".txt")
    }
    actual_sources = {
        path
        for chapter in EXPECTED_COUNTS
        for path in (ROOT / chapter).iterdir()
        if path.is_file()
    }
    require(
        actual_sources == expected_sources,
        f"manifest: source set mismatch, missing={sorted(expected_sources - actual_sources)}, extra={sorted(actual_sources - expected_sources)}",
    )

    prompt_fragments = ("60 frame", "60 ms/frame", "3.600 ms", "loop=0", "12 mib", "55/59", "contact-sheet")
    expected_outputs: set[Path] = set()
    for spec in SPECS:
        source = ROOT / spec.chapter / f"{spec.basename}.png"
        prompt = ROOT / spec.chapter / f"{spec.basename}.txt"
        with Image.open(source) as image:
            require(image.format == "PNG", f"manifest: {source} format={image.format}")
            require(not bool(getattr(image, "is_animated", False)), f"manifest: animated source {source}")
            image.verify()
        with Image.open(source) as image:
            image.load()
            require(image.width > 0 and image.height > 0, f"manifest: empty source {source}")
        prompt_text = prompt.read_text(encoding="utf-8").lower()
        require(spec.basename in prompt_text, f"manifest: prompt does not name {spec.basename}")
        for fragment in prompt_fragments:
            require(fragment in prompt_text, f"manifest: {prompt} missing contract fragment {fragment!r}")
        expected_outputs.add(Path(spec.chapter) / f"{spec.basename}.gif")
    return expected_outputs


def verify_gif(
    path: Path,
    expected_size: tuple[int, int],
    rendered_frames: list[Image.Image],
    display_path: str,
) -> dict[str, object]:
    with Image.open(path) as image:
        require(image.format == "GIF", f"{path}: format={image.format}")
        require(bool(getattr(image, "is_animated", False)), f"{path}: not animated")
        require(image.n_frames == FRAME_COUNT, f"{path}: {image.n_frames} frames")
        durations: list[int] = []
        sizes: set[tuple[int, int]] = set()
        disposal_methods: set[int] = set()
        decoded_frames: list[Image.Image] = []
        motion_pairs = 0
        previous: Image.Image | None = None
        for frame_index in range(image.n_frames):
            image.seek(frame_index)
            durations.append(int(image.info.get("duration", 0)))
            sizes.add(image.size)
            disposal_methods.add(int(getattr(image, "disposal_method", -1)))
            current = image.convert("RGB").copy()
            decoded_frames.append(current)
            require(max(ImageStat.Stat(current).stddev) > 4, f"{path}: near-blank frame {frame_index}")
            fidelity = sum(ImageStat.Stat(ImageChops.difference(rendered_frames[frame_index], current)).mean) / 3
            require(fidelity < 8, f"{path}: frame {frame_index} palette/fidelity mean error={fidelity:.2f}")
            if previous is not None:
                difference = ImageChops.difference(previous, current).convert("L")
                require(difference.getbbox() is not None, f"{path}: duplicate adjacent frame {frame_index - 1}/{frame_index}")
                changed = sum(value > 12 for value in difference.getdata())
                if changed >= max(100, current.width * current.height // 3000):
                    motion_pairs += 1
            previous = current

        require(image.info.get("loop") == 0, f"{path}: loop={image.info.get('loop')}")
        require(sizes == {expected_size}, f"{path}: sizes={sizes}")
        require(disposal_methods == {2}, f"{path}: disposal={disposal_methods}")
        require(set(durations) == {FRAME_DURATION_MS}, f"{path}: frame durations={set(durations)}")
        require(sum(durations) == FRAME_COUNT * FRAME_DURATION_MS, f"{path}: duration={sum(durations)}")
        require(motion_pairs >= 55, f"{path}: only {motion_pairs}/59 moving frame pairs")
        seam_error = sum(ImageStat.Stat(ImageChops.difference(decoded_frames[-1], decoded_frames[0])).mean) / 3
        require(seam_error < 12, f"{path}: visible loop seam mean error={seam_error:.2f}")
        require(max(expected_size) <= MAX_EDGE, f"{path}: edge={max(expected_size)}")
        require(path.stat().st_size < MAX_BYTES, f"{path}: {path.stat().st_size} bytes")
        return {
            "path": display_path,
            "size": expected_size,
            "frames": image.n_frames,
            "duration_ms": sum(durations),
            "loop": image.info.get("loop"),
            "motion_pairs": motion_pairs,
            "seam_error": seam_error,
            "bytes": path.stat().st_size,
        }


def contact_sheet(encoded: list[tuple[GifSpec, Path]], output_root: Path) -> Path:
    tile_width = 240
    sample_indices = (0, FRAME_COUNT // 4, FRAME_COUNT // 2, 3 * FRAME_COUNT // 4)
    columns = len(sample_indices)
    label_height = 32
    rows: list[Image.Image] = []
    for spec, gif_path in encoded:
        ratio = tile_width / spec.size[0]
        tile_height = max(1, round(spec.size[1] * ratio))
        row = Image.new("RGB", (tile_width * columns, tile_height + label_height), (238, 243, 248))
        row_draw = ImageDraw.Draw(row)
        for column, frame_index in enumerate(sample_indices):
            with Image.open(gif_path) as image:
                image.seek(frame_index)
                tile = image.convert("RGB").resize((tile_width, tile_height), Image.Resampling.LANCZOS)
            row.paste(tile, (column * tile_width, label_height))
            row_draw.text(
                (column * tile_width + 8, label_height + 6),
                f"f{frame_index}",
                fill=NAVY[:3],
                font=ImageFont.load_default(),
            )
        row_draw.text((10, 8), f"{spec.chapter}/{spec.basename} · decoded GIF", fill=NAVY[:3], font=ImageFont.load_default())
        rows.append(row)
    sheet = Image.new("RGB", (tile_width * columns, sum(row.height for row in rows)), (238, 243, 248))
    y = 0
    for row in rows:
        sheet.paste(row, (0, y))
        y += row.height
    path = output_root / "contact-sheet.png"
    path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(path, format="PNG", optimize=True)
    with Image.open(path) as image:
        require(image.format == "PNG", f"{path}: contact sheet format={image.format}")
        image.verify()
    return path


def commit_output(stage: Path) -> None:
    backup = ROOT / ".output-backup"
    require(not backup.exists(), f"transaction: stale backup exists at {backup}")
    had_previous = OUTPUT_ROOT.exists()
    if had_previous:
        os.replace(OUTPUT_ROOT, backup)
    try:
        os.replace(stage, OUTPUT_ROOT)
    except BaseException:
        if had_previous and backup.exists():
            os.replace(backup, OUTPUT_ROOT)
        raise
    if had_previous:
        try:
            shutil.rmtree(backup)
        except OSError as error:
            raise RuntimeError(
                f"transaction: new output committed, but stale backup cleanup failed at {backup}"
            ) from error


def main() -> None:
    expected_outputs = validate_manifest()
    reports: list[dict[str, object]] = []
    with tempfile.TemporaryDirectory(prefix=".gif-build-", dir=ROOT) as temporary:
        stage = Path(temporary) / "output"
        encoded: list[tuple[GifSpec, Path]] = []
        for spec in SPECS:
            frames = [spec.renderer(index) for index in range(FRAME_COUNT)]
            relative_output = Path(spec.chapter) / f"{spec.basename}.gif"
            output = stage / relative_output
            save_gif(frames, output)
            reports.append(verify_gif(output, spec.size, frames, f"output/{relative_output.as_posix()}"))
            encoded.append((spec, output))
        sheet = contact_sheet(encoded, stage)
        expected_artifacts = expected_outputs | {Path("contact-sheet.png")}
        actual_artifacts = {path.relative_to(stage) for path in stage.rglob("*") if path.is_file()}
        require(
            actual_artifacts == expected_artifacts,
            f"output set mismatch: missing={sorted(expected_artifacts - actual_artifacts)}, extra={sorted(actual_artifacts - expected_artifacts)}",
        )
        commit_output(stage)
        sheet = OUTPUT_ROOT / "contact-sheet.png"

    for report in reports:
        mib = report["bytes"] / (1024 * 1024)  # type: ignore[operator]
        width, height = report["size"]  # type: ignore[misc]
        print(
            f"PASS {report['path']} | {width}x{height} | {report['frames']} frames | "
            f"{report['duration_ms']} ms | loop={report['loop']} | "
            f"motion={report['motion_pairs']}/59 | seam={report['seam_error']:.2f} | {mib:.2f} MiB"
        )
    print(f"PASS {len(reports)} GIFs | chapters={EXPECTED_COUNTS}")
    print(f"PASS {sheet.relative_to(ROOT).as_posix()}")


if __name__ == "__main__":
    main()
