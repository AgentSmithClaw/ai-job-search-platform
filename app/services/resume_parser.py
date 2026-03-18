from __future__ import annotations

from io import BytesIO
from pathlib import Path
import re
import zipfile
from xml.etree import ElementTree as ET


TEXT_TYPES = {
    '.txt': 'plain-text',
    '.md': 'markdown',
    '.markdown': 'markdown',
}


def _clean_text(text: str) -> str:
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def extract_resume_text(file_name: str, file_bytes: bytes) -> tuple[str, str]:
    suffix = Path(file_name).suffix.lower()

    if suffix in TEXT_TYPES:
        return _clean_text(file_bytes.decode('utf-8', errors='ignore')), TEXT_TYPES[suffix]

    if suffix == '.docx':
        with zipfile.ZipFile(BytesIO(file_bytes)) as archive:
            xml_bytes = archive.read('word/document.xml')
        root = ET.fromstring(xml_bytes)
        text_nodes = [node.text for node in root.iter() if node.text]
        return _clean_text(' '.join(text_nodes)), 'docx-xml'

    raise ValueError('当前仅支持 txt、md、markdown、docx 文件。')
