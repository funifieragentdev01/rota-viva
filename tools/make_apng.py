#!/usr/bin/env python3
"""
Pipeline: PNG estática → Freepik Kling v2 (MP4) → frames → rembg → APNG

Uso:
  python3 make_apng.py <input.png> [output.apng]

Requisitos:
  pip3 install rembg onnxruntime requests pillow
  ffmpeg binary em tools/ffmpeg (baixado por este repo)
"""

import sys
import os
import time
import base64
import json
import subprocess
import shutil
import tempfile
import urllib.request
import urllib.error
import io

# ── Configuração ──────────────────────────────────────────────────────────────
FREEPIK_API_KEY = "FPSX69b6861d3b45e4591f8e8d354ebf3ec0"
FFMPEG = os.path.join(os.path.dirname(__file__), "ffmpeg")

# Kling v2: duração "5" ou "10"
VIDEO_DURATION = "5"
# FPS de extração de frames do MP4
EXTRACT_FPS = 10
# Resolução final do APNG (a imagem original é 250×250; upscale para Freepik ≥300)
UPLOAD_SIZE = 512   # tamanho ao enviar para a API (px)
OUTPUT_SIZE = 200   # tamanho do APNG final (px)
# Quantos frames manter no APNG final (controla tamanho/fluidez)
OUTPUT_FRAMES = 25  # ~1MB a 200px
# Delay em ms por frame no APNG
FRAME_DELAY_MS = 200  # 200ms = 5fps
# Prompt de movimento — animação suave para mascote estático
MOTION_PROMPT = (
    "gentle idle animation, soft breathing motion, subtle body sway, "
    "character stays centered, smooth and loopable, cartoon mascot"
)

API_POST  = "https://api.freepik.com/v1/ai/image-to-video/kling-v2"
API_GET   = "https://api.freepik.com/v1/ai/image-to-video/kling-v2/{task_id}"
POLL_INTERVAL = 8   # segundos entre polls
MAX_WAIT      = 300 # timeout total em segundos


def log(msg):
    print(f"[make_apng] {msg}", flush=True)


