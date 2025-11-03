#!/usr/bin/env python3
"""
Create simple placeholder icons for Chrome extension
"""
from PIL import Image, ImageDraw, ImageFont

def create_icon(size):
    """Create a simple icon with the size"""
    # Create image with blue background
    img = Image.new('RGB', (size, size), color='#3b82f6')
    draw = ImageDraw.Draw(img)

    # Draw a simple clipboard-like shape
    # Background rectangle (clipboard body)
    margin = size // 8
    rect_left = margin
    rect_top = size // 4
    rect_right = size - margin
    rect_bottom = size - margin

    # Draw white clipboard
    draw.rectangle(
        [rect_left, rect_top, rect_right, rect_bottom],
        fill='white',
        outline='white'
    )

    # Draw clip at top
    clip_width = size // 3
    clip_height = size // 8
    clip_left = (size - clip_width) // 2
    clip_top = size // 6

    draw.rounded_rectangle(
        [clip_left, clip_top, clip_left + clip_width, clip_top + clip_height],
        radius=size // 16,
        fill='#3b82f6',
        outline='#3b82f6'
    )

    # Draw lines on clipboard
    if size >= 32:
        line_margin = margin + size // 16
        line_top = rect_top + size // 8
        line_spacing = size // 12

        for i in range(3):
            y = line_top + i * line_spacing
            if y < rect_bottom - size // 16:
                draw.line(
                    [line_margin, y, rect_right - line_margin, y],
                    fill='#3b82f6',
                    width=max(1, size // 32)
                )

    return img

def main():
    sizes = [16, 48, 128]

    print('Creating placeholder icons...\n')

    for size in sizes:
        img = create_icon(size)
        filename = f'icons/icon{size}.png'
        img.save(filename, 'PNG')
        print(f'✓ Created {filename}')

    print('\n✓ All placeholder icons created successfully!')
    print('\nNote: These are simple placeholder icons.')
    print('For better quality, consider converting the SVG using:')
    print('  - ImageMagick: brew install imagemagick')
    print('  - Online converter: https://cloudconvert.com/svg-to-png')

if __name__ == '__main__':
    main()
