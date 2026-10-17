"""Build matching-endpoint MP4 transitions from the supplied cafe photographs.

Requires Pillow and imageio-ffmpeg. This performs camera crops and dissolves;
it does not claim to reconstruct intermediate camera views using AI.
"""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path[:0] = [str(ROOT / '.tools/python'), str(ROOT / '.tools/video-python')]
from PIL import Image, ImageOps
import imageio_ffmpeg

FPS = 24
FRAMES = 73
SOURCES = ['sala-3.jpg', 'sala-completa.jpg', 'estanteria-top-sala.jpg',
           'ventana-poyete.jpg', 'sunset-apaisado.jpg']
OUT = ROOT / 'public/media/cafe'
OUT.mkdir(parents=True, exist_ok=True)
ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()

def smooth(value):
    value = max(0.0, min(1.0, value))
    return value * value * (3 - 2 * value)

def zoom(image, factor):
    width, height = image.size
    crop_width, crop_height = width / factor, height / factor
    return image.resize((width, height), Image.Resampling.BICUBIC,
                        box=((width-crop_width)/2, (height-crop_height)/2,
                             (width+crop_width)/2, (height+crop_height)/2))

manifest = {'fps': FPS, 'frames': FRAMES, 'method': 'camera crop and dissolve',
            'sources': SOURCES, 'clips': []}
for variant, size in [('desktop', (1920,1080)), ('mobile', (864,1536))]:
    anchors = [ImageOps.fit(Image.open(ROOT/'cafeteria-imgs'/name).convert('RGB'), size,
                           method=Image.Resampling.LANCZOS) for name in SOURCES]
    for index, image in enumerate(anchors):
        image.save(OUT/f'stop-{index}-{variant}.jpg', quality=96, subsampling=0)
    for index in range(len(anchors)-1):
        name = f'transition-{index+1:02d}-{variant}.mp4'
        args = [ffmpeg, '-y', '-loglevel', 'error', '-f', 'rawvideo', '-vcodec', 'rawvideo',
                '-pix_fmt', 'rgb24', '-s', f'{size[0]}x{size[1]}', '-r', str(FPS),
                '-i', 'pipe:0', '-an', '-c:v', 'libx264', '-preset', 'fast', '-qp', '23',
                '-g', '6', '-keyint_min', '6', '-sc_threshold', '0', '-bf', '0',
                '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
                str(OUT/name)]
        process = subprocess.Popen(args, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
        for frame in range(FRAMES):
            t = frame/(FRAMES-1)
            blend = smooth((t-.18)/.64)
            first = zoom(anchors[index], 1 + .035*smooth(t))
            last = zoom(anchors[index+1], 1 + .035*(1-smooth(t)))
            image = anchors[index] if frame == 0 else anchors[index+1] if frame == FRAMES-1 else Image.blend(first, last, blend)
            process.stdin.write(image.tobytes())
        process.stdin.close()
        errors = process.stderr.read().decode()
        if process.wait() != 0:
            raise RuntimeError(errors)
        # Compare decoded boundaries: adjacent clips must meet on the same frame.
        decoded = subprocess.check_output([ffmpeg, '-v', 'error', '-i', str(OUT/name),
                    '-vf', f'select=eq(n\\,0)+eq(n\\,{FRAMES-1})', '-vsync', '0',
                    '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'])
        frame_bytes = size[0]*size[1]*3
        assert len(decoded) == frame_bytes*2
        record = {'file':name,'variant':variant,'from':index,'to':index+1,
                  'firstHash':hashlib.sha256(decoded[:frame_bytes]).hexdigest(),
                  'lastHash':hashlib.sha256(decoded[frame_bytes:]).hexdigest()}
        previous = next((c for c in manifest['clips'] if c['variant']==variant and c['to']==index),None)
        if previous:
            assert previous['lastHash'] == record['firstHash'], f'Boundary mismatch: {name}'
        manifest['clips'].append(record)
        print(f'Rendered {name} ({(OUT/name).stat().st_size//1024} KB)',flush=True)

empty = next(p for p in (ROOT/'cafeteria-imgs').glob('estante-*.jpg') if not p.stem.endswith('-2'))
Image.open(empty).convert('RGB').save(OUT/'shelf-empty.jpg',quality=93)
(OUT/'route.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print('All adjacent decoded boundary frames match exactly.',flush=True)
