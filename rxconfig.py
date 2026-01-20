import reflex as rx

config = rx.Config(
    app_name="streetflex",
    plugins=[
        rx.plugins.SitemapPlugin(),
        rx.plugins.TailwindV4Plugin(),
    ]
)