"""Interactive map gallery for geo-tagged images using Plotly."""

from dataclasses import dataclass
from PIL import Image, ImageDraw
import gradio as gr
import plotly.graph_objects as go
import plotly.express as px
import os
import io
import base64
import json

@dataclass
class BBoxSegment:
    category: str
    x_min: float
    x_max: float
    y_min: float
    y_max: float
    confidence: float = 1.0


# category_name -> color
categories ={"bike": "blue"}

# format: image_path, longitude, latitude, list[BBoxSegment]
locations = [
    ("data/183375246977980.jpg", 4.9009338, 52.37294, [        
        BBoxSegment(
            category="bike", confidence=0.5,
            x_min=181, x_max=355,
            y_min=560, y_max=673,
        )
    ]),
    ("data/dam.jpg", 4.893212, 52.372936, []),
]


def render_image_with_segments(image_path: str, segments: list[BBoxSegment]) -> Image.Image:
    """Render image with segment bounding boxes overlaid."""
    if not os.path.exists(image_path):
        return None
    
    img = Image.open(image_path).convert('RGB')
    
    if not segments:
        return img
    
    # Get image dimensions
    img_width, img_height = img.size
    
    # Create a copy to draw on
    img_with_boxes = img.copy()
    draw = ImageDraw.Draw(img_with_boxes, 'RGBA')
    
    # Color mapping for categories
    color_map = {
        "bike": (0, 112, 192, 200),      # blue
        "car": (192, 0, 0, 200),         # red
        "pedestrian": (0, 192, 0, 200),  # green
        "bus": (255, 128, 0, 200),       # orange
    }
    
    # Draw bounding boxes
    for segment in segments:
        # Normalize coordinates to pixel coordinates
        # Assuming segments use normalized coordinates (0-1) or actual geo coordinates
        # For now, assuming they're in pixel ratio
        x_min = int(segment.x_min)
        x_max = int(segment.x_max)
        y_min = int(segment.y_min)
        y_max = int(segment.y_max)
        
        color = color_map.get(segment.category, (128, 128, 128, 200))
        
        # Draw rectangle with semi-transparent fill
        draw.rectangle(
            [x_min, y_min, x_max, y_max],
            outline=color[:3] + (255,),
            width=2,
            fill=color
        )
        
        # Draw label
        label = segment.category.upper()
        draw.text((x_min + 4, y_min + 4), label, fill=(255, 255, 255, 255))
    
    return img_with_boxes


def create_interactive_image_figure(image_path: str, segments: list[BBoxSegment], visible_segments: list[int] = None) -> go.Figure:
    """Create an interactive Plotly figure with image and hoverable segments.
    
    Args:
        image_path: Path to the image file
        segments: List of segments to display
        visible_segments: List of segment indices to show (if None, show all)
    """
    if not os.path.exists(image_path):
        return go.Figure()
    
    if visible_segments is None:
        visible_segments = list(range(len(segments)))
    
    img = Image.open(image_path).convert('RGB')
    img_width, img_height = img.size
    
    # Color mapping for categories
    color_map = {
        "bike": "rgb(0, 112, 192)",
        "car": "rgb(192, 0, 0)",
        "pedestrian": "rgb(0, 192, 0)",
        "bus": "rgb(255, 128, 0)",
    }
    
    # Create figure
    fig = go.Figure()
    
    # Add image as background
    fig.add_layout_image(
        dict(
            source=img,
            xref="x",
            yref="y",
            x=0,
            y=img_height,
            sizex=img_width,
            sizey=img_height,
            sizing="stretch",
            opacity=1.0,
            layer="below"
        )
    )
    
    # Add segment rectangles with hover information
    for i, segment in enumerate(segments):
        if i not in visible_segments:
            continue
            
        x_min = segment.x_min
        x_max = segment.x_max
        y_min = segment.y_min
        y_max = segment.y_max
        
        # Calculate center for hover position
        x_center = (x_min + x_max) / 2
        y_center = (y_min + y_max) / 2
        
        color = color_map.get(segment.category, "rgb(128, 128, 128)")
        
        # Add rectangle trace
        fig.add_trace(
            go.Scatter(
                x=[x_min, x_max, x_max, x_min, x_min],
                y=[y_max, y_max, y_min, y_min, y_max],
                fill="toself",
                fillcolor=color,
                opacity=0.3,
                line=dict(color=color, width=2),
                mode="lines",
                hoverinfo="text",
                hovertext=f"<b>{segment.category.upper()}</b><br>Confidence: {segment.confidence:.1%}",
                hoverlabel=dict(namelength=-1),
                showlegend=False,
                name=f"{segment.category} {i+1}"
            )
        )
    
    # Update layout
    fig.update_layout(
        title=None,
        xaxis=dict(
            showgrid=False,
            zeroline=False,
            showticklabels=False,
            range=[0, img_width]
        ),
        yaxis=dict(
            showgrid=False,
            zeroline=False,
            showticklabels=False,
            range=[0, img_height],
            scaleanchor="x",
            scaleratio=1
        ),
        hovermode="closest",
        margin=dict(l=0, r=0, t=0, b=0),
        height=360,
        width=None,
        showlegend=False,
        paper_bgcolor="white",
        plot_bgcolor="white"
    )
    
    return fig


