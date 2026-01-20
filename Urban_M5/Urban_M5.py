"""Geocoded image segmentation and classification viewer."""

import reflex as rx
from reflex_resizable_panels import resizable_panels as rzp
import json
import os
from typing import Any, Dict, List
import plotly.graph_objects as go


class State(rx.State):
    """The app state for image segmentation viewer."""
    
    images: List[Dict[str, Any]] = []
    categories: Dict[str, Dict[str, str]] = {}
    selected_image_idx: int = 0
    map_center_lon: float = 4.9
    map_center_lat: float = 52.37
    
    def load_data(self):
        """Load images and categories from assets/data/index.json."""
        try:
            json_path = os.path.join(os.path.dirname(__file__), "..", "assets", "data", "index.json")
            with open(json_path, "r") as f:
                data = json.load(f)
                self.images = data.get("images", [])
                self.categories = data.get("categories", {})
                
                # Calculate map center from images
                if self.images:
                    lons = [img["longitude"] for img in self.images]
                    lats = [img["latitude"] for img in self.images]
                    self.map_center_lon = sum(lons) / len(lons)
                    self.map_center_lat = sum(lats) / len(lats)
        except Exception as e:
            print(f"Error loading data: {e}")
    
    def select_image(self, idx: int):
        """Select an image by index."""
        if 0 <= idx < len(self.images):
            self.selected_image_idx = idx
            img = self.images[idx]
            self.map_center_lon = img["longitude"]
            self.map_center_lat = img["latitude"]
    
    @rx.var
    def current_image(self) -> Dict[str, Any]:
        """Get the currently selected image."""
        if 0 <= self.selected_image_idx < len(self.images):
            return self.images[self.selected_image_idx]
        return {}
    
    @rx.var
    def current_segments(self) -> List[Dict[str, Any]]:
        """Get segments of the currently selected image."""
        return self.current_image.get("segments", [])
    
    @rx.var
    def dominant_category(self) -> str:
        """Get dominant category for current image."""
        if self.current_segments:
            return self.current_segments[0].get("category", "")
        return ""
    
    @rx.var
    def map_figure(self) -> go.Figure:
        """Generate the plotly map figure from current data."""
        if not self.images:
            return go.Figure().add_annotation(text="No images loaded")
        
        lons = [img["longitude"] for img in self.images]
        lats = [img["latitude"] for img in self.images]
        
        fig = go.Figure(
            go.Scattermap(
                mode="markers",
                lon=lons,
                lat=lats,
                marker=dict(size=12, color=["#FF0000"] * len(self.images)),
                text=[img["image"] for img in self.images],
                hoverinfo="text",
            )
        )
        
        fig.update_layout(
            map=dict(
                style="open-street-map",
                center=dict(lon=self.map_center_lon, lat=self.map_center_lat),
                zoom=13,
            ),
            margin=dict(l=0, r=0, t=0, b=0),
            hovermode="closest",
        )
        
        return fig
    
    @rx.var
    def indexed_images(self) -> List[Dict[str, Any]]:
        """Return images with index and segment count attached for easier table iteration."""
        return [{"index": i, "segment_count": len(img.get("segments", [])), **img} for i, img in enumerate(self.images)]


def map_panel() -> rx.Component:
    """Top-left panel: Interactive map with image markers."""
    return rzp.panel(
        rx.cond(
            State.images != [],
            rx.plotly(data=State.map_figure),
            rx.box("No images loaded", padding="2em", text_align="center"),
        ),
        min_size=20,
        default_size=50,
    )


