import sys
import os
import argparse
import warnings

warnings.filterwarnings("ignore")

try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except AttributeError:
    pass

def log(msg):
    print(msg, flush=True)

def error_log(msg):
    sys.stderr.write(f"{msg}\n")

try:
    from PIL import Image, UnidentifiedImageError
    import cv2
    from cv2 import dnn_superres
    import numpy as np
    import requests
except ImportError as e:
    error_log(f"CRITICAL ERROR: Library missing. {str(e)}")
    sys.exit(1)

def download_model(model_name, url, save_path):
    if not os.path.exists(save_path):
        log(f"Mendownload model {model_name}... (Hanya sekali)")
        try:
            response = requests.get(url, stream=True)
            response.raise_for_status()
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            log("Download selesai!")
        except Exception as e:
            error_log(f"Gagal download model: {str(e)}")
            sys.exit(1)

def process_image():
    parser = argparse.ArgumentParser()
    parser.add_argument("command")
    parser.add_argument("input_path")
    parser.add_argument("output_path")
    
    # Arguments
    parser.add_argument("--scale", type=int, default=2, help="Upscale factor (2 or 4)")
    # Argument baru: Keep Original Size (Flag)
    parser.add_argument("--keep_original", action='store_true', help="Resize back to original size after upscale")
    
    args, unknown = parser.parse_known_args()
    command = args.command
    input_path = args.input_path
    output_path = args.output_path
    scale_factor = args.scale
    keep_original = args.keep_original # Boolean True/False

    if not os.path.exists(input_path):
        error_log(f"FILE NOT FOUND: {input_path}")
        sys.exit(1)

    try:
        img = Image.open(input_path)

        if command == "remove_bg":
            log("Memproses Hapus Background...")
            from rembg import remove
            output = remove(img)
            output.save(output_path, "PNG")

        elif command == "convert":
            log(f"Mengonversi gambar...")
            ext = os.path.splitext(output_path)[1].lower().replace('.', '')
            format_map = {'jpg': 'JPEG', 'jpeg': 'JPEG', 'ico': 'ICO', 'png': 'PNG', 'webp': 'WEBP', 'bmp': 'BMP'}
            target_format = format_map.get(ext, 'PNG')

            if target_format in ["JPEG", "BMP"] and img.mode in ("RGBA", "LA", "P"):
                img = img.convert("RGBA")
                bg = Image.new("RGB", img.size, (255, 255, 255))
                bg.paste(img, mask=img.split()[-1])
                img = bg
            elif target_format != "ICO" and img.mode != "RGB" and target_format == "JPEG":
                img = img.convert("RGB")

            if target_format == 'ICO':
                img.save(output_path, format='ICO', sizes=[(256, 256), (128, 128), (64, 64), (32, 32), (16, 16)])
            else:
                img.save(output_path, format=target_format)

        elif command == "upscale":
            # Simpan ukuran asli untuk referensi
            original_size = img.size # (width, height)
            
            log(f"Inisialisasi AI Upscale (EDSR x{scale_factor})...")
            
            if scale_factor not in [2, 4]:
                scale_factor = 2

            models_dir = os.path.join(os.path.dirname(__file__), 'models')
            if not os.path.exists(models_dir):
                os.makedirs(models_dir)
            
            model_filename = f"EDSR_x{scale_factor}.pb"
            model_path = os.path.join(models_dir, model_filename)
            model_url = f"https://github.com/Saafke/EDSR_Tensorflow/raw/master/models/{model_filename}"
            
            download_model(f"EDSR x{scale_factor}", model_url, model_path)

            sr = dnn_superres.DnnSuperResImpl_create()
            try:
                sr.readModel(model_path)
                sr.setModel("edsr", scale_factor) 
            except Exception as e:
                error_log(f"Gagal memuat model AI: {str(e)}")
                sys.exit(1)

            img = img.convert("RGB")
            image_np = np.array(img)
            image_cv2 = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

            log("Sedang memproses (Enhancing)...")
            result_cv2 = sr.upsample(image_cv2)

            result_rgb = cv2.cvtColor(result_cv2, cv2.COLOR_BGR2RGB)
            output_pil = Image.fromarray(result_rgb)

            if keep_original:
                log("Mengecilkan kembali ke ukuran asli (Supersampling)...")
                # Gunakan LANCZOS untuk hasil downsampling terbaik (tajam)
                output_pil = output_pil.resize(original_size, Image.Resampling.LANCZOS)

            output_pil.save(output_path, "PNG")

        else:
            error_log(f"UNKNOWN COMMAND: {command}")
            sys.exit(1)

        log(f"SUCCESS -> {output_path}")
        sys.exit(0)

    except UnidentifiedImageError:
        error_log("ERROR: File rusak atau bukan gambar.")
        sys.exit(1)
    except Exception as e:
        error_log(f"SYSTEM ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    process_image()