def get_segment_legend_html() -> str:
    """Generate HTML legend for segment categories."""
    color_map = {
        "bike": "#0070C0",
        "car": "#C00000",
        "pedestrian": "#00C000",
        "bus": "#FF8000",
    }
    
    legend_html = '<div style="padding: 8px; background: #f5f5f5; border-radius: 8px;">'
    legend_html += '<b>Segment Categories:</b><br>'
    
    for category, color in color_map.items():
        legend_html += f'<span style="display: inline-block; margin-right: 12px;"><span style="display: inline-block; width: 12px; height: 12px; background: {color}; margin-right: 4px; vertical-align: middle;"></span>{category.capitalize()}</span>'
    
    legend_html += '</div>'
    return legend_html


def get_segments_table_html(segments: list[BBoxSegment], visible_segments: list[int] = None) -> str:
    """Generate HTML table for segments with visibility toggles."""
    if visible_segments is None:
        visible_segments = list(range(len(segments)))
        
    if not segments:
        return '<div style="padding: 8px; text-align: center; color: #666;">No segments detected</div>'
    
    color_map = {
        "bike": "#0070C0",
        "car": "#C00000",
        "pedestrian": "#00C000",
        "bus": "#FF8000",
    }
    
    table_html = '''<div style="padding: 8px; background: #ffffff; border-radius: 8px; overflow-x: auto;">
    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <thead>
            <tr style="background: #f5f5f5; border-bottom: 2px solid #ddd;">
                <th style="padding: 6px; text-align: center; border-right: 1px solid #ddd; width: 40px;">Show</th>
                <th style="padding: 6px; text-align: left; border-right: 1px solid #ddd;">Category</th>
                <th style="padding: 6px; text-align: center; border-right: 1px solid #ddd;">X Min</th>
                <th style="padding: 6px; text-align: center; border-right: 1px solid #ddd;">X Max</th>
                <th style="padding: 6px; text-align: center; border-right: 1px solid #ddd;">Y Min</th>
                <th style="padding: 6px; text-align: center; border-right: 1px solid #ddd;">Y Max</th>
                <th style="padding: 6px; text-align: center;">Confidence</th>
            </tr>
        </thead>
        <tbody>'''
    
    for i, segment in enumerate(segments):
        row_color = "#f9f9f9" if i % 2 == 0 else "#ffffff"
        color = color_map.get(segment.category, "#808080")
        is_visible = i in visible_segments
        checked = "checked" if is_visible else ""
        
        table_html += f'''
            <tr style="background: {row_color}; border-bottom: 1px solid #eee;">
                <td style="padding: 6px; text-align: center; border-right: 1px solid #ddd;">
                    <input type="checkbox" id="segment_{i}" {checked} style="cursor: pointer; width: 16px; height: 16px;">
                </td>
                <td style="padding: 6px; border-right: 1px solid #ddd;">
                    <span style="display: inline-block; width: 10px; height: 10px; background: {color}; margin-right: 6px; border-radius: 2px; vertical-align: middle;"></span>
                    {segment.category.capitalize()}
                </td>
                <td style="padding: 6px; text-align: center; border-right: 1px solid #ddd;">{int(segment.x_min)}</td>
                <td style="padding: 6px; text-align: center; border-right: 1px solid #ddd;">{int(segment.x_max)}</td>
                <td style="padding: 6px; text-align: center; border-right: 1px solid #ddd;">{int(segment.y_min)}</td>
                <td style="padding: 6px; text-align: center; border-right: 1px solid #ddd;">{int(segment.y_max)}</td>
                <td style="padding: 6px; text-align: center;">{segment.confidence:.0%}</td>
            </tr>'''
    
    table_html += '''
        </tbody>
    </table>
</div>'''
    return table_html


