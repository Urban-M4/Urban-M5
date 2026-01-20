import reflex as rx
import plotly.express as px
import pandas as pd
import plotly.graph_objects as go


class MapState(rx.State):

    figure: go.Figure = go.Figure()
    sites: pd.DataFrame = pd.DataFrame(
        {
            "image_id": [
                "image1",
                "image2",
            ],
            "lat": [
                52.37392060409755,
                52.3839206,
            ],
            "lon": [
                4.8652831787467505,
                4.835283178,
            ],
            "key": [
                "3885217971610669",
                "1003443928084349",
            ],
        }
    )

    @rx.event
    def create_figure(self):
        self.figure = px.scatter_map(
            self.sites,
            lat="lat",
            lon="lon",
            hover_name="image_id",
            color_discrete_sequence=["fuchsia"],
            zoom=10,
        )

        self.figure.update_layout(
            mapbox_style="open-street-map",
            margin={
                "r": 0,
                "t": 100,
                "l": 0,
                "b": 0,
            },
        )

    @rx.event
    def get_image(self, args: list[dict]):
        idx = args[0]["pointIndex"]
        print(f"==[ image key: {self.sites.iloc[idx]['key']}")


def index() -> rx.Component:
    return rx.center(
        rx.plotly(
            data=MapState.figure,
            on_mount=MapState.create_figure,
            on_click=MapState.get_image,
        ),
    )


app = rx.App()
app.add_page(index)
