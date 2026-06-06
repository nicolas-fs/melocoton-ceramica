#!/usr/bin/env python3
"""CAMBIO 3: Correccion de encoding UTF-8"""
import os

root = os.path.join(os.path.dirname(__file__), '..')
ENCODING_MAP = [
    ('Ã¡','á'),('Ã©','é'),('Ã­','í'),('Ã³','ó'),('Ãº','ú'),
    ('Ã±','ñ'),('â€"','—'),('â€™',"'"),('Â¿','¿'),('Â¡','¡'),('Â ',''),
]
SKIP = {'node_modules','.next','.git','__pycache__'}
fixed = []
for dp, dirs, files in os.walk(root):
    dirs[:] = [d for d in dirs if d not in SKIP]
    for f in files:
        if not any(f.endswith(e) for e in ['.ts','.tsx','.js','.json','.md','.css']): continue
        path = os.path.join(dp, f)
        try: c = open(path, encoding='utf-8').read()
        except: continue
        orig = c
        for bad, good in ENCODING_MAP:
            c = c.replace(bad, good)
        if c != orig:
            open(path,'w',encoding='utf-8').write(c)
            fixed.append(path.replace(str(root)+os.sep,''))
print(f"Corregidos: {len(fixed)}" if fixed else "Sin problemas de encoding")
