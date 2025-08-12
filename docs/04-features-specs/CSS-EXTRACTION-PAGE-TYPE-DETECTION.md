# CSS Selector-Based Content Extraction & Automatic Page Type Detection

## Executive Summary

This document outlines the current state of Archon's content extraction capabilities and proposes enhancements for CSS selector-based extraction and automatic page type detection, specifically tailored for e-commerce content migration.

## Current State Analysis

### What Archon Currently Has

1. **Limited CSS Selector Usage**
   - `wait_for` selectors: Only used to wait for elements to load
   - Predefined code block selectors: Fixed selectors for code extraction
   - No user-configurable CSS extraction for structured data

2. **Crawl4AI Capabilities (Available but Unused)**
   - **JsonCssExtractionStrategy**: Powerful CSS-based extraction engine
   - **Schema-based extraction**: Define fields with CSS selectors
   - **LLM-assisted schema generation**: Auto-generate extraction schemas
   - **Multiple extraction types**: text, attribute, html, regex

### Current Limitations

- ❌ No user-defined CSS selectors for content extraction
- ❌ No automatic page type detection
- ❌ No structured data extraction (only markdown)
- ❌ No domain-specific extraction templates
- ❌ No visual selector builder

## Proposed Enhancement: CSS Selector-Based Extraction

### Overview

Integrate Crawl4AI's `JsonCssExtractionStrategy` to enable precise, structured data extraction using CSS selectors. This allows users to define exactly what content to extract from specific page elements.

### Implementation Details

#### 1. Extraction Schema Structure

```python
schema = {
    "name": "E-commerce Product Extractor",
    "baseSelector": "main.product-container",  # Container for repeating elements
    "fields": [
        {
            "name": "title",
            "selector": "h1.product-title, [itemprop='name']",
            "type": "text"
        },
        {
            "name": "price",
            "selector": ".price-now, [itemprop='price'], .product-price",
            "type": "text"
        },
        {
            "name": "original_price",
            "selector": ".price-was, .original-price",
            "type": "text"
        },
        {
            "name": "description",
            "selector": "[itemprop='description'], .product-description",
            "type": "html"
        },
        {
            "name": "images",
            "selector": ".product-gallery img, [itemprop='image']",
            "type": "attribute",
            "attribute": "src",
            "multiple": true
        },
        {
            "name": "sku",
            "selector": "[itemprop='sku'], .product-sku, #product-sku",
            "type": "text"
        },
        {
            "name": "availability",
            "selector": "[itemprop='availability'], .stock-status",
            "type": "text"
        },
        {
            "name": "brand",
            "selector": "[itemprop='brand'], .product-brand",
            "type": "text"
        },
        {
            "name": "rating",
            "selector": "[itemprop='ratingValue'], .rating-value",
            "type": "text"
        },
        {
            "name": "reviews_count",
            "selector": "[itemprop='reviewCount'], .reviews-count",
            "type": "text"
        }
    ]
}
```

#### 2. Enhanced Crawl Request Model

```python
class EnhancedCrawlRequest(BaseModel):
    url: str
    knowledge_type: str = 'general'
    tags: List[str] = []
    max_depth: int = 2
    
    # New fields for CSS extraction
    use_css_extraction: bool = False
    extraction_schema: Optional[Dict[str, Any]] = None
    extraction_template_id: Optional[str] = None  # Use pre-defined template
    detect_page_type: bool = True
    
    # CSS selector overrides
    content_selector: Optional[str] = None  # Focus on specific content area
    exclude_selectors: Optional[List[str]] = None  # Elements to exclude
```

#### 3. Database Schema Updates

```sql
-- Add extraction configuration to existing tables
ALTER TABLE crawled_pages 
ADD COLUMN extraction_schema JSONB,
ADD COLUMN extracted_data JSONB,
ADD COLUMN detected_page_type VARCHAR(50),
ADD COLUMN extraction_success BOOLEAN DEFAULT FALSE;

-- Store reusable extraction templates
CREATE TABLE extraction_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    domain_pattern VARCHAR(255),  -- e.g., "*.shopify.com"
    page_type VARCHAR(50),        -- e.g., "product", "category"
    schema JSONB NOT NULL,
    success_rate FLOAT DEFAULT 0,  -- Track effectiveness
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    is_public BOOLEAN DEFAULT FALSE
);

-- Track extraction performance
CREATE TABLE extraction_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES extraction_templates(id),
    url TEXT NOT NULL,
    success BOOLEAN,
    fields_extracted INTEGER,
    fields_expected INTEGER,
    error_message TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Feature Capabilities

#### 1. Visual Selector Builder
- Click on page elements to generate CSS selectors
- Test selectors in real-time
- Preview extracted data before saving
- Suggest alternative selectors

#### 2. Smart Selector Generation
```python
def generate_smart_selector(element):
    """Generate multiple selector options for an element"""
    selectors = []
    
    # ID selector (most specific)
    if element.id:
        selectors.append(f"#{element.id}")
    
    # Class combinations
    if element.classes:
        selectors.append(f".{'.'.join(element.classes)}")
    
    # Attribute selectors
    for attr in ['itemprop', 'data-testid', 'data-product']:
        if element.has_attr(attr):
            selectors.append(f"[{attr}='{element[attr]}']")
    
    # Hierarchical selectors
    selectors.append(generate_hierarchical_selector(element))
    
    return selectors
