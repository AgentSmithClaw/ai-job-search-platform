from __future__ import annotations

from io import BytesIO
import logging
import re
import subprocess
import tempfile
from pathlib import Path
import zipfile
from xml.etree import ElementTree as ET


TEXT_TYPES = {
    '.txt': 'plain-text',
    '.md': 'markdown',
    '.markdown': 'markdown',
}

MAX_PDF_SIZE_MB = 10

logger = logging.getLogger(__name__)


def _clean_text(text: str) -> str:
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def _extract_from_docx(file_bytes: bytes) -> str:
    with zipfile.ZipFile(BytesIO(file_bytes)) as archive:
        xml_bytes = archive.read('word/document.xml')
    root = ET.fromstring(xml_bytes)
    text_nodes = [node.text for node in root.iter() if node.text]
    return _clean_text(' '.join(text_nodes))


def _extract_from_pdf(file_bytes: bytes) -> str:
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > MAX_PDF_SIZE_MB:
        raise ValueError(f"PDF 文件过大（{size_mb:.1f}MB），请上传不超过 {MAX_PDF_SIZE_MB}MB 的文件。")

    text = _extract_pdf_plumber(file_bytes)
    if text and len(text) >= 20:
        return text

    text = _extract_pdf_miner(file_bytes)
    if text and len(text) >= 20:
        return text

    text = _extract_pdf_ocr(file_bytes)
    if text and len(text) >= 20:
        return text

    raise ValueError(
        'PDF 文件中未提取到可读文本，可能是扫描件或图片型 PDF。'
        '请尝试：(1) 将 PDF 另存为文字型 PDF；(2) 上传 Word 格式简历。'
    )


def _extract_pdf_plumber(file_bytes: bytes) -> str:
    try:
        import pdfplumber
        text_parts = []
        with pdfplumber.open(BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
        return _clean_text('\n'.join(text_parts))
    except Exception as exc:
        logger.debug(f"pdfplumber extraction failed: {exc}")
        return ''


def _extract_pdf_miner(file_bytes: bytes) -> str:
    try:
        from pdfminer.high_level import extract_text
        return _clean_text(extract_text(BytesIO(file_bytes)))
    except Exception as exc:
        logger.debug(f"pdfminer extraction failed: {exc}")
        return ''


def _extract_pdf_ocr(file_bytes: bytes) -> str:
    try:
        import pypdfium2 as pdfium
        import PIL.Image
        import pytesseract

        images = []
        with pdfium.PdfDocument(file_bytes) as pdf:
            for page_number in range(len(pdf)):
                page = pdf[page_number]
                bitmap = page.render(scale=2.0, rotation=0)
                pil_image = bitmap.to_pil()
                text = pytesseract.image_to_string(pil_image, lang='eng+chi')
                if text:
                    images.append(text)
                pil_image.close()
                bitmap.close()

        return _clean_text('\n'.join(images))
    except ImportError:
        try:
            images = _pdf_to_images_fallback(file_bytes)
            if not images:
                return ''
            text_parts = []
            for img_bytes in images:
                img = PIL.Image.open(BytesIO(img_bytes))
                text = subprocess.run(
                    ['tesseract', '-', '-', '-l', 'eng+chi', '--psm', '6'],
                    input=img_bytes, capture_output=True, timeout=30
                ).stdout.decode('utf-8', errors='ignore')
                if text:
                    text_parts.append(text)
                img.close()
            return _clean_text('\n'.join(text_parts))
        except Exception as exc:
            logger.debug(f"OCR extraction failed: {exc}")
            return ''
    except Exception as exc:
        logger.debug(f"OCR extraction failed: {exc}")
        return ''


def _pdf_to_images_fallback(file_bytes: bytes) -> list[bytes]:
    try:
        import pypdfium2 as pdfium
        images = []
        with pdfium.PdfDocument(file_bytes) as pdf:
            for page_number in range(len(pdf)):
                page = pdf[page_number]
                bitmap = page.render(scale=2.0, rotation=0)
                img_byte_arr = BytesIO()
                pil_image = bitmap.to_pil()
                pil_image.save(img_byte_arr, format='PNG')
                images.append(img_byte_arr.getvalue())
                pil_image.close()
                bitmap.close()
        return images
    except Exception as exc:
        logger.debug(f"pypdfium2 rendering failed: {exc}")
        return []


def extract_resume_text(file_name: str, file_bytes: bytes) -> tuple[str, str]:
    suffix = Path(file_name).suffix.lower()

    if suffix in TEXT_TYPES:
        return _clean_text(file_bytes.decode('utf-8', errors='ignore')), TEXT_TYPES[suffix]

    if suffix == '.docx':
        return _extract_from_docx(file_bytes), 'docx-xml'

    if suffix == '.pdf':
        return _extract_from_pdf(file_bytes), 'pdf-multi'

    raise ValueError('当前仅支持 txt、md、markdown、docx、pdf 文件。')
