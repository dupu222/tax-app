#!/usr/bin/env python3
"""Copy curated assets from the gitignored .resources iOS payload into the web app."""

from __future__ import annotations

import shutil
import struct
import subprocess
import zlib
from pathlib import Path

ROOT = Path("/Users/dupu/projects/tax-app")
SRC = ROOT / ".resources/Payload/itis.app"
IMG = SRC / "www/static/images"
SEED = ROOT / "public/seed"
LIB = SEED / "library"


def chunk(tag: bytes, data: bytes) -> bytes:
    crc = zlib.crc32(tag + data) & 0xFFFFFFFF
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", crc)


def write_png_rgba(path: Path, width: int, height: int, rgba: bytes) -> None:
    raw = bytearray()
    stride = width * 4
    for y in range(height):
        raw.append(0)
        raw.extend(rgba[y * stride : (y + 1) * stride])
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )


def write_ico_from_png(png_bytes: bytes, dest: Path) -> None:
    header = struct.pack("<HHH", 0, 1, 1)
    entry = struct.pack("<BBBBHHII", 32, 32, 0, 0, 1, 32, len(png_bytes), 22)
    dest.write_bytes(header + entry + png_bytes)


def decode_png(path: Path):
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"not a PNG: {path}")
    pos = 8
    width = height = bit = color = None
    palette = None
    trns = b""
    idat = b""
    while pos < len(data):
        length = struct.unpack(">I", data[pos : pos + 4])[0]
        typ = data[pos + 4 : pos + 8]
        payload = data[pos + 8 : pos + 8 + length]
        if typ == b"IHDR":
            width, height, bit, color = struct.unpack(">IIBB", payload[:10])
        elif typ == b"PLTE":
            palette = payload
        elif typ == b"tRNS":
            trns = payload
        elif typ == b"IDAT":
            idat += payload
        elif typ == b"IEND":
            break
        pos += 12 + length
    raw = zlib.decompress(idat)
    if color == 6:
        bpp = 4
    elif color == 2:
        bpp = 3
    elif color == 3:
        bpp = 1
    else:
        raise ValueError(f"unsupported color type {color} in {path}")
    rows = []
    prev = bytearray(width * bpp)
    i = 0
    for _y in range(height):
        flt = raw[i]
        i += 1
        row = bytearray(raw[i : i + width * bpp])
        i += width * bpp

        def paeth(a, b, c):
            p = a + b - c
            pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
            if pa <= pb and pa <= pc:
                return a
            if pb <= pc:
                return b
            return c

        if flt == 1:
            for x in range(len(row)):
                a = row[x - bpp] if x >= bpp else 0
                row[x] = (row[x] + a) & 255
        elif flt == 2:
            for x in range(len(row)):
                row[x] = (row[x] + prev[x]) & 255
        elif flt == 3:
            for x in range(len(row)):
                a = row[x - bpp] if x >= bpp else 0
                row[x] = (row[x] + ((a + prev[x]) // 2)) & 255
        elif flt == 4:
            for x in range(len(row)):
                a = row[x - bpp] if x >= bpp else 0
                b = prev[x]
                c = prev[x - bpp] if x >= bpp else 0
                row[x] = (row[x] + paeth(a, b, c)) & 255
        elif flt != 0:
            raise ValueError(f"filter {flt}")
        rows.append(row)
        prev = row

    rgba = bytearray(width * height * 4)
    if color == 6:
        for y, row in enumerate(rows):
            rgba[y * width * 4 : (y + 1) * width * 4] = row
    elif color == 2:
        for y, row in enumerate(rows):
            for x in range(width):
                o = (y * width + x) * 4
                s = x * 3
                rgba[o : o + 4] = bytes((row[s], row[s + 1], row[s + 2], 255))
    else:
        for y, row in enumerate(rows):
            for x in range(width):
                idx = row[x]
                r, g, b = palette[idx * 3 : idx * 3 + 3]
                a = trns[idx] if idx < len(trns) else 255
                o = (y * width + x) * 4
                rgba[o : o + 4] = bytes((r, g, b, a))
    return width, height, bytes(rgba)


def copy_file(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)


def crop_rgba(width, height, rgba, x0, y0, x1, y1) -> tuple[int, int, bytes]:
    x0, y0 = max(0, x0), max(0, y0)
    x1, y1 = min(width, x1), min(height, y1)
    cw, ch = x1 - x0, y1 - y0
    out = bytearray(cw * ch * 4)
    for y in range(ch):
        src = ((y0 + y) * width + x0) * 4
        dst = y * cw * 4
        out[dst : dst + cw * 4] = rgba[src : src + cw * 4]
    return cw, ch, bytes(out)


def pad_square(width, height, rgba, size=None) -> tuple[int, int, bytes]:
    size = size or max(width, height)
    out = bytearray(size * size * 4)
    ox = (size - width) // 2
    oy = (size - height) // 2
    for y in range(height):
        src = y * width * 4
        dst = ((oy + y) * size + ox) * 4
        out[dst : dst + width * 4] = rgba[src : src + width * 4]
    return size, size, bytes(out)


def extract_icon_all():
    path = IMG / "icon-all.747718b.png"
    width, height, rgba = decode_png(path)
    pixels = memoryview(rgba)

    def row_has(y: int) -> bool:
        start = y * width * 4
        for x in range(0, width, 2):
            if pixels[start + x * 4 + 3] > 12:
                return True
        return False

    bands = []
    inside = False
    for y in range(height):
        has = row_has(y)
        if has and not inside:
            start = y
            inside = True
        elif not has and inside:
            bands.append((start, y))
            inside = False
    if inside:
        bands.append((start, height))

    out_dir = LIB / "grid"
    if out_dir.exists():
        shutil.rmtree(out_dir)
    mapping = {}
    for ri, (y0, y1) in enumerate(bands):

        def col_has(x: int) -> bool:
            for y in range(y0, y1, 2):
                if pixels[(y * width + x) * 4 + 3] > 12:
                    return True
            return False

        xs = []
        inside_x = False
        for x in range(width):
            has = col_has(x)
            if has and not inside_x:
                sx = x
                inside_x = True
            elif not has and inside_x:
                xs.append((sx, x))
                inside_x = False
        if inside_x:
            xs.append((sx, width))
        for ci, (x0, x1) in enumerate(xs):
            pad = 8
            cw, ch, crop = crop_rgba(width, height, rgba, x0 - pad, y0 - pad, x1 + pad, y1 + pad)
            size, size, square = pad_square(cw, ch, crop)
            name = f"r{ri}c{ci}.png"
            write_png_rgba(out_dir / name, size, size, square)
            mapping[(ri, ci)] = out_dir / name
    return mapping


def sips_resize(src: Path, dest: Path, width: int, height: int) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    subprocess.check_call(
        ["sips", "-s", "format", "png", "-z", str(height), str(width), str(src), "--out", str(dest)],
        stdout=subprocess.DEVNULL,
    )


def main() -> None:
    SEED.mkdir(parents=True, exist_ok=True)
    LIB.mkdir(parents=True, exist_ok=True)

    copies = {
        "banner1@3x.406737e.png": SEED / "banner-1.png",
        "banner2@3x.06d7e90.png": SEED / "banner-2.png",
        "banner3@3x.810b688.png": SEED / "banner-3.png",
        "home_zty_bg.4fc7471.png": SEED / "topic.png",
        "home_tax_icon@3x.464031e.png": SEED / "icon-tax.png",
        "home_query_icon@3x.bca0a2d.png": SEED / "icon-search.png",
        "home_service_icon@3x.9530048.png": SEED / "icon-public.png",
        "home_feature_icon@3x.f2aed8c.png": SEED / "icon-feature.png",
        "0301-sbcx.eb15e9e.png": SEED / "icon-sbcx.png",
        "0302-srnsmxcx.4215d21.png": SEED / "icon-srns.png",
        "0307-yyclcx.b21d0db.png": SEED / "icon-yycl.png",
        "0308-swwscx.dc165fd.png": SEED / "icon-swws.png",
        "0102-xxzx.d94eb38.png": SEED / "icon-message.png",
        "0203-gzsbhzf.2c2bd80.png": SEED / "icon-gzsb.png",
        "040102-kxssyh.11ba572.png": SEED / "icon-ssyh.png",
        "0414-wyzx.60a67ac.png": SEED / "icon-wyzx.png",
        "icon-jtcy.e627c6d.png": SEED / "icon-family.png",
        "icon-rzsg.4caf706.png": SEED / "icon-company.png",
        "hssb.811b584.png": SEED / "icon-ndhs.png",
        "default-icon.8cb9b28.png": SEED / "icon-default.png",
        "man-head.8eca80e.png": SEED / "avatar-demo.png",
        "baxx-ssyh.4860cbb.png": SEED / "icon-ssyh-ba.png",
        "geshuiicon.5a618ec.svg": SEED / "brand-geshui.svg",
    }
    for src_name, dest in copies.items():
        copy_file(IMG / src_name, dest)

    library_copies = {
        "banner4@3x.b2f8500.png": LIB / "banner/banner-4.png",
        "zhuantibanner@2x.26a01d6.png": LIB / "banner/topic-declare.png",
        "zhsdndshb-banner.8efb914.svg": LIB / "banner/annual-declare.svg",
        "home_zty_entrance_2023.dde72d8.png": LIB / "banner/topic-enter.png",
        "home_zty_bg_2022.87773e6.png": LIB / "banner/topic-2022.png",
        "city_service_default_banner.8488330.png": LIB / "banner/city-service.png",
        "manage-banner.8848c1b.png": LIB / "banner/manage.png",
        "zxfjkc@3x.32132ef.png": LIB / "banner/special-deduction.png",
        "baxx-ssyh.4860cbb.png": LIB / "icon/filing-prefer.png",
        "baxx-tstz.d9d3dab.png": LIB / "icon/filing-angel.png",
        "baxx-fhb.b830484.png": LIB / "icon/filing-asset.png",
        "wybz@3x.6033275.png": LIB / "icon/handle-tax-large.png",
        "wybzsmall@3x.c023603.png": LIB / "icon/handle-tax-wide.png",
        "woman-head.69a4530.png": LIB / "avatar/woman.png",
        "geshui-avatar.8a1837b.png": LIB / "avatar/geshui.png",
        "real-auth.ddd8125.png": LIB / "illustration/real-auth.png",
        "list-empty.6b793b2.png": LIB / "empty/list-empty.png",
        "no-msg.ff6ac28.png": LIB / "empty/no-msg.png",
        "entrust-list-empty.cd74e43.png": LIB / "empty/entrust.png",
        "noPerson.543301d.svg": LIB / "empty/no-person.svg",
        "noChild.a887955.svg": LIB / "empty/no-child.svg",
        "noSpouse.82fabc2.svg": LIB / "empty/no-spouse.svg",
        "noOlder.e49c24a.svg": LIB / "empty/no-older.svg",
        "no-shuishouyouhui.f523628.svg": LIB / "empty/no-tax-prefer.svg",
        "newNoRecordImg.b99e2d3.svg": LIB / "empty/no-record.svg",
        "nopaint.a3ece60.svg": LIB / "empty/no-paint.svg",
        "bszn-znz.21f361f.png": LIB / "public/guide.png",
        "ynftzgg@3x.7dabce1.png": LIB / "public/notice.png",
        "ynfsszcyjd@3x.7475ffb.png": LIB / "public/policy.png",
        "tzgg1.f793c76.png": LIB / "public/notice-card-1.png",
        "zcjd1.91e86d3.png": LIB / "public/policy-card-1.png",
        "rdwt1.d7f21b6.png": LIB / "public/hot-card-1.png",
        "logo@3x.90128d2.png": LIB / "brand/china-tax.png",
        "logo.55fdc2d.png": LIB / "brand/interaction.png",
        "icon-all.747718b.png": LIB / "grid/icon-all.png",
        "welcome-1.76a758d.png": LIB / "guide/welcome-1.png",
        "welcome-2.7aafc0a.png": LIB / "guide/welcome-2.png",
        "welcome-3.089da6a.png": LIB / "guide/welcome-3.png",
        "tabbar-home-gq.cc7e3c9.png": LIB / "tabbar/home-festival.png",
        "tabbar-tax-gq.e4f1cb8.png": LIB / "tabbar/tax-festival.png",
        "tabbar-doing-gq.3412c11.png": LIB / "tabbar/doing-festival.png",
        "tabbar-user-gq.6354e4e.png": LIB / "tabbar/user-festival.png",
        "tabbar-message-gq.fda0e3f.png": LIB / "tabbar/message-festival.png",
    }
    for src_name, dest in library_copies.items():
        copy_file(IMG / src_name, dest)

    fonts = SRC / "www/static/fonts"
    for font in fonts.iterdir():
        copy_file(font, LIB / "fonts" / font.name)

    for launch in SRC.glob("LaunchImage*.png"):
        copy_file(launch, LIB / "launch" / launch.name)
    for icon in SRC.glob("AppIcon*.png"):
        copy_file(icon, LIB / "appicon" / icon.name)
    copy_file(SRC / "appLogo@3x.png", LIB / "brand/app-logo.png")

    grid = extract_icon_all()
    grid_aliases = {
        (4, 8): SEED / "icon-user.png",
        (5, 1): SEED / "icon-card.png",
        (3, 6): SEED / "icon-auth.png",
        (5, 5): SEED / "icon-nsjl.png",
        (0, 6): SEED / "icon-wszm.png",
        (0, 1): SEED / "icon-zxfj.png",
        (0, 0): SEED / "icon-calc.png",
        (2, 0): SEED / "icon-bell.png",
        (1, 6): SEED / "icon-family-grid.png",
        (6, 3): SEED / "icon-profile.png",
        (1, 4): SEED / "icon-tstz.png",
        (0, 4): SEED / "icon-fhb.png",
    }
    for key, dest in grid_aliases.items():
        src = grid.get(key)
        if src is None:
            raise SystemExit(f"missing grid cell {key}")
        copy_file(src, dest)

    copy_file(SEED / "avatar-demo.png", ROOT / "src/assets/my/user.png")
    copy_file(IMG / "logo@3x.90128d2.png", ROOT / "src/assets/home/logo.png")
    copy_file(IMG / "list-empty.6b793b2.png", ROOT / "src/assets/service/empty-closed.png")
    copy_file(IMG / "noPerson.543301d.svg", ROOT / "src/assets/my/family-empty.svg")
    copy_file(IMG / "no-msg.ff6ac28.png", ROOT / "src/assets/service/empty-message.png")

    app_icon_src = SRC / "AppIcon76x76@2x~ipad.png"
    tmp_icon = LIB / "appicon/appicon-standard.png"
    sips_resize(app_icon_src, tmp_icon, 152, 152)
    sips_resize(tmp_icon, ROOT / "public/icon.png", 192, 192)
    sips_resize(tmp_icon, ROOT / "public/apple-touch-icon.png", 180, 180)
    fav_png = LIB / "appicon/favicon-32.png"
    sips_resize(tmp_icon, fav_png, 32, 32)
    write_ico_from_png(fav_png.read_bytes(), ROOT / "public/favicon.ico")
    copy_file(SRC / "LaunchImage-800-Portrait-736h@3x.png", ROOT / "public/launch.png")

    for old in SEED.glob("*.svg"):
        if old.name == "brand-geshui.svg":
            continue
        old.unlink()

    print("imported seed files:")
    for p in sorted(SEED.glob("*")):
        if p.is_file():
            print(" ", p.name, p.stat().st_size)


if __name__ == "__main__":
    main()
