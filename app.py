import streamlit as st
import pydeck
import pandas as pd

col1, col2 = st.columns(2)

with col1:
    st.header("col1")

    capitals = pd.read_csv(
        "capitals.csv",
        header=0,
        names=[
            "Capital",
            "State",
            "Abbreviation",
            "Latitude",
            "Longitude",
            "Population",
        ],
    )
    capitals["size"] = capitals.Population / 10

    point_layer = pydeck.Layer(
        "ScatterplotLayer",
        data=capitals,
        id="capital-cities",
        get_position=["Longitude", "Latitude"],
        get_color="[255, 75, 75]",
        pickable=True,
        auto_highlight=True,
        get_radius="size",
    )

    view_state = pydeck.ViewState(
        latitude=40, longitude=-117, controller=True, zoom=2.4, pitch=30
    )

    chart = pydeck.Deck(
        point_layer,
        initial_view_state=view_state,
        tooltip={"text": "{Capital}, {Abbreviation}\nPopulation: {Population}"},
    )
    event = st.pydeck_chart(chart, on_select="rerun", selection_mode="single-object")

with col2:
    st.header("col2")

    try:
        selection = event.selection.objects['capital-cities'][0]["Capital"]
        st.header(selection)
        if selection == "Phoenix":
            st.image("phoenix.jpg")

    except:
        "No selection"

import streamlit as st
import plotly.graph_objects as go
from PIL import Image

image = Image.open("phoenix.jpg")
w, h = image.size

fig = go.Figure()

# Background image
fig.add_layout_image(
    dict(
        source=image,
        x=0,
        y=0,
        sizex=w,
        sizey=h,
        xref="x",
        yref="y",
        layer="below"
    )
)

# Add segments
segments = [
    {
        "id": 1,
        "label": "Person",
        "confidence": 0.92,
        "polygon": [(100, 50), (140, 80), (130, 120), (90, 100)]
    },
    {
        "id": 2,
        "label": "Car",
        "confidence": 0.87,
        "polygon": [(200, 150), (280, 150), (300, 200), (220, 210)]
    }
]
for seg in segments:
    xs = [p[0] for p in seg["polygon"]] + [seg["polygon"][0][0]]
    ys = [p[1] for p in seg["polygon"]] + [seg["polygon"][0][1]]

    fig.add_trace(
        go.Scatter(
            x=xs,
            y=ys,
            fill="toself",
            mode="lines",
            opacity=0.5,
            name=seg["label"],
            hovertemplate=(
                f"<b>{seg['label']}</b>"
                f"ID: {seg['id']}"
                f"Confidence: {seg['confidence']:.2f}<extra></extra>"
            )
        )
    )

fig.add_selection(x0=10, y0=6.5, x1=505, y1=30)

fig.update_layout(
    width=800,
    height=800,
    xaxis=dict(range=[0, w], visible=False),
    yaxis=dict(range=[h, 0], visible=False),
    margin=dict(l=0, r=0, t=0, b=0),
)

selected = st.plotly_chart(fig, use_container_width=True)
selected

# if selected and selected['points']:
#     seg_id = selected['points'][0]['curveNumber']
#     st.json(segments[seg_id])