def images_table_panel() -> rx.Component:
    """Top-right panel: Table of all images with metadata."""
    return rzp.panel(
        rx.box(
            rx.heading("Images", size="2", margin_bottom="1em"),
            rx.cond(
                State.images != [],
                rx.table.root(
                    rx.table.header(
                        rx.table.row(
                            rx.table.column_header_cell("Image"),
                            rx.table.column_header_cell("Latitude"),
                            rx.table.column_header_cell("Longitude"),
                            rx.table.column_header_cell("Segments"),
                        )
                    ),
                    rx.table.body(
                        rx.foreach(
                            State.indexed_images,
                            lambda img: rx.table.row(
                                rx.table.cell(img["image"]),
                                rx.table.cell(f"{img['latitude']:.5f}"),
                                rx.table.cell(f"{img['longitude']:.5f}"),
                                rx.table.cell(str(img["segment_count"])),
                                on_click=lambda idx=img["index"]: State.select_image(idx),
                                _hover={"background_color": rx.color("blue", 3), "cursor": "pointer"},
                            ),
                        )
                    ),
                ),
                rx.box("No images", padding="2em"),
            ),
            padding="1em",
            overflow_y="auto",
        ),
        min_size=20,
        default_size=50,
    )


def segmented_image_panel() -> rx.Component:
    """Bottom-left panel: Image with segmentation overlays."""
    return rzp.panel(
        rx.box(
            rx.cond(
                State.current_image != {},
                rx.box(
                    rx.image(
                        src=f"/data/{State.current_image['image']}",
                        max_width="100%",
                        height="auto",
                    ),
                    rx.html(
                        """
                        <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">
                        </svg>
                        """
                    ),
                    position="relative",
                    width="100%",
                    height="100%",
                ),
                rx.box("Select an image", padding="2em", text_align="center"),
            ),
            padding="1em",
            overflow="auto",
            width="100%",
            height="100%",
        ),
        min_size=20,
        default_size=50,
    )


def segments_table_panel() -> rx.Component:
    """Bottom-right panel: Table of segments for current image."""
    return rzp.panel(
        rx.box(
            rx.heading("Segments", size="2", margin_bottom="1em"),
            rx.cond(
                State.current_segments != [],
                rx.table.root(
                    rx.table.header(
                        rx.table.row(
                            rx.table.column_header_cell("Category"),
                            rx.table.column_header_cell("Confidence"),
                            rx.table.column_header_cell("X Min"),
                            rx.table.column_header_cell("X Max"),
                            rx.table.column_header_cell("Y Min"),
                            rx.table.column_header_cell("Y Max"),
                        )
                    ),
                    rx.table.body(
                        rx.foreach(
                            State.current_segments,
                            lambda seg: rx.table.row(
                                rx.table.cell(seg["category"]),
                                rx.table.cell(f"{seg['confidence']:.2f}"),
                                rx.table.cell(str(seg["x_min"])),
                                rx.table.cell(str(seg["x_max"])),
                                rx.table.cell(str(seg["y_min"])),
                                rx.table.cell(str(seg["y_max"])),
                            ),
                        )
                    ),
                ),
                rx.box("No segments", padding="2em"),
            ),
            padding="1em",
            overflow_y="auto",
        ),
        min_size=20,
        default_size=50,
    )


def grid_layout() -> rx.Component:
    """2x2 grid layout with map, images table, segmented image, and segments table."""
    return rx.box(
        rzp.group(
            # TOP ROW: Map + Images Table
            rzp.panel(
                rzp.group(
                    map_panel(),
                    rzp.handle(),
                    images_table_panel(),
                    direction="horizontal",
                ),
                default_size=50,
            ),
            rzp.handle(),
            # BOTTOM ROW: Segmented Image + Segments Table
            rzp.panel(
                rzp.group(
                    segmented_image_panel(),
                    rzp.handle(),
                    segments_table_panel(),
                    direction="horizontal",
                ),
                default_size=50,
            ),
            direction="vertical",
        ),
        width="100%",
        height="100%",
    )


def index() -> rx.Component:
    """Main page component."""
    return rx.box(
        grid_layout(),
        height="100vh",
        on_mount=State.load_data,
    )


app = rx.App()
app.add_page(index)