def freepik_request(method, url, body=None):
    headers = {
        "x-freepik-api-key": FREEPIK_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        raise RuntimeError(f"HTTP {e.code}: {body}")


def submit_video(image_path):
    log(f"Lendo imagem: {image_path}")
    # Freepik Kling v2 exige resolução mínima de 300×300px
    # Upscalamos para UPLOAD_SIZE para garantir qualidade
    from PIL import Image
    img = Image.open(image_path).convert("RGBA")
    if img.width < 300 or img.height < 300:
        img = img.resize((UPLOAD_SIZE, UPLOAD_SIZE), Image.LANCZOS)
        log(f"  Redimensionada para {UPLOAD_SIZE}×{UPLOAD_SIZE}px (mínimo Freepik: 300×300)")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode()

    # Freepik espera data URI para base64
    image_data = f"data:image/png;base64,{b64}"

    payload = {
        "image": image_data,
        "duration": VIDEO_DURATION,
        "prompt": MOTION_PROMPT,
        "cfg_scale": 0.5,
    }

    log("Enviando para Freepik Kling v2...")
    resp = freepik_request("POST", API_POST, payload)
    log(f"Resposta inicial: {json.dumps(resp, indent=2)}")

    task_id = resp.get("task_id") or (resp.get("data", {}) or {}).get("task_id")
    if not task_id:
        raise RuntimeError(f"task_id não encontrado na resposta: {resp}")
    return task_id


def poll_video(task_id):
    url = API_GET.format(task_id=task_id)
    log(f"Polling task {task_id}...")
    elapsed = 0
    while elapsed < MAX_WAIT:
        time.sleep(POLL_INTERVAL)
        elapsed += POLL_INTERVAL
        resp = freepik_request("GET", url)
        status = (resp.get("status") or
                  (resp.get("data", {}) or {}).get("status", ""))
        log(f"  [{elapsed}s] status={status}")

        if status == "COMPLETED":
            # Extrair URL do vídeo da resposta
            video_url = None
            data = resp.get("data") or resp
            if isinstance(data, dict):
                video_url = (data.get("video_url") or
                             data.get("url") or
                             ((data.get("generated") or [None])[0]))
            if not video_url and isinstance(data.get("generated"), list):
                video_url = data["generated"][0]
            if not video_url:
                # Tenta percorrer toda a estrutura
                raw = json.dumps(resp)
                log(f"Resposta completa: {raw}")
                raise RuntimeError("URL do vídeo não encontrada na resposta COMPLETED")
            return video_url

        if status == "FAILED":
            raise RuntimeError(f"Tarefa falhou: {json.dumps(resp, indent=2)}")

    raise TimeoutError(f"Timeout após {MAX_WAIT}s aguardando o vídeo")


def download_file(url, dest):
    log(f"Baixando {url} → {dest}")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as r, open(dest, "wb") as f:
        shutil.copyfileobj(r, f)


def extract_frames(mp4_path, frames_dir):
    os.makedirs(frames_dir, exist_ok=True)
    cmd = [
        FFMPEG, "-y", "-i", mp4_path,
        "-vf", f"fps={EXTRACT_FPS}",
        os.path.join(frames_dir, "frame_%04d.png"),
    ]
    log(f"Extraindo frames: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg erro:\n{result.stderr}")
    frames = sorted(f for f in os.listdir(frames_dir) if f.endswith(".png"))
    log(f"  {len(frames)} frames extraídos")
    return frames


def remove_backgrounds(frames_dir, frames_out_dir):
    from rembg import remove
    from PIL import Image

    os.makedirs(frames_out_dir, exist_ok=True)
    frames = sorted(f for f in os.listdir(frames_dir) if f.endswith(".png"))
    log(f"Removendo fundo de {len(frames)} frames com rembg...")
    for i, fname in enumerate(frames):
        src = os.path.join(frames_dir, fname)
        dst = os.path.join(frames_out_dir, fname)
        with open(src, "rb") as fi:
            result = remove(fi.read())
        with open(dst, "wb") as fo:
            fo.write(result)
        if (i + 1) % 5 == 0 or (i + 1) == len(frames):
            log(f"  {i+1}/{len(frames)} frames processados")
    return frames


def build_apng(frames_dir, frames, output_path):
    """Monta APNG usando Pillow com redução de frames e resize final."""
    from PIL import Image

    # Selecionar OUTPUT_FRAMES frames distribuídos uniformemente
    total = len(frames)
    step = max(1, total // OUTPUT_FRAMES)
    selected = frames[::step][:OUTPUT_FRAMES]
    log(f"Selecionados {len(selected)}/{total} frames (step={step})")

    imgs = []
    for fname in selected:
        img = Image.open(os.path.join(frames_dir, fname)).convert("RGBA")
        img = img.resize((OUTPUT_SIZE, OUTPUT_SIZE), Image.LANCZOS)
        imgs.append(img)

    log(f"Montando APNG {OUTPUT_SIZE}×{OUTPUT_SIZE}px, {len(imgs)} frames @ {1000//FRAME_DELAY_MS}fps...")
    imgs[0].save(
        output_path,
        save_all=True,
        append_images=imgs[1:],
        loop=0,
        duration=FRAME_DELAY_MS,
        optimize=True,
        format="PNG",
    )
    size_kb = os.path.getsize(output_path) / 1024
    log(f"APNG gerado: {output_path} ({size_kb:.0f} KB, {len(imgs)} frames, {len(imgs)*FRAME_DELAY_MS/1000:.1f}s loop)")


def main():
    if len(sys.argv) < 2:
        print(f"Uso: python3 {sys.argv[0]} <input.png> [output.apng]")
        sys.exit(1)

    input_png = os.path.abspath(sys.argv[1])
    if not os.path.exists(input_png):
        print(f"Erro: arquivo não encontrado: {input_png}")
        sys.exit(1)

    # Output padrão ao lado do input
    if len(sys.argv) >= 3:
        output_apng = os.path.abspath(sys.argv[2])
    else:
        base = os.path.splitext(input_png)[0]
        output_apng = base + "_animated.apng"

    # Diretório de trabalho temporário
    workdir = tempfile.mkdtemp(prefix="apng_")
    log(f"Workdir: {workdir}")

    try:
        # 1. Gerar vídeo no Freepik
        task_id = submit_video(input_png)

        # 2. Aguardar e baixar o MP4
        video_url = poll_video(task_id)
        mp4_path = os.path.join(workdir, "video.mp4")
        download_file(video_url, mp4_path)

        # 3. Extrair frames
        frames_raw = os.path.join(workdir, "frames_raw")
        frames = extract_frames(mp4_path, frames_raw)

        # 4. Remover fundo com rembg
        frames_clean = os.path.join(workdir, "frames_clean")
        remove_backgrounds(frames_raw, frames_clean)

        # 5. Montar APNG (recarrega lista de frames limpos)
        frames_clean_list = sorted(f for f in os.listdir(frames_clean) if f.endswith(".png"))
        build_apng(frames_clean, frames_clean_list, output_apng)

        log(f"\n✓ Concluído! APNG: {output_apng}")

    except Exception as e:
        log(f"\n✗ Erro: {e}")
        sys.exit(1)
    finally:
        shutil.rmtree(workdir, ignore_errors=True)


if __name__ == "__main__":
    main()
