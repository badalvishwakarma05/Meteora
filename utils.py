import os
import io
import base64
import h5py
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Headless backend for web server environment
import matplotlib.pyplot as plt

def get_available_h5_files(data_dir='./data'):
    """Scans data_dir and returns list of relative paths / filenames of .h5 files."""
    if not os.path.exists(data_dir):
        os.makedirs(data_dir, exist_ok=True)
        return []
    files = [f for f in os.listdir(data_dir) if f.endswith('.h5')]
    return sorted(files)

def extract_cyclone_patch(file_path, target_lat, target_lon, patch_size=128):
    """
    Extracts a square patch of satellite dataset around target coordinates from HDF5 file.
    """
    with h5py.File(file_path, 'r') as f:
        # Datasets load kar rahe hain
        tir1_2d = np.squeeze(f['IMG_TIR1'][:])
        lat_grid = f['Latitude'][:] / 100.0   # MOSDAC scale factor ke mutabiq adjust
        lon_grid = f['Longitude'][:] / 100.0
        
        # Target lat/lon ke sabse kareeb ka pixel index dhoondhna
        dist_sq = (lat_grid - target_lat)**2 + (lon_grid - target_lon)**2
        min_idx = np.argmin(dist_sq)
        center_y, center_x = np.unravel_index(min_idx, lat_grid.shape)
        
        # Patch boundaries set karna (with edge checking)
        half = patch_size // 2
        y1 = max(0, center_y - half)
        y2 = min(tir1_2d.shape[0], center_y + half)
        x1 = max(0, center_x - half)
        x2 = min(tir1_2d.shape[1], center_x + half)
        
        # Patch extract kar rahe hain
        patch = tir1_2d[y1:y2, x1:x2]

        nearest_lat = float(lat_grid[center_y, center_x])
        nearest_lon = float(lon_grid[center_y, center_x])
        
        metadata = {
            'center_y': int(center_y),
            'center_x': int(center_x),
            'nearest_lat': round(nearest_lat, 4),
            'nearest_lon': round(nearest_lon, 4),
            'grid_shape': tir1_2d.shape,
            'patch_shape': patch.shape,
            'y1': int(y1),
            'y2': int(y2),
            'x1': int(x1),
            'x2': int(x2)
        }
        return patch, metadata

def render_patch_to_base64(patch, metadata, colormap='inferno', target_lat=15.0, target_lon=72.0, filename=""):
    """
    Renders numpy patch matrix as a high-precision thermal image with matplotlib,
    returns base64 PNG string & comprehensive telemetry metrics.
    """
    patch_clean = np.nan_to_num(patch, nan=0.0)
    min_val = float(np.min(patch_clean))
    max_val = float(np.max(patch_clean))
    mean_val = float(np.mean(patch_clean))
    std_val = float(np.std(patch_clean))
    dyn_range = float(max_val - min_val)
    
    # Setup Figure with Deep Mission Control Background (#060c17)
    fig, ax = plt.subplots(figsize=(8.0, 6.8), facecolor='#060c17', dpi=160)
    ax.set_facecolor('#060c17')
    
    # Render thermal image
    im = ax.imshow(patch_clean, cmap=colormap, origin='upper', aspect='equal')
    
    # Add subtle grid lines for pixel coordinates
    ax.grid(True, color='#1a3a6b', linestyle=':', linewidth=0.8, alpha=0.6)

    # Draw Tactical Target Reticle at center of patch
    patch_center_y = patch_clean.shape[0] / 2.0
    patch_center_x = patch_clean.shape[1] / 2.0

    # Crosshair Lines
    ax.axhline(patch_center_y, color='#00d4ff', linestyle='--', linewidth=1.2, alpha=0.85)
    ax.axvline(patch_center_x, color='#00d4ff', linestyle='--', linewidth=1.2, alpha=0.85)

    # Target Center Circles
    reticle_outer = plt.Circle((patch_center_x, patch_center_y), radius=max(4, patch_clean.shape[0]*0.08), fill=False, color='#00d4ff', linewidth=1.4, linestyle='-')
    reticle_inner = plt.Circle((patch_center_x, patch_center_y), radius=max(2, patch_clean.shape[0]*0.03), fill=False, color='#ff3b3b', linewidth=1.2)
    ax.add_patch(reticle_outer)
    ax.add_patch(reticle_inner)
    ax.scatter([patch_center_x], [patch_center_y], color='#ff3b3b', s=40, edgecolors='white', linewidth=1.2, zorder=6)

    # Style axes, labels, and ticks
    ax.tick_params(colors='#8892a4', labelsize=8.5)
    for spine in ax.spines.values():
        spine.set_color('#1a3a6b')
        spine.set_linewidth(1.2)
        
    ax.set_title(
        f"MOSDAC INSAT-3R TIR1 Thermal Infrared Imagery ({patch_clean.shape[0]}×{patch_clean.shape[1]} px)\n"
        f"Target Center: {target_lat}°N, {target_lon}°E | Sub-Grid Pixel (Y:{metadata['center_y']}, X:{metadata['center_x']})",
        color='#ffffff', fontsize=9.5, pad=12, fontweight='bold'
    )
    ax.set_xlabel("Relative Longitude / Pixel Column Index (X)", color='#8892a4', fontsize=8.5, labelpad=8)
    ax.set_ylabel("Relative Latitude / Pixel Row Index (Y)", color='#8892a4', fontsize=8.5, labelpad=8)
    
    # High-contrast Colorbar configuration
    cbar = fig.colorbar(im, ax=ax, fraction=0.046, pad=0.035)
    cbar.set_label('Infrared Radiance / Brightness Count (TIR1)', color='#ffffff', fontsize=8.5, labelpad=10, fontweight='semibold')
    cbar.ax.yaxis.set_tick_params(color='#8892a4', labelcolor='#8892a4', labelsize=8)
    cbar.outline.set_edgecolor('#1a3a6b')
    cbar.outline.set_linewidth(1.2)
    
    plt.tight_layout()
    
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=160, facecolor=fig.get_facecolor(), bbox_inches='tight')
    plt.close(fig)
    buffer.seek(0)
    image_png = buffer.getvalue()
    buffer.close()
    
    base64_img = base64.b64encode(image_png).decode('utf-8')
    image_data_uri = f"data:image/png;base64,{base64_img}"
    
    # Calculate percentages for intuitive UI progress bars
    # Digital counts typically range 0-1023 or 0-255
    scale_max = 1024.0 if max_val > 255 else 255.0
    
    min_pct = min(100.0, round((min_val / scale_max) * 100, 1))
    max_pct = min(100.0, round((max_val / scale_max) * 100, 1))
    mean_pct = min(100.0, round((mean_val / scale_max) * 100, 1))

    # Interpretation text for meteorologists
    if min_val < 300:
        min_desc = "Deep Overshooting Convective Towers (Coldest Cloud Tops)"
    else:
        min_desc = "Mid-Level Cloud Layer Radiance"

    if max_val > 700:
        max_desc = "Warm Ocean Sea Surface / Clear-Sky Thermal Window"
    else:
        max_desc = "Moderate Cloud Cover Window"

    stats = {
        'min': round(min_val, 2),
        'max': round(max_val, 2),
        'mean': round(mean_val, 2),
        'std': round(std_val, 2),
        'range': round(dyn_range, 2),
        'pixel_count': patch_clean.size,
        'min_pct': min_pct,
        'max_pct': max_pct,
        'mean_pct': mean_pct,
        'min_desc': min_desc,
        'max_desc': max_desc,
    }
    
    return image_data_uri, stats
