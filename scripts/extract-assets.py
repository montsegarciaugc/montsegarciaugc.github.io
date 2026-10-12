import sys
from pathlib import Path
sys.path.insert(0, str(Path('.tools/python').resolve()))
import pymupdf as fitz
from PIL import Image
import io

doc = fitz.open('external-assets/MONTSERRAT.pdf')
out = Path('public/media')
out.mkdir(parents=True, exist_ok=True)
images = {'background':32, 'heart':34, 'logo':38, 'about-photo':48, 'flowers':49,
          'perfume-poster':539, 'niche-beauty':70, 'niche-travel':71, 'niche-coffee':72,
          'niche-car':73, 'niche-fashion':74, 'niche-food':75, 'niche-tech':76,
          'niche-lifestyle':77, 'process':99, 'sample-beauty':105, 'sample-coffee':108,
          'sample-food':111, 'sample-fashion':114, 'beauty':149, 'phone':167,
          'brand':174, 'contact':197, 'thanks':207}
for name, xref in images.items():
    pix = fitz.Pixmap(doc, xref)
    mask = doc.extract_image(xref).get('smask', 0)
    if mask:
        pix = fitz.Pixmap(pix, fitz.Pixmap(doc, mask))
    im = Image.open(io.BytesIO(pix.tobytes('png')))
    if name == 'logo':
        im = im.crop(im.getbbox())
    im.thumbnail((1400,1400))
    im.save(out / (name+'.webp'), quality=88)
for name, page, rect in [('hero',0,(805,0,1355,810)), ('about',1,(730,55,1290,680)), ('collaboration',12,(735,0,1440,810))]:
    pix = doc[page].get_pixmap(matrix=fitz.Matrix(1.3,1.3),clip=fitz.Rect(rect))
    Image.open(io.BytesIO(pix.tobytes('png'))).save(out/(name+'.webp'),quality=90)
print('Extracted',len(images)+3,'web assets')
