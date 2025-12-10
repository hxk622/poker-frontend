#!/usr/bin/env python3
import base64
import sys

# 检查参数
if len(sys.argv) != 3:
    print("Usage: python convert_to_svg.py input_file output_file")
    sys.exit(1)

input_file = sys.argv[1]
output_file = sys.argv[2]

# 读取JPEG文件并转换为base64
with open(input_file, "rb") as f:
    jpeg_data = f.read()
    base64_data = base64.b64encode(jpeg_data).decode("utf-8")

# 获取图像尺寸 (使用macOS内置的sips命令)
import subprocess
result = subprocess.run(["sips", "-g", "pixelWidth", "-g", "pixelHeight", input_file], capture_output=True, text=True)
lines = result.stdout.strip().split('\n')
# 跳过第一行文件路径
width = int(lines[1].split(':')[-1].strip())
height = int(lines[2].split(':')[-1].strip())

# 创建SVG内容
svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <image width="{width}" height="{height}" href="data:image/jpeg;base64,{base64_data}" />
</svg>'''

# 写入SVG文件
with open(output_file, "w") as f:
    f.write(svg_content)

print(f"Converted {input_file} to {output_file} successfully!")