```

#### 3. Extraction Validation
- Validate extracted data against expected schema
- Handle missing elements gracefully
- Provide extraction success metrics
- Alert on schema breaking changes

## Proposed Enhancement: Automatic Page Type Detection

### Overview

Implement a multi-signal page type detection system that automatically identifies the type of page being scraped, enabling appropriate extraction strategies and optimizations.

### Page Types to Detect

1. **E-commerce Pages**
   - Product Detail Page
   - Category/Collection Page
   - Search Results Page
   - Cart Page
   - Checkout Page

2. **Content Pages**
   - Blog Article
   - Landing Page
   - About/Company Page
   - Contact Page
   - FAQ Page

3. **Navigation Pages**
   - Homepage
   - Sitemap
   - Navigation/Menu Page

### Detection Algorithm

```python
class PageTypeDetector:
    def __init__(self):
        self.detectors = {
            'url_pattern': URLPatternDetector(),
            'meta_tags': MetaTagDetector(),
            'schema_org': SchemaOrgDetector(),
            'content_pattern': ContentPatternDetector(),
            'dom_structure': DOMStructureDetector()
        }
    
    async def detect_page_type(self, url: str, html: str, headers: dict) -> PageTypeResult:
        """Detect page type using multiple signals"""
        
        signals = {}
        
        # 1. URL Pattern Analysis
        signals['url'] = self.detectors['url_pattern'].analyze(url)
        # Examples: /product/, /category/, /blog/, /p/, /products/
        
        # 2. Meta Tag Analysis
        signals['meta'] = self.detectors['meta_tags'].analyze(html)
        # og:type, twitter:card, page-type meta tags
        
        # 3. Schema.org Structured Data
        signals['schema'] = self.detectors['schema_org'].analyze(html)
        # @type: Product, Article, Organization, etc.
        
        # 4. Content Pattern Analysis
        signals['content'] = self.detectors['content_pattern'].analyze(html)
        # Price patterns, "Add to Cart" buttons, product galleries
        
        # 5. DOM Structure Analysis
        signals['dom'] = self.detectors['dom_structure'].analyze(html)
        # Common e-commerce class names, structure patterns
        
        # Combine signals with weights
        page_type = self.classify_with_ml(signals)
        confidence = self.calculate_confidence(signals, page_type)
        
        return PageTypeResult(
            page_type=page_type,
            confidence=confidence,
            signals=signals,
            suggested_template=self.get_template_for_type(page_type)
        )
