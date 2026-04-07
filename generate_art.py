"""
Generative Art NFT Generator
Inspired by Fidenza (flow fields), Ringers (geometric), Archetype (patterns)
"""
import numpy as np
from PIL import Image, ImageDraw
import os
import json
import random
import math

WIDTH, HEIGHT = 1200, 1200

# ─── Color Palettes ───
PALETTES = {
    "sunset":    ["#FF6B6B", "#FFA07A", "#FFD700", "#FF4500", "#8B0000"],
    "ocean":     ["#0077B6", "#00B4D8", "#90E0EF", "#CAF0F8", "#023E8A"],
    "forest":    ["#2D6A4F", "#40916C", "#52B788", "#74C69D", "#B7E4C7"],
    "neon":      ["#FF006E", "#8338EC", "#3A86FF", "#FFBE0B", "#FB5607"],
    "mono":      ["#F8F9FA", "#DEE2E6", "#ADB5BD", "#495057", "#212529"],
    "gold":      ["#FFD700", "#DAA520", "#B8860B", "#8B6914", "#FFFACD"],
    "cyber":     ["#0FF0FC", "#FF2079", "#440BD4", "#04005E", "#FCEE0C"],
    "earth":     ["#A68A64", "#936639", "#7F5539", "#B6AD90", "#582F0E"],
    "pastel":    ["#FFB5A7", "#FCD5CE", "#F8EDEB", "#F9DCC4", "#FEC89A"],
    "arctic":    ["#B8DBD9", "#586F7C", "#2F4550", "#F4F4F9", "#04724D"],
}

# ─── Noise (simplex-like via value noise + smoothing) ───
def generate_noise_grid(cols, rows, seed):
    rng = np.random.RandomState(seed)
    return rng.rand(rows, cols)

def interpolate_noise(grid, x, y):
    rows, cols = grid.shape
    x0 = int(x) % cols
    y0 = int(y) % rows
    x1 = (x0 + 1) % cols
    y1 = (y0 + 1) % rows
    fx = x - int(x)
    fy = y - int(y)
    # smoothstep
    fx = fx * fx * (3 - 2 * fx)
    fy = fy * fy * (3 - 2 * fy)
    top = grid[y0, x0] * (1 - fx) + grid[y0, x1] * fx
    bot = grid[y1, x0] * (1 - fx) + grid[y1, x1] * fx
    return top * (1 - fy) + bot * fy

def fractal_noise(x, y, grids, scale=0.02, octaves=4):
    val = 0
    amp = 1.0
    freq = scale
    for i in range(octaves):
        val += interpolate_noise(grids[i % len(grids)], x * freq, y * freq) * amp
        amp *= 0.5
        freq *= 2.0
    return val


# ═══════════════════════════════════════════
# Style 1: Flow Field (Fidenza-inspired)
# ═══════════════════════════════════════════
def draw_flow_field(seed):
    rng = random.Random(seed)
    np_rng = np.random.RandomState(seed)

    palette_name = rng.choice(list(PALETTES.keys()))
    colors = PALETTES[palette_name]
    bg_dark = rng.random() > 0.5
    bg_color = "#0D1117" if bg_dark else "#F5F0E8"

    img = Image.new("RGB", (WIDTH, HEIGHT), bg_color)
    draw = ImageDraw.Draw(img)

    # noise grids
    grids = [generate_noise_grid(64, 64, seed + i) for i in range(6)]
    noise_scale = rng.uniform(0.008, 0.025)
    num_lines = rng.randint(300, 800)
    line_length = rng.randint(40, 150)
    stroke_width = rng.choice([1, 2, 3, 4, 5, 6])
    curve_strength = rng.uniform(2.0, 6.0)

    for _ in range(num_lines):
        x = rng.uniform(0, WIDTH)
        y = rng.uniform(0, HEIGHT)
        color = rng.choice(colors)
        points = []

        for step in range(line_length):
            points.append((x, y))
            angle = fractal_noise(x, y, grids, scale=noise_scale) * math.pi * curve_strength
            x += math.cos(angle) * 3
            y += math.sin(angle) * 3
            if x < -50 or x > WIDTH + 50 or y < -50 or y > HEIGHT + 50:
                break

        if len(points) > 2:
            draw.line(points, fill=color, width=stroke_width)

    attrs = {
        "style": "Flow Field",
        "palette": palette_name,
        "background": "dark" if bg_dark else "light",
        "density": "high" if num_lines > 550 else "medium" if num_lines > 400 else "low",
        "stroke": stroke_width,
    }
    return img, attrs