def format_metadata(idx: int) -> str:
    path, lon, lat, segments = locations[idx]
    segments_info = f"- Segments: {len(segments)}" if segments else "- Segments: None"
    return (
        f"**Image {idx + 1}**\n"
        f"- Lon: {lon:.6f}\n"
        f"- Lat: {lat:.6f}\n"
        f"- File: {path}\n"
        f"{segments_info}"
    )


def get_visible_segments(num_segments: int, visibility_state: str = None) -> list[int]:
    """Parse visibility state and return list of visible segment indices."""
    if not visibility_state or visibility_state == "":
        return list(range(num_segments))
    try:
        return json.loads(visibility_state)
    except:
        return list(range(num_segments))


def set_visibility_state(num_segments: int, visible_indices: list[int]) -> str:
    """Convert list of visible indices to JSON state."""
    return json.dumps(visible_indices)


def build_map_figure(selected_idx: int = 0) -> go.Figure:
    lons = [lon for _, lon, _, _ in locations]
    lats = [lat for _, _, lat, _ in locations]
    paths = [path for path, _, _, _ in locations]
    hover = [f"Spot {i + 1}" for i in range(len(locations))]

    marker_sizes = [18 if i == selected_idx else 12 for i in range(len(locations))]
    marker_colors = ["#f97316" if i == selected_idx else "#2563eb" for i in range(len(locations))]

    fig = go.Figure(
        go.Scattermap(
            lon=lons,
            lat=lats,
            customdata=[[i, paths[i]] for i in range(len(locations))],
            text=hover,
            mode="markers",
            marker=dict(
                size=marker_sizes,
                color=marker_colors,
                opacity=0.9,
            ),
            hovertemplate="<b>%{text}</b><br>%{customdata[1]}<extra></extra>",
        )
    )

    fig.update_layout(
        hovermode="closest",
        map=dict(
            style="open-street-map",
            center=dict(lat=lats[selected_idx], lon=lons[selected_idx]),
            zoom=14,
        ),
        margin=dict(l=0, r=0, t=0, b=0),
        height=520,
        showlegend=False,
    )

    return fig


def on_select(selected_id: str, visibility_state: str = ""):
    try:
        idx = max(0, min(len(locations) - 1, int(float(selected_id))))
    except (TypeError, ValueError):
        idx = 0

    fig = build_map_figure(idx)
    path = locations[idx][0]
    segments = locations[idx][3]
    
    # Get visible segments
    visible = get_visible_segments(len(segments), visibility_state)
    
    # Create interactive image figure with segment hover information
    hero_fig = create_interactive_image_figure(path, segments, visible)
    
    # Generate segments table
    segments_table = get_segments_table_html(segments, visible)
    
    return fig, hero_fig, segments_table, format_metadata(idx)


def bump_selection(current_id: str, delta: int, visibility_state: str = ""):
    try:
        idx = int(float(current_id))
    except (TypeError, ValueError):
        idx = 0

    idx = max(0, min(len(locations) - 1, idx + delta))
    fig, path, segments_table, meta = on_select(str(idx), visibility_state)
    return fig, path, segments_table, meta, str(idx)


APP_CSS = """
.gradio-container {
    background: radial-gradient(circle at 20% 20%, #fef3c7, #e0f2fe 45%, #ffffff 75%);
}
.hero-card {
    background: #ffffffdd;
    border: 1px solid rgba(148, 163, 184, 0.45);
    border-radius: 16px;
    padding: 12px;
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.16);
}
"""

