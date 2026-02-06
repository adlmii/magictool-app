import sys
import os
import argparse

# ==========================================
# SETUP ENCODING
# ==========================================
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except AttributeError:
    pass

try:
    from PIL import Image, UnidentifiedImageError
except ImportError as e:
    sys.stderr.write(f"CRITICAL ERROR: Library missing. {str(e)}\n")
    sys.exit(1)

def log(msg):
    """Print info biasa ke stdout"""
    print(msg, flush=True)

def error_log(msg):
    """Print ERROR ke stderr agar ditangkap Electron"""
    sys.stderr.write(f"{msg}\n")

# ==========================================
# LOGIKA UTAMA
# ==========================================

def process_image():
    parser = argparse.ArgumentParser()
    parser.add_argument("command")
    parser.add_argument("input_path")
    parser.add_argument("output_path")
    
    args, unknown = parser.parse_known_args()

    input_path = args.input_path
    output_path = args.output_path
    command = args.command

    # Cek Eksistensi File
    if not os.path.exists(input_path):
        error_log(f"FILE NOT FOUND: {input_path}")
        sys.exit(1)

    try:
        img = Image.open(input_path)
        
        # === REMOVE BG ===
        if command == "remove_bg":
            from rembg import remove
            # Hapus background
            output = remove(img)
            output.save(output_path, "PNG")

        # === CONVERT ===
        elif command == "convert":
            ext = os.path.splitext(output_path)[1].lower().replace('.', '')
            
            format_map = {
                'jpg': 'JPEG',
                'jpeg': 'JPEG',
                'ico': 'ICO',
                'png': 'PNG',
                'webp': 'WEBP',
                'bmp': 'BMP'
            }
            
            target_format = format_map.get(ext, 'PNG')

            if target_format in ["JPEG", "BMP"] and img.mode == "RGBA":
                bg = Image.new("RGB", img.size, (255, 255, 255))
                bg.paste(img, mask=img.split()[3])
                img = bg
            elif target_format != "ICO" and img.mode != "RGB" and target_format == "JPEG":
                img = img.convert("RGB")

            if target_format == 'ICO':
                img.save(output_path, format='ICO', sizes=[(256, 256), (128, 128), (64, 64), (32, 32), (16, 16)])
            else:
                img.save(output_path, format=target_format)

        else:
            error_log(f"UNKNOWN COMMAND: {command}")
            sys.exit(1)

        log(f"SUCCESS -> {output_path}")
        sys.exit(0)

    except UnidentifiedImageError:
        error_log("ERROR: File is not a valid image or is corrupted.")
        sys.exit(1)
    except Exception as e:
        error_log(f"PYTHON EXCEPTION: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    process_image()