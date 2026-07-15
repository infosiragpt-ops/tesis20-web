#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

for command_name in uvx ffmpeg ffprobe; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing required command: $command_name" >&2
    exit 1
  fi
done

voice="es-PE-AlexNeural"
rate="-2%"
pitch="+0Hz"
audio_dir="public/assets/audio"
backup_dir="backups/audio-before-male-voice-$(date +%Y%m%d-%H%M%S)"
work_dir="$(mktemp -d)"

cleanup() {
  rm -rf "$work_dir"
}
trap cleanup EXIT

tracks=(
  "presentacion.txt:tesis20-presentacion.mp3"
  "articulo-cientifico.txt:servicio-articulo-cientifico.mp3"
  "tesis-i-proyecto.txt:servicio-tesis-1-proyecto.mp3"
  "tesis-ii-titulacion.txt:servicio-tesis-2-titulacion.mp3"
  "suficiencia-profesional.txt:servicio-suficiencia-profesional.mp3"
  "ibm-spss-statistics.txt:servicio-ibm-spss-statistics.mp3"
  "simulacion-sustentacion.txt:servicio-simulacion-sustentacion.mp3"
)

mkdir -p "$backup_dir"
cp -p "$audio_dir"/*.mp3 "$backup_dir"/

for track in "${tracks[@]}"; do
  script_name="${track%%:*}"
  output_name="${track##*:}"
  raw_file="$work_dir/raw-$output_name"
  final_file="$work_dir/$output_name"

  uvx --from edge-tts edge-tts \
    --voice "$voice" \
    --rate="$rate" \
    --pitch="$pitch" \
    --file "audio-scripts/$script_name" \
    --write-media "$raw_file"

  ffmpeg -hide_banner -loglevel error -y \
    -i "$raw_file" \
    -af "loudnorm=I=-15.0:LRA=7:TP=-1.5" \
    -ac 1 \
    -ar 44100 \
    -b:a 128k \
    "$final_file"

  ffprobe -v error \
    -select_streams a:0 \
    -show_entries stream=codec_name,sample_rate,channels \
    -of default=noprint_wrappers=1 \
    "$final_file"
done

for track in "${tracks[@]}"; do
  output_name="${track##*:}"
  mv "$work_dir/$output_name" "$audio_dir/$output_name"
done

echo "Backup: $backup_dir"
echo "Generated ${#tracks[@]} tracks with $voice."