```

### Detection Signals

#### 1. URL Pattern Signals
```python
URL_PATTERNS = {
    'product': [
        r'/product[s]?/',
        r'/p/',
        r'/item/',
        r'/.*-p-\d+',
        r'/dp/',  # Amazon
        r'/gp/product/',  # Amazon
    ],
    'category': [
        r'/category/',
        r'/categories/',
        r'/c/',
        r'/collection[s]?/',
        r'/shop/',
    ],
    'blog': [
        r'/blog/',
        r'/article[s]?/',
        r'/post[s]?/',
        r'/news/',
        r'/\d{4}/\d{2}/',  # Date patterns
    ]
}
```

#### 2. Meta Tag Signals
```python
META_SIGNALS = {
    'product': [
        ('og:type', 'product'),
        ('product:price:amount', '*'),
        ('product:availability', '*'),
    ],
    'article': [
        ('og:type', 'article'),
        ('article:published_time', '*'),
        ('article:author', '*'),
    ]
}
```

#### 3. Content Pattern Signals
```python
CONTENT_PATTERNS = {
    'product': {
        'required': ['price_element', 'add_to_cart'],
        'optional': ['product_gallery', 'reviews', 'specifications'],
        'indicators': [
            r'\$[\d,]+\.?\d*',  # Price patterns
            r'add.{0,5}to.{0,5}cart',  # Add to cart buttons
            r'buy.{0,5}now',
            r'in.{0,5}stock',
            r'out.{0,5}of.{0,5}stock',
        ]
    },
    'category': {
        'required': ['product_grid', 'pagination'],
        'optional': ['filters', 'sorting'],
        'indicators': [
            r'showing.{0,10}\d+.{0,10}of.{0,10}\d+',
            r'sort.{0,5}by',
            r'filter.{0,5}by',
        ]
    }
}
```

#### 4. DOM Structure Signals
```python
DOM_SIGNALS = {
    'product': {
        'classes': [
            'product-page', 'product-detail', 'pdp',
            'product-container', 'product-info'
        ],
        'ids': [
            'product', 'product-detail', 'pdp'
        ],
        'elements': {
            'form[action*="cart"]': 0.8,
            'button[class*="add-to-cart"]': 0.9,
            '.price, [class*="price"]': 0.7,
            '.product-image, .gallery': 0.6,
        }
    }
}
```

### Machine Learning Enhancement

```python
class PageTypeMLClassifier:
    def __init__(self):
        self.model = self.load_or_train_model()
    
    def extract_features(self, signals):
        """Convert signals to ML features"""
        features = []
        
        # URL features
        features.extend(self.encode_url_features(signals['url']))
        
        # Meta features
        features.extend(self.encode_meta_features(signals['meta']))
        
        # Content features
        features.extend(self.encode_content_features(signals['content']))
        
        # DOM features
        features.extend(self.encode_dom_features(signals['dom']))
        
        return np.array(features)
    
    def predict(self, signals):
        features = self.extract_features(signals)
        prediction = self.model.predict_proba([features])[0]
        
        return {
            'page_type': self.classes[np.argmax(prediction)],
            'confidence': float(np.max(prediction)),
            'all_probabilities': {
                cls: float(prob) 
                for cls, prob in zip(self.classes, prediction)
            }
        }
```

## Integration with Existing System

### 1. Modified Crawling Flow

```python
async def enhanced_crawl_page(self, url: str, request: EnhancedCrawlRequest):
    # Standard crawling
    result = await self.crawler.arun(url=url, config=crawl_config)
    
    # Page type detection
    if request.detect_page_type:
        page_type_result = await self.page_type_detector.detect(
            url, result.html, result.headers
        )
        
    # CSS extraction
    if request.use_css_extraction:
        # Use provided schema or auto-select based on page type
        schema = request.extraction_schema
        if not schema and page_type_result:
            schema = self.get_template_for_type(page_type_result.page_type)
        
        if schema:
            extraction_strategy = JsonCssExtractionStrategy(schema)
            extracted_data = extraction_strategy.extract(result.html)
    
    # Store everything
    return {
        'markdown': result.markdown,
        'extracted_data': extracted_data,
        'page_type': page_type_result.page_type,
        'extraction_schema': schema
    }
```

### 2. API Endpoints

```python
# Test extraction schema
@router.post("/api/extraction/test-schema")
async def test_extraction_schema(
    url: str,
    schema: Dict[str, Any]
) -> ExtractionTestResult

# Get extraction templates
@router.get("/api/extraction/templates")
async def get_extraction_templates(
    page_type: Optional[str] = None,
    domain: Optional[str] = None
) -> List[ExtractionTemplate]

# Detect page type
@router.post("/api/extraction/detect-type")
async def detect_page_type(
    url: str
) -> PageTypeResult

# Save extraction template
@router.post("/api/extraction/templates")
async def create_extraction_template(
    template: ExtractionTemplate
) -> ExtractionTemplate
```

### 3. UI Components

#### Extraction Configuration Interface
```typescript
interface ExtractionConfig {
  // Visual schema builder
  schemaBuilder: {
    preview: boolean;
    testMode: boolean;
    selectorHelper: boolean;
  };
  
  // Template management
  templates: {
    search: boolean;
    create: boolean;
    edit: boolean;
    share: boolean;
  };
  
  // Page type settings
  pageTypeDetection: {
    enabled: boolean;
    autoSelectTemplate: boolean;
    confidenceThreshold: number;
  };
}
```

## E-commerce Specific Features

### 1. Platform Detection

```python
PLATFORM_PATTERNS = {
    'shopify': {
        'indicators': [
            'cdn.shopify.com',
            'myshopify.com',
            '/cart/add.js',
            'Shopify.theme'
        ],
        'default_template': 'shopify_product_v2'
    },
    'woocommerce': {
        'indicators': [
            'woocommerce',
            'wc-ajax',
            'add-to-cart.min.js'
        ],
        'default_template': 'woocommerce_product'
    },
    'magento': {
        'indicators': [
            'mage/cookies',
            'MAGE_COOKIES',
            'magento'
        ],
        'default_template': 'magento_product'
    }
}
```

### 2. Product Variation Handling

```python
variation_schema = {
    "name": "Product Variations",
    "baseSelector": ".product-options, .variations",
    "fields": [
        {
            "name": "option_name",
            "selector": "label, .option-name",
            "type": "text"
        },
        {
            "name": "option_values",
            "selector": "select option, .swatch",
            "type": "text",
            "multiple": true
        },
        {
            "name": "price_modifier",
            "selector": "[data-price-modifier]",
            "type": "attribute",
            "attribute": "data-price-modifier"
        }
    ]
}
```

### 3. Structured Data Extraction

```python
def extract_product_structured_data(html):
    """Extract JSON-LD, Microdata, and RDFa"""
    structured_data = {
        'json_ld': extract_json_ld(html),
        'microdata': extract_microdata(html),
        'rdfa': extract_rdfa(html),
        'open_graph': extract_open_graph(html)
    }
    
    # Merge all product data
    product_data = merge_structured_data(structured_data)
    return product_data