BRIDGE_JS = """
<script>
(function attachPlotlyClickBridge() {
  const findNodes = () => ({
    plot: document.querySelector('#map_plot .js-plotly-plot'),
    hidden: document.querySelector('#selected_id textarea, #selected_id input'),
  });

  const bind = () => {
    const { plot, hidden } = findNodes();
    if (!plot || !hidden) return false;
    if (plot.dataset.bound === '1') return true;

    if (typeof plot.on === 'function') {
      plot.dataset.bound = '1';
      plot.on('plotly_click', (evt) => {
        const pt = evt && evt.points ? evt.points[0] : null;
        if (!pt) return;
        const id = pt.customdata && pt.customdata[0] !== undefined ? pt.customdata[0] : (pt.pointIndex ?? 0);
        hidden.value = String(id);
        hidden.dispatchEvent(new Event('input', { bubbles: true }));
        hidden.dispatchEvent(new Event('change', { bubbles: true }));
      });
      return true;
    }
    return false;
  };

  const observer = new MutationObserver(bind);
  observer.observe(document.body, { childList: true, subtree: true });

  const interval = setInterval(() => {
    if (bind()) {
      clearInterval(interval);
      setTimeout(() => observer.disconnect(), 4000);
    }
  }, 200);
})();
</script>
"""


VISIBILITY_TOGGLE_JS = """
<script>
(function attachVisibilityToggleBridge() {
  const findNodes = () => ({
    table: document.querySelector('#segments_table'),
    visibilityInput: document.querySelector('#visibility_state textarea, #visibility_state input'),
  });

  const updateVisibilityFromCheckboxes = () => {
    const { table, visibilityInput } = findNodes();
    if (!table || !visibilityInput) return;
    
    const checkboxes = table.querySelectorAll('input[type="checkbox"]');
    const visible = [];
    checkboxes.forEach((cb, idx) => {
      if (cb.checked) {
        visible.push(idx);
      }
    });
    
    visibilityInput.value = JSON.stringify(visible);
    visibilityInput.dispatchEvent(new Event('input', { bubbles: true }));
    visibilityInput.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const bind = () => {
    const { table } = findNodes();
    if (!table) return false;
    if (table.dataset.bound === '1') return true;

    const checkboxes = table.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
      cb.addEventListener('change', updateVisibilityFromCheckboxes);
    });
    
    table.dataset.bound = '1';
    return true;
  };

  const observer = new MutationObserver(bind);
  observer.observe(document.body, { childList: true, subtree: true });

  const interval = setInterval(() => {
    if (bind()) {
      clearInterval(interval);
      setTimeout(() => observer.disconnect(), 4000);
    }
  }, 200);
})();
</script>
"""


with gr.Blocks(title="Urban Map Gallery") as demo:
    gr.Markdown("## Amsterdam photo map\nClick a marker to preview the location photo. The first spot loads highlighted.")

    with gr.Row(equal_height=True):
        map_plot = gr.Plot(value=build_map_figure(0), show_label=False, elem_id="map_plot")

        with gr.Column(scale=1, elem_classes=["hero-card"]):
            hero_plot = gr.Plot(value=create_interactive_image_figure(locations[0][0], locations[0][3]), label="Preview")
            segments_table = gr.HTML(value=get_segments_table_html(locations[0][3]), show_label=False, elem_id="segments_table")
            gr.HTML(value=get_segment_legend_html(), show_label=False)
            hero_info = gr.Markdown(value=format_metadata(0))
            with gr.Row():
                prev_btn = gr.Button("Previous", variant="secondary")
                next_btn = gr.Button("Next", variant="primary")

    selected_id = gr.Textbox(value="0", visible=False, elem_id="selected_id")
    visibility_state = gr.Textbox(value="", visible=False, elem_id="visibility_state")
    gr.HTML(value=f"<div style='display:none'></div>{BRIDGE_JS}{VISIBILITY_TOGGLE_JS}", show_label=False)

    selected_id.change(fn=on_select, inputs=[selected_id, visibility_state], outputs=[map_plot, hero_plot, segments_table, hero_info])
    visibility_state.change(fn=on_select, inputs=[selected_id, visibility_state], outputs=[map_plot, hero_plot, segments_table, hero_info])

    prev_btn.click(fn=lambda current, vis: bump_selection(current, -1, vis), inputs=[selected_id, visibility_state], outputs=[map_plot, hero_plot, segments_table, hero_info, selected_id])
    next_btn.click(fn=lambda current, vis: bump_selection(current, 1, vis), inputs=[selected_id, visibility_state], outputs=[map_plot, hero_plot, segments_table, hero_info, selected_id])

    demo.load(fn=lambda: on_select("0", ""), inputs=None, outputs=[map_plot, hero_plot, segments_table, hero_info])

if __name__ == "__main__":
    demo.launch()