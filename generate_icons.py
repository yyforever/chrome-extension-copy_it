#!/usr/bin/env python3
"""
SVG to PNG converter for Chrome extension icons
"""
import sys

def convert_with_cairosvg():
    """Try converting with cairosvg"""
    try:
        import cairosvg
        sizes = [16, 48, 128]
        for size in sizes:
            cairosvg.svg2png(
                url='icons/icon.svg',
                write_to=f'icons/icon{size}.png',
                output_width=size,
                output_height=size
            )
            print(f'✓ Generated icon{size}.png')
        return True
    except ImportError:
        return False
    except Exception as e:
        print(f'Error with cairosvg: {e}')
        return False

def convert_with_wand():
    """Try converting with Wand (ImageMagick binding)"""
    try:
        from wand.image import Image
        sizes = [16, 48, 128]
        for size in sizes:
            with Image(filename='icons/icon.svg') as img:
                img.resize(size, size)
                img.save(filename=f'icons/icon{size}.png')
            print(f'✓ Generated icon{size}.png')
        return True
    except ImportError:
        return False
    except Exception as e:
        print(f'Error with Wand: {e}')
        return False

def convert_with_pillow():
    """Try converting with Pillow + svglib"""
    try:
        from svglib.svglib import svg2rlg
        from reportlab.graphics import renderPM
        from PIL import Image

        sizes = [16, 48, 128]
        drawing = svg2rlg('icons/icon.svg')

        for size in sizes:
            # Convert to high-res first, then resize
            renderPM.drawToFile(drawing, 'icons/temp.png', fmt='PNG', dpi=72)
            img = Image.open('icons/temp.png')
            img = img.resize((size, size), Image.Resampling.LANCZOS)
            img.save(f'icons/icon{size}.png')
            print(f'✓ Generated icon{size}.png')

        import os
        os.remove('icons/temp.png')
        return True
    except ImportError:
        return False
    except Exception as e:
        print(f'Error with Pillow: {e}')
        return False

def main():
    print('Attempting to generate icons from SVG...\n')

    methods = [
        ('cairosvg', convert_with_cairosvg),
        ('Wand (ImageMagick)', convert_with_wand),
        ('Pillow + svglib', convert_with_pillow),
    ]

    for name, func in methods:
        print(f'Trying {name}...')
        if func():
            print(f'\n✓ Successfully generated all icons using {name}!')
            return 0
        print(f'✗ {name} not available or failed\n')

    print('=' * 60)
    print('ERROR: Could not generate icons with any available method.')
    print('\nPlease install one of the following:')
    print('  1. cairosvg:        pip3 install cairosvg')
    print('  2. Wand:            pip3 install Wand')
    print('  3. svglib+Pillow:   pip3 install svglib Pillow reportlab')
    print('\nOr use ImageMagick: brew install imagemagick')
    print('=' * 60)
    return 1

if __name__ == '__main__':
    sys.exit(main())
