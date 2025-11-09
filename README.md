# 365 Days Flooring Catalog

## Drop ZIPs and Done - Automated Catalog Generation

A streamlined flooring catalog system that automatically processes ZIP files containing product photos and generates a complete, responsive catalog website.

## 🚀 Quick Start

1. **Clone or download this repository**
2. **Drop your ZIP file**: Place your flooring photos ZIP file anywhere accessible
3. **Run the processor**:
   ```bash
   python3 tools/process-zip.py path/to/your/photos.zip
   ```
4. **View your catalog**: Open `catalog.html` in a browser

That's it! Your catalog is ready.

## 📁 Project Structure

```
365-days-catalog/
├── catalog.html          # Main catalog page
├── index.html            # Landing page  
├── script.js             # Catalog functionality
├── styles.css            # Styling
├── data/
│   └── materials.json    # Product data (auto-generated)
├── catalog/
│   └── images/           # Product images (auto-generated)
└── tools/
    └── process-zip.py    # ZIP processor
```

## 🛠 How It Works

### The Even-Number Algorithm

The system automatically selects **even-numbered photos** (positions 2, 4, 6, 8, 10...) from your ZIP file because these consistently contain the actual material samples, while odd-numbered photos typically contain labels.

### ZIP Processing Pipeline

1. **Extract**: Unzips all photos from your file
2. **Select**: Chooses even-numbered photos (material samples only)
3. **Optimize**: Resizes and compresses images for web
4. **Generate**: Creates `materials.json` with product data
5. **Ready**: Catalog is immediately viewable

## 📋 Requirements

- Python 3.6+
- PIL/Pillow for image processing
- Modern web browser

### Install Dependencies

```bash
pip install Pillow
```

## 🎯 Features

- **Fully Automated**: Drop ZIP, get catalog
- **Responsive Design**: Works on desktop, tablet, mobile
- **Image Optimization**: Automatic resizing and compression
- **Search & Filter**: Find materials quickly
- **Modal Detail Views**: Click any material for full specs
- **Zero Configuration**: No setup files needed

## 📝 Material Data Structure

Each material automatically gets:

```json
{
  "id": "MAT001",
  "name": "Flooring Material 001", 
  "collection": "365 Days Collection",
  "type": "Luxury Vinyl Plank",
  "wear_layer": "20 mil",
  "thickness": "5.5mm",
  "width": "7\"", 
  "length": "48\"",
  "coverage": "23.64 sq ft",
  "carton_weight": "40 lbs",
  "warranty": "Lifetime Residential, 15 Year Commercial",
  "features": ["100% Waterproof", "Attached Pad", "Easy Install"],
  "image": "catalog/images/MAT001_sample.jpg"
}
```

You can edit `data/materials.json` to customize any material details.

## 🔄 Processing Multiple ZIPs

Process additional materials by running the tool again:

```bash
# Process new materials (will add to existing catalog)
python3 tools/process-zip.py path/to/new-materials.zip
```

## 🌐 Viewing Your Catalog

### Local Development
```bash
# Simple HTTP server
python3 -m http.server 8000
# Then visit http://localhost:8000/catalog.html
```

### Production Deployment
Upload all files to your web server. The catalog works as static files with no server-side requirements.

## 📱 Responsive Design

The catalog automatically adapts to different screen sizes:
- **Desktop**: Grid layout with hover effects
- **Tablet**: Responsive grid with touch-friendly navigation  
- **Mobile**: Single column, optimized for touch

## ⚡ Performance

- **Lazy Loading**: Images load as you scroll
- **Optimized Images**: Automatic compression for fast loading
- **Minimal Dependencies**: Pure JavaScript, no frameworks
- **Caching**: Browser caching for repeat visits

## 🎨 Customization

### Styling
Edit `styles.css` to customize:
- Colors and branding
- Layout and spacing
- Responsive breakpoints
- Animation effects

### Functionality
Edit `script.js` to customize:
- Search behavior
- Modal content
- Data processing
- API integration

## 🔧 Troubleshooting

**No images showing?**
- Check that your ZIP contains image files (.jpg, .jpeg, .png)
- Verify the `catalog/images/` directory was created
- Check browser console for loading errors

**Wrong materials selected?**
- The system uses even-numbered photos (2, 4, 6, 8...)
- If your ZIP has a different pattern, contact support

**Processing fails?**
- Ensure Python 3.6+ is installed
- Install PIL: `pip install Pillow`
- Check that the ZIP file isn't corrupted

## 🤝 Contributing

This project is designed to be simple and self-contained. For modifications:

1. Test changes with sample ZIP files
2. Ensure backward compatibility
3. Update documentation
4. Test responsive design

## 📄 License

Open source - feel free to use and modify for your projects.

---

**🎯 One Command. Complete Catalog. Ready to Ship.**
