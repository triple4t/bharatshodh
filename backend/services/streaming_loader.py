"""
Streaming PDF Loader for enterprise-grade document ingestion.

Handles PDFs of any size (300MB+, 1000+ pages) with:
- PyMuPDF (better Unicode/Hindi support than pypdf)
- OCR fallback for scanned/image-based PDFs (optional)
- Page-by-page streaming
- Graceful error handling
"""

import fitz  # PyMuPDF - Better Unicode support
from typing import Iterator, Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)

# Optional OCR support
try:
    import pytesseract
    from pdf2image import convert_from_path
    from PIL import Image
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False
    logger.warning("OCR libraries not available")


class StreamingPDFLoader:
    """Stream-process large PDFs with Unicode/Hindi support and OCR fallback."""
    
    def __init__(
        self,
        batch_size: int = 20,
        max_pages: Optional[int] = None,
        use_ocr: bool = False,
        ocr_lang: str = 'hin+eng'
    ):
        self.batch_size = batch_size
        self.max_pages = max_pages
        self.use_ocr = use_ocr and OCR_AVAILABLE
        self.ocr_lang = ocr_lang
        
    def _extract_text_with_ocr(self, file_path: str, page_num: int) -> str:
        """Extract text using OCR (for scanned PDFs)."""
        try:
            images = convert_from_path(
                file_path,
                first_page=page_num + 1,
                last_page=page_num + 1,
                dpi=300
            )
            
            if not images:
                return ""
            
            text = pytesseract.image_to_string(
                images[0],
                lang=self.ocr_lang,
                config='--psm 6'
            )
            
            return text.strip()
        except Exception as e:
            logger.error(f"OCR failed for page {page_num + 1}: {e}")
            return ""
        
    def load_pages(self, file_path: str) -> Iterator[Dict[str, Any]]:
        """Stream pages from PDF using PyMuPDF."""
        doc = None
        try:
            doc = fitz.open(file_path)
            total_pages = len(doc)
            
            if self.max_pages:
                total_pages = min(total_pages, self.max_pages)
            
            logger.info(f"📄 Streaming {total_pages} pages from {file_path} (PyMuPDF)")
            
            for page_num in range(total_pages):
                try:
                    page = doc[page_num]
                    text = page.get_text("text", sort=True)
                    
                    if not text or len(text.strip()) < 10:
                        if self.use_ocr:
                            logger.info(f"Page {page_num + 1} has minimal text, trying OCR...")
                            ocr_text = self._extract_text_with_ocr(file_path, page_num)
                            
                            if ocr_text and len(ocr_text.strip()) >= 10:
                                text = ocr_text
                                logger.info(f"✅ OCR extracted {len(text)} chars from page {page_num + 1}")
                                
                                yield {
                                    'page_num': page_num + 1,
                                    'text': text,
                                    'error': None,
                                    'ocr_used': True
                                }
                                continue
                        
                        logger.warning(f"⚠️ Page {page_num + 1} has no extractable text")
                        yield {
                            'page_num': page_num + 1,
                            'text': '',
                            'error': f"No extractable text",
                            'ocr_used': False
                        }
                        continue
                    
                    yield {
                        'page_num': page_num + 1,
                        'text': text,
                        'error': None,
                        'ocr_used': False
                    }
                    
                except Exception as e:
                    logger.warning(f"⚠️ Failed to extract page {page_num + 1}: {e}")
                    yield {
                        'page_num': page_num + 1,
                        'text': '',
                        'error': str(e),
                        'ocr_used': False
                    }
                    
        except Exception as e:
            logger.error(f"❌ Fatal error reading PDF {file_path}: {e}")
            raise
        finally:
            if doc:
                doc.close()
            
    def load_in_batches(self, file_path: str) -> Iterator[List[Dict[str, Any]]]:
        """Load pages in batches for incremental processing."""
        batch = []
        batch_num = 0
        
        for page_data in self.load_pages(file_path):
            batch.append(page_data)
            
            if len(batch) >= self.batch_size:
                batch_num += 1
                logger.info(f"📦 Yielding batch {batch_num} ({len(batch)} pages)")
                yield batch
                batch = []
        
        if batch:
            batch_num += 1
            logger.info(f"📦 Yielding final batch {batch_num} ({len(batch)} pages)")
            yield batch
            
    def get_total_pages(self, file_path: str) -> int:
        """Get total page count without loading full PDF."""
        try:
            doc = fitz.open(file_path)
            total = len(doc)
            doc.close()
            return total
        except Exception as e:
            logger.error(f"Error reading PDF metadata: {e}")
            return 0
