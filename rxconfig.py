import reflex as rx

config = rx.Config(
    app_name="Urban_M5",
    plugins=[
        rx.plugins.SitemapPlugin(),
        rx.plugins.TailwindV4Plugin(),
    ]
)