# ═══════════════════════════════════════════
# Style 2: Geometric Grid (Archetype-inspired)
# ═══════════════════════════════════════════
def draw_geometric(seed):
    rng = random.Random(seed)

    palette_name = rng.choice(list(PALETTES.keys()))
    colors = PALETTES[palette_name]
    bg_dark = rng.random() > 0.4
    bg_color = "#0D1117" if bg_dark else "#F5F0E8"

    img = Image.new("RGB", (WIDTH, HEIGHT), bg_color)
    draw = ImageDraw.Draw(img)

    grid_size = rng.choice([4, 5, 6, 8, 10])
    cell = WIDTH // grid_size
    margin = cell // 8
    shape_type = rng.choice(["mixed", "circles", "rectangles", "triangles"])

    for row in range(grid_size):
        for col in range(grid_size):
            cx = col * cell + cell // 2
            cy = row * cell + cell // 2
            color = rng.choice(colors)
            shape = shape_type if shape_type != "mixed" else rng.choice(["circle", "rect", "tri", "diamond"])

            size = rng.uniform(0.3, 0.9) * (cell // 2 - margin)
            rotation = rng.uniform(0, math.pi * 2)
            filled = rng.random() > 0.3

            if shape in ("circles", "circle"):
                r = int(size)
                if filled:
                    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)
                else:
                    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color, width=3)

            elif shape in ("rectangles", "rect"):
                half = int(size)
                # rotated rectangle via polygon
                corners = []
                for angle in [rotation + i * math.pi / 2 for i in range(4)]:
                    corners.append((cx + math.cos(angle) * half, cy + math.sin(angle) * half))
                if filled:
                    draw.polygon(corners, fill=color)
                else:
                    draw.polygon(corners, outline=color)

            elif shape in ("triangles", "tri"):
                pts = []
                for i in range(3):
                    angle = rotation + i * 2 * math.pi / 3
                    pts.append((cx + math.cos(angle) * size, cy + math.sin(angle) * size))
                if filled:
                    draw.polygon(pts, fill=color)
                else:
                    draw.polygon(pts, outline=color)

            elif shape == "diamond":
                half = int(size)
                pts = [(cx, cy - half), (cx + half, cy), (cx, cy + half), (cx - half, cy)]
                if filled:
                    draw.polygon(pts, fill=color)
                else:
                    draw.polygon(pts, outline=color)

    attrs = {
        "style": "Geometric",
        "palette": palette_name,
        "background": "dark" if bg_dark else "light",
        "grid": f"{grid_size}x{grid_size}",
        "shapes": shape_type,
    }
    return img, attrs


# ═══════════════════════════════════════════
# Style 3: Concentric Rings (Ringers-inspired)
# ═══════════════════════════════════════════
def draw_rings(seed):
    rng = random.Random(seed)

    palette_name = rng.choice(list(PALETTES.keys()))
    colors = PALETTES[palette_name]
    bg_dark = rng.random() > 0.4
    bg_color = "#0D1117" if bg_dark else "#F5F0E8"

    img = Image.new("RGB", (WIDTH, HEIGHT), bg_color)
    draw = ImageDraw.Draw(img)

    num_centers = rng.randint(1, 5)
    ring_style = rng.choice(["concentric", "spiral", "broken"])

    for _ in range(num_centers):
        cx = rng.randint(WIDTH // 6, 5 * WIDTH // 6)
        cy = rng.randint(HEIGHT // 6, 5 * HEIGHT // 6)
        num_rings = rng.randint(8, 30)
        max_radius = rng.randint(200, 550)
        ring_width = rng.choice([2, 3, 4, 6, 8])

        for i in range(num_rings):
            r = int((i + 1) / num_rings * max_radius)
            color = colors[i % len(colors)]

            if ring_style == "concentric":
                draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color, width=ring_width)
            elif ring_style == "spiral":
                points = []
                for t in range(360):
                    angle = math.radians(t + i * 30)
                    sr = r + t * 0.3
                    px = cx + math.cos(angle) * sr
                    py = cy + math.sin(angle) * sr
                    points.append((px, py))
                if len(points) > 2:
                    draw.line(points, fill=color, width=ring_width)
            elif ring_style == "broken":
                start_angle = rng.randint(0, 180)
                end_angle = start_angle + rng.randint(90, 300)
                draw.arc([cx - r, cy - r, cx + r, cy + r], start_angle, end_angle, fill=color, width=ring_width)

    # scatter dots
    for _ in range(rng.randint(20, 100)):
        x = rng.randint(0, WIDTH)
        y = rng.randint(0, HEIGHT)
        r = rng.randint(2, 8)
        color = rng.choice(colors)
        draw.ellipse([x - r, y - r, x + r, y + r], fill=color)

    attrs = {
        "style": "Rings",
        "palette": palette_name,
        "background": "dark" if bg_dark else "light",
        "centers": num_centers,
        "ring_style": ring_style,
    }
    return img, attrs


# ═══════════════════════════════════════════
# Style 4: Particle Explosion
# ═══════════════════════════════════════════
def draw_particles(seed):
    rng = random.Random(seed)
    np_rng = np.random.RandomState(seed)

    palette_name = rng.choice(list(PALETTES.keys()))
    colors = PALETTES[palette_name]
    bg_color = "#0D1117"

    img = Image.new("RGB", (WIDTH, HEIGHT), bg_color)
    draw = ImageDraw.Draw(img)

    cx, cy = WIDTH // 2, HEIGHT // 2
    num_particles = rng.randint(500, 2000)
    pattern = rng.choice(["radial", "vortex", "grid_scatter"])

    for _ in range(num_particles):
        color = rng.choice(colors)

        if pattern == "radial":
            angle = rng.uniform(0, 2 * math.pi)
            dist = rng.gauss(0, WIDTH // 4)
            x = cx + math.cos(angle) * dist
            y = cy + math.sin(angle) * dist
        elif pattern == "vortex":
            t = rng.uniform(0, 8 * math.pi)
            r = t * 20 + rng.gauss(0, 30)
            x = cx + math.cos(t) * r
            y = cy + math.sin(t) * r
        else:
            x = rng.gauss(cx, WIDTH // 3)
            y = rng.gauss(cy, HEIGHT // 3)

        size = rng.randint(1, 6)
        draw.ellipse([x - size, y - size, x + size, y + size], fill=color)

    # connecting lines (sparse)
    if rng.random() > 0.5:
        for _ in range(rng.randint(10, 50)):
            x1 = rng.randint(0, WIDTH)
            y1 = rng.randint(0, HEIGHT)
            angle = rng.uniform(0, 2 * math.pi)
            length = rng.randint(50, 300)
            x2 = x1 + math.cos(angle) * length
            y2 = y1 + math.sin(angle) * length
            color = rng.choice(colors)
            draw.line([(x1, y1), (x2, y2)], fill=color, width=1)

    attrs = {
        "style": "Particles",
        "palette": palette_name,
        "background": "dark",
        "density": "high" if num_particles > 1200 else "medium" if num_particles > 700 else "low",
        "pattern": pattern,
    }
    return img, attrs


# ═══════════════════════════════════════════
# Main: Generate test samples
# ═══════════════════════════════════════════
STYLES = [draw_flow_field, draw_geometric, draw_rings, draw_particles]
STYLE_NAMES = ["flow", "geo", "rings", "particles"]

def generate(count=8, output_dir="./nft_output"):
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(f"{output_dir}/images", exist_ok=True)
    os.makedirs(f"{output_dir}/metadata", exist_ok=True)

    all_metadata = []

    for i in range(count):
        seed = random.randint(0, 999999)
        style_idx = random.randint(0, len(STYLES) - 1)
        style_fn = STYLES[style_idx]

        img, attrs = style_fn(seed)
        img.save(f"{output_dir}/images/{i+1}.png")

        metadata = {
            "name": f"YBS #{i+1}",
            "description": "Yonsei Blockchain Society - Generative Art Collection",
            "image": f"{i+1}.png",
            "attributes": [{"trait_type": k, "value": v} for k, v in attrs.items()],
            "seed": seed,
        }
        with open(f"{output_dir}/metadata/{i+1}.json", "w") as f:
            json.dump(metadata, f, indent=2)

        all_metadata.append(metadata)
        print(f"  [{i+1}/{count}] {STYLE_NAMES[style_idx]} | seed={seed} | {attrs.get('palette', '')}")

    print(f"\nDone! {count} NFTs saved to {output_dir}/")
    return all_metadata


if __name__ == "__main__":
    generate(count=8)
