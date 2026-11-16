"""Builds index.html from src/zalf.html (head part, <!--BODY--> marker, body part)."""
from pathlib import Path

head, body = Path("src/zalf.html").read_text(encoding="utf-8").split("<!--BODY-->")
Path("index.html").write_text(
    '<!DOCTYPE html>\n<html lang="ro">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    + head.strip() + "\n</head>\n<body>\n" + body.strip() + "\n</body>\n</html>\n",
    encoding="utf-8",
)
