from PIL import Image
from pathlib import Path

# Paths
input_dir = Path("1080/Final")   
output_dir = Path("output")   
output_dir.mkdir(parents=True, exist_ok=True)

# Conversion
for png_file in sorted(input_dir.glob("*.png")):
    img = Image.open(png_file)
    output_file = output_dir / (png_file.stem + ".webp")
    img.save(output_file, format="WEBP", quality=70)  
    print(f"✅ Converted {png_file.name} → {output_file.name}")

print("🎉 All done!")

