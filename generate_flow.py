"""
Flow Field NFT Generator - Rarity-based variations
Common(70%): thin lines, muted colors, low density
Rare(20%): medium lines, vibrant colors, medium density
Epic(8%): thick lines, neon palette, high density + glow effect
Legendary(2%): multi-layer, gold/cyber palette, max density + particles
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import os, json, random, math

WIDTH, HEIGHT = 1200, 1200

PALETTES = {
    # Common palettes (muted)
    "slate":     ["#64748B", "#94A3B8", "#475569", "#334155", "#CBD5E1"],
    "stone":     ["#78716C", "#A8A29E", "#57534E", "#44403C", "#D6D3D1"],
    "sage":      ["#6B7F6B", "#8FA38F", "#4A5D4A", "#3B4D3B", "#A8C5A8"],
    "dust":      ["#9B8B7A", "#B8A898", "#7D6B5D", "#5C4F42", "#D4C4B0"],
    # Rare palettes (vibrant)
    "ocean":     ["#0077B6", "#00B4D8", "#90E0EF", "#CAF0F8", "#023E8A"],
    "forest":    ["#2D6A4F", "#40916C", "#52B788", "#74C69D", "#B7E4C7"],
    "sunset":    ["#FF6B6B", "#FFA07A", "#FFD700", "#FF4500", "#C41E3A"],
    # Epic palettes (neon)
    "neon":      ["#FF006E", "#8338EC", "#3A86FF", "#FFBE0B", "#FB5607"],
    "cyber":     ["#0FF0FC", "#FF2079", "#440BD4", "#04005E", "#FCEE0C"],
    # Legendary palettes
    "gold":      ["#FFD700", "#DAA520", "#FFF8DC", "#B8860B", "#FFFACD"],
    "aurora":    ["#00F0FF", "#d575ff", "#ffd709", "#FF006E", "#3A86FF"],
}

RARITY_CONFIG = {
    "Common":    {"palettes": ["slate", "stone", "sage", "dust"], "lines": (200, 400), "stroke": (1, 2), "length": (30, 60), "glow": False},
    "Rare":      {"palettes": ["ocean", "forest", "sunset"],     "lines": (400, 700), "stroke": (2, 4), "length": (50, 100), "glow": False},
    "Epic":      {"palettes": ["neon", "cyber"],                  "lines": (600, 1000), "stroke": (3, 6), "length": (80, 150), "glow": True},
    "Legendary": {"palettes": ["gold", "aurora"],                 "lines": (800, 1500), "stroke": (4, 8), "length": (100, 200), "glow": True},
}

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

def hex_to_rgba(hex_color, alpha=255):
    h = hex_color.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4)) + (alpha,)

def draw_flow_field(seed, rarity="Common"):
    rng = random.Random(seed)
    cfg = RARITY_CONFIG[rarity]

    palette_name = rng.choice(cfg["palettes"])
    colors = PALETTES[palette_name]
    bg_color = "#0e0e13"

    img = Image.new("RGBA", (WIDTH, HEIGHT), bg_color)
    draw = ImageDraw.Draw(img)

    grids = [generate_noise_grid(64, 64, seed + i) for i in range(6)]
    noise_scale = rng.uniform(0.008, 0.022)
    num_lines = rng.randint(*cfg["lines"])
    line_length = rng.randint(*cfg["length"])
    stroke_width = rng.randint(*cfg["stroke"])
    curve_strength = rng.uniform(2.5, 5.5)

    # Legendary: add secondary flow layer
    layers = 2 if rarity == "Legendary" else 1

    for layer in range(layers):
        layer_grids = [generate_noise_grid(64, 64, seed + 100 * layer + i) for i in range(6)]
        layer_scale = noise_scale * (1.5 if layer == 1 else 1.0)

        for _ in range(num_lines // layers):
            x = rng.uniform(-50, WIDTH + 50)
            y = rng.uniform(-50, HEIGHT + 50)
            color = rng.choice(colors)

            # Alpha varies by rarity
            if rarity == "Common":
                alpha = rng.randint(80, 180)
            elif rarity == "Rare":
                alpha = rng.randint(120, 220)
            else:
                alpha = rng.randint(180, 255)

            rgba = hex_to_rgba(color, alpha)
            points = []

            for step in range(line_length):
                points.append((x, y))
                angle = fractal_noise(x, y, layer_grids, scale=layer_scale) * math.pi * curve_strength
                speed = 2.5 + (step * 0.02 if rarity in ("Epic", "Legendary") else 0)
                x += math.cos(angle) * speed
                y += math.sin(angle) * speed
                if x < -100 or x > WIDTH + 100 or y < -100 or y > HEIGHT + 100:
                    break

            if len(points) > 2:
                draw.line(points, fill=rgba, width=stroke_width)

    # Epic/Legendary: glow effect
    if cfg["glow"]:
        glow = img.filter(ImageFilter.GaussianBlur(radius=8))
        img = Image.alpha_composite(img, glow)
        # Re-draw sharper lines on top
        draw2 = ImageDraw.Draw(img)
        accent = rng.choice(colors)
        for _ in range(num_lines // 5):
            x = rng.uniform(0, WIDTH)
            y = rng.uniform(0, HEIGHT)
            points = []
            for step in range(line_length // 2):
                points.append((x, y))
                angle = fractal_noise(x, y, grids, scale=noise_scale * 1.2) * math.pi * curve_strength
                x += math.cos(angle) * 3
                y += math.sin(angle) * 3
                if x < -50 or x > WIDTH + 50 or y < -50 or y > HEIGHT + 50:
                    break
            if len(points) > 2:
                draw2.line(points, fill=hex_to_rgba(accent, 255), width=max(1, stroke_width - 1))

    # Legendary: scatter bright particles
    if rarity == "Legendary":
        draw_final = ImageDraw.Draw(img)
        for _ in range(rng.randint(100, 300)):
            px = rng.randint(0, WIDTH)
            py = rng.randint(0, HEIGHT)
            pr = rng.randint(1, 4)
            pc = hex_to_rgba(rng.choice(colors), rng.randint(150, 255))
            draw_final.ellipse([px-pr, py-pr, px+pr, py+pr], fill=pc)

    final = img.convert("RGB")

    attrs = {
        "rarity": rarity,
        "palette": palette_name,
        "density": num_lines,
        "stroke": stroke_width,
        "curve": round(curve_strength, 2),
    }
    return final, attrs


def generate(count=10):
    output_dir = "./nft_output"
    os.makedirs(f"{output_dir}/images", exist_ok=True)
    os.makedirs(f"{output_dir}/metadata", exist_ok=True)

    # Rarity distribution for count items
    # Common 70%, Rare 20%, Epic 8%, Legendary 2%
    rarities = []
    for i in range(count):
        roll = random.random()
        if roll < 0.02:
            rarities.append("Legendary")
        elif roll < 0.10:
            rarities.append("Epic")
        elif roll < 0.30:
            rarities.append("Rare")
        else:
            rarities.append("Common")

    # Ensure at least some variety for small batches
    if count >= 10:
        rarity_counts = {r: rarities.count(r) for r in ["Common", "Rare", "Epic", "Legendary"]}
        if rarity_counts["Rare"] == 0:
            rarities[rng_idx := random.randint(0, count-1)] = "Rare"
        if rarity_counts["Epic"] == 0 and count >= 8:
            idx = random.randint(0, count-1)
            while rarities[idx] != "Common":
                idx = random.randint(0, count-1)
            rarities[idx] = "Epic"

    random.shuffle(rarities)

    print(f"Rarity distribution: {', '.join(f'{r}: {rarities.count(r)}' for r in ['Common','Rare','Epic','Legendary'])}")
    print()

    for i in range(count):
        seed = random.randint(0, 999999)
        rarity = rarities[i]
        img, attrs = draw_flow_field(seed, rarity)

        img.save(f"{output_dir}/images/{i+1}.png")

        metadata = {
            "name": f"YBS #{i+1}",
            "description": "Yonsei Blockchain Society - Generative Flow Field Collection",
            "image": f"{i+1}.png",
            "attributes": [{"trait_type": k, "value": v} for k, v in attrs.items()],
            "seed": seed,
        }
        with open(f"{output_dir}/metadata/{i+1}.json", "w") as f:
            json.dump(metadata, f, indent=2)

        icon = {"Common": "⬜", "Rare": "🟦", "Epic": "🟪", "Legendary": "🟨"}[rarity]
        print(f"  {icon} [{i+1}/{count}] {rarity:10s} | {attrs['palette']:8s} | density={attrs['density']} stroke={attrs['stroke']}")

    print(f"\nDone! {output_dir}/images/")


if __name__ == "__main__":
    generate(10)