```

## Performance Optimizations

### 1. Extraction Caching
- Cache successful extraction schemas per domain
- Store selector performance metrics
- Auto-adjust timeouts based on site performance

### 2. Parallel Extraction
```python
async def extract_batch_with_css(urls: List[str], schema: dict):
    """Extract from multiple pages in parallel"""
    tasks = []
    for url in urls:
        task = extract_with_schema(url, schema)
        tasks.append(task)
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return results
```

### 3. Incremental Learning
- Track extraction success rates
- Identify failing selectors
- Suggest selector improvements
- Auto-update templates based on success patterns

## Benefits for E-commerce Migration

1. **Precise Data Extraction**
   - Extract exactly what you need (prices, descriptions, specifications)
   - Handle complex product variations
   - Capture all product images and media

2. **Scalable Templates**
   - Create once, apply to thousands of similar pages
   - Platform-specific templates for common e-commerce systems
   - Share templates across projects

3. **Structured Output**
   - Get JSON data ready for database insertion
   - Consistent data structure across different sources
   - Easy transformation to target platform format

4. **Automatic Categorization**
   - Know what type of content you're dealing with
   - Apply appropriate extraction strategies automatically
   - Route content to correct processing pipelines

5. **Quality Assurance**
   - Validate extracted data completeness
   - Flag pages with extraction issues
   - Monitor template effectiveness over time

## Implementation Roadmap

### Phase 1: Core CSS Extraction (Week 1)
- [ ] Integrate JsonCssExtractionStrategy
- [ ] Add extraction schema to crawl requests
- [ ] Store structured data in database
- [ ] Basic API endpoints

### Phase 2: Page Type Detection (Week 1-2)
- [ ] Implement multi-signal detection
- [ ] Create detection rules engine
- [ ] Add confidence scoring
- [ ] Link to extraction templates

### Phase 3: E-commerce Templates (Week 2)
- [ ] Create product page templates
- [ ] Create category page templates
- [ ] Platform-specific adaptations
- [ ] Variation handling

### Phase 4: UI Implementation (Week 3)
- [ ] Visual schema builder
- [ ] Template management interface
- [ ] Extraction testing tools
- [ ] Performance dashboard

### Phase 5: ML Enhancement (Week 4+)
- [ ] Train page type classifier
- [ ] Implement auto-template generation
- [ ] Add extraction quality scoring
- [ ] Continuous improvement system

## Technical Considerations

### 1. Selector Robustness
- Use multiple selector strategies
- Implement fallback selectors
- Monitor selector breakage
- Auto-healing selectors

### 2. Performance Impact
- CSS extraction is faster than full rendering
- Parallel processing for bulk extraction
- Selective field extraction
- Caching strategies

### 3. Error Handling
```python
class ExtractionErrorHandler:
    def handle_missing_element(self, field, url):
        # Log missing element
        # Try fallback selectors
        # Mark as optional if consistently missing
        
    def handle_changed_structure(self, template, url):
        # Detect structural changes
        # Suggest template updates
        # Alert user to review
```

### 4. Data Validation
```python
class ExtractionValidator:
    def validate_product_data(self, data):
        validations = {
            'price': self.validate_price_format,
            'images': self.validate_image_urls,
            'title': self.validate_not_empty,
            'sku': self.validate_sku_format
        }
        
        errors = []
        for field, validator in validations.items():
            if field in data:
                if not validator(data[field]):
                    errors.append(f"Invalid {field}: {data[field]}")
        
        return errors
```

## Conclusion

Implementing CSS selector-based extraction and automatic page type detection will transform Archon from a general web scraper into a powerful, targeted content extraction system. This is particularly valuable for e-commerce migration projects where precise, structured data extraction is crucial.

The combination of:
- User-defined CSS selectors
- Automatic page type detection
- Pre-built e-commerce templates
- Machine learning enhancements

Will provide a robust, scalable solution for migrating content from any e-commerce platform while maintaining data quality and structure.