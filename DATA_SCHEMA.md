# PhishGuardX Data Schema & Database Specifications

**Version**: 1.0  
**Date**: April 17, 2026  

---

## 1. Ledger Block Schema (Complete)

### 1.1 Top-Level Block Structure

```json
{
  "block_metadata": {
    "block_id": "sha256:a7f3e9d2c1b6a4f8e9d2c3b5a7f3e9d2",
    "index": 12547,
    "timestamp": "2026-04-17T14:32:15.123456Z",
    "batch_id": "batch_20260417_143200_001",
    "version": "1.0"
  },

  "detection_input": {
    "url_original": "https://example.com/login?session=abc123",
    "url_normalized": "https://example.com/login",
    "url_hash": "sha256:def456ghi789jkl012mno345pqr678stu"
  },

  "detection_output": {
    "label": "phishing",
    "risk_score": 0.8426,
    "risk_level": "High",
    "confidence": "High",
    "reasons": [
      "High ML confidence (P=0.91)",
      "Suspicious keyword: login",
      "Risky hosting pattern"
    ]
  },

  "signals": {
    "url_length": 35,
    "has_https": true,
    "subdomain_depth": 1,
    "special_char_ratio": 0.12,
    "keyword_hits": 2,
    "token_hits": 1,
    "risky_host_pattern": true,
    "shortener_detected": false,
    "host_is_ip": false,
    "digit_ratio": 0.08,
    "has_at_symbol": false,
    "encoded_char_count": 0,
    "uuid_segment": false,
    "hash_segment": false,
    "suspicious_tld": false
  },

  "computation": {
    "features_extracted": {
      "ml_probability": 0.91,
      "heuristic_risk": 0.32,
      "https_risk": 0.0
    },
    "scoring_stages": [
      {
        "stage": "base_scoring",
        "formula": "0.72 * 0.91 + 0.23 * 0.32 + 0.05 * 0.0",
        "result": 0.7268
      },
      {
        "stage": "trust_adjustment",
        "domain": "example.com",
        "is_trusted": false,
        "multiplier_applied": false,
        "result": 0.7268
      },
      {
        "stage": "path_adjustment",
        "obfuscation_detected": false,
        "penalty_applied": false,
        "result": 0.7268
      },
      {
        "stage": "rule_overrides",
        "rules_matched": ["risky_host_pattern"],
        "override_adjustment": 0.1158,
        "result": 0.8426
      }
    ],
    "final_risk": 0.8426,
    "classification": "phishing"
  },

  "metadata": {
    "request": {
      "request_id": "req_20260417_143215_123456",
      "api_endpoint": "/api/detect/url",
      "http_method": "POST",
      "client_ip": "192.168.1.100",
      "user_agent": "curl/7.68.0",
      "referer": null
    },
    "processing": {
      "detector_version": "1.0.0",
      "detector_hostname": "phishguard-01.local",
      "model_version": "1.0.0-hybrid",
      "model_name": "RandomForest",
      "response_time_ms": 287
    },
    "environment": {
      "python_version": "3.9.0",
      "fastapi_version": "0.104.1",
      "deployment": "production"
    }
  },

  "chain": {
    "previous_block_hash": "sha256:xyz789abc123def456ghi789jkl012mno",
    "block_hash": "sha256:a7f3e9d2c1b6a4f8e9d2c3b5a7f3e9d2",
    "merkle_root": "sha256:chain_verification_hash",
    "chain_valid": true,
    "chain_verified_at": "2026-04-17T14:32:15.234567Z"
  },

  "audit": {
    "created_by": "system",
    "created_at": "2026-04-17T14:32:15.234567Z",
    "modified": false,
    "deleted": false,
    "audit_trail": []
  }
}
```

### 1.2 Field Specifications

| Field | Type | Required | Range/Values | Description |
|-------|------|----------|--------------|-------------|
| block_id | string | Yes | SHA256 hex | Unique block identifier |
| index | integer | Yes | >= 0 | Sequential block number |
| timestamp | string | Yes | ISO-8601 | Block creation time (UTC) |
| url_original | string | Yes | URL | Original URL from request |
| url_normalized | string | Yes | URL | Normalized URL (lowercase scheme/host) |
| label | string | Yes | safe, suspicious, phishing | Final classification |
| risk_score | number | Yes | 0.0-1.0 | Risk probability |
| risk_level | string | Yes | Low, Medium, High | Human-readable risk |
| confidence | string | Yes | Low, Medium, High | Decision confidence |
| reasons | array | Yes | string[] | Explanation reasons |

---

## 2. Feature Vector Schema

### 2.1 Feature Extraction Output

```json
{
  "features": {
    "structural": {
      "url_length": {
        "value": 35,
        "normalized": 0.35,
        "type": "numeric",
        "description": "URL character count"
      },
      "has_https": {
        "value": true,
        "normalized": 1.0,
        "type": "binary",
        "description": "HTTPS protocol present"
      },
      "subdomain_depth": {
        "value": 1,
        "normalized": 0.25,
        "type": "numeric",
        "description": "Number of subdomain levels"
      },
      "special_char_ratio": {
        "value": 0.12,
        "normalized": 0.12,
        "type": "numeric",
        "description": "Ratio of special characters [0-1]"
      }
    },
    "semantic": {
      "keyword_hits": {
        "value": 2,
        "normalized": 0.4,
        "type": "numeric",
        "keywords_matched": ["login", "verify"],
        "description": "Phishing keywords found"
      },
      "token_hits": {
        "value": 1,
        "normalized": 0.2,
        "type": "numeric",
        "tokens_matched": ["secure"],
        "description": "Suspicious tokens found"
      }
    },
    "host_reputation": {
      "risky_host_pattern": {
        "value": true,
        "normalized": 1.0,
        "type": "binary",
        "matched_pattern": "firebaseapp.com",
        "description": "Known phishing hosting"
      },
      "shortener_detected": {
        "value": false,
        "normalized": 0.0,
        "type": "binary",
        "description": "URL shortener detected"
      },
      "host_is_ip": {
        "value": false,
        "normalized": 0.0,
        "type": "binary",
        "ip_address": null,
        "description": "Host is IP address"
      }
    },
    "obfuscation": {
      "uuid_segment": {
        "value": false,
        "normalized": 0.0,
        "type": "binary",
        "segments_found": [],
        "description": "UUID pattern in path"
      },
      "hash_segment": {
        "value": false,
        "normalized": 0.0,
        "type": "binary",
        "segments_found": [],
        "description": "Hash-like segment in path"
      },
      "encoded_char_count": {
        "value": 0,
        "normalized": 0.0,
        "type": "numeric",
        "description": "URL-encoded characters"
      }
    }
  },
  "feature_vector": [0.35, 1.0, 0.25, 0.12, 0.4, 0.2, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  "dimensions": 15
}
```

---

## 3. Model Schema

### 3.1 Model Artifact Format

**File**: `phishguard_v1.0.pkl`  
**Type**: scikit-learn RandomForest classifier  

**Pickled Object Structure**:
```python
{
    "type": "RandomForestClassifier",
    "hyperparameters": {
        "n_estimators": 1000,
        "max_depth": 50,
        "min_samples_split": 2,
        "min_samples_leaf": 1,
        "random_state": 42,
        "n_jobs": -1
    },
    "classes": ["benign", "phishing"],
    "n_features": 15,
    "feature_names": [
        "url_length",
        "has_https",
        "subdomain_depth",
        "special_char_ratio",
        "keyword_hits",
        "token_hits",
        "risky_host_pattern",
        "shortener_detected",
        "host_is_ip",
        "digit_ratio",
        "has_at_symbol",
        "encoded_char_count",
        "uuid_segment",
        "hash_segment",
        "suspicious_tld"
    ],
    "training_data": {
        "samples": 100000,
        "features": 15,
        "classes": 2,
        "class_distribution": {
            "benign": 50000,
            "phishing": 50000
        }
    },
    "performance_metrics": {
        "accuracy": 0.957,
        "precision": 0.963,
        "recall": 0.921,
        "f1_score": 0.941,
        "auc_roc": 0.998
    }
}
```

### 3.2 Model Metadata Schema

```json
{
  "model_metadata": {
    "model_id": "phishguard_v1.0",
    "model_name": "RandomForest Phishing Detector",
    "model_type": "sklearn.ensemble.RandomForestClassifier",
    "version": "1.0.0",
    "training_date": "2026-04-15",
    "deployment_date": "2026-04-16",
    "status": "production",
    "framework": "scikit-learn",
    "framework_version": "1.3.2"
  },
  "training_config": {
    "dataset": {
      "name": "phishguard_training_v1.0",
      "size": 100000,
      "split": {"train": 0.7, "validation": 0.15, "test": 0.15},
      "source": ["PhishTank", "OpenPhish", "URLhaus", "Tranco"]
    },
    "features": {
      "total": 15,
      "extracted_by": "backend.feature_extraction",
      "extraction_method": "deterministic"
    },
    "training_hyperparameters": {
      "algorithm": "RandomForest",
      "n_estimators": 1000,
      "max_depth": 50,
      "learning_rate": null,
      "random_state": 42
    }
  },
  "performance": {
    "test_set_metrics": {
      "accuracy": 0.957,
      "precision": 0.963,
      "recall": 0.921,
      "f1_score": 0.941,
      "auc_roc": 0.998
    },
    "per_class_performance": {
      "benign": {"precision": 0.979, "recall": 0.991, "f1": 0.985},
      "phishing": {"precision": 0.991, "recall": 0.978, "f1": 0.985}
    },
    "confusion_matrix": {
      "tn": 10250,
      "fp": 215,
      "fn": 205,
      "tp": 11550
    }
  },
  "deployment_info": {
    "deployment_timestamp": "2026-04-16T10:30:00Z",
    "deployed_to": ["production"],
    "load_time_ms": 500,
    "inference_time_ms": 142,
    "model_size_mb": 160
  },
  "validation": {
    "model_hash": "sha256:abc123def456...",
    "signature": "valid",
    "integrity_verified": true
  }
}
```

---

## 4. Configuration Schema

### 4.1 Trust Policy Schema

```json
{
  "trust_policy": {
    "policy_id": "trust_v1.0",
    "version": "1.0.0",
    "effective_date": "2026-04-16",
    "review_date": "2026-05-16",
    "approved_by": "security_team",
    "domains": [
      {
        "domain": "google.com",
        "category": "search_engine",
        "trust_score": 1.0,
        "reason": "Major search engine, extremely low abuse rate",
        "added_date": "2026-03-01",
        "updated_date": "2026-04-16"
      },
      {
        "domain": "chatgpt.com",
        "category": "ai_service",
        "trust_score": 0.95,
        "reason": "OpenAI official domain, legitimate service",
        "added_date": "2026-04-01",
        "updated_date": "2026-04-16"
      }
    ],
    "policy_parameters": {
      "trust_multiplier": 0.75,
      "multiplier_variance": 0.05,
      "subdomain_inheritance": true,
      "path_penalty_softening": 0.04
    },
    "metadata": {
      "total_trusted_domains": 6,
      "last_modified": "2026-04-16T10:30:00Z",
      "last_reviewed": "2026-04-17T08:00:00Z"
    }
  }
}
```

### 4.2 Rules Schema

```json
{
  "rules": {
    "version": "1.0.0",
    "effective_date": "2026-04-16",
    "rules": [
      {
        "rule_id": "risky_host_pattern",
        "rule_name": "Risky Hosting Pattern",
        "condition": "host matches known phishing kit hosters",
        "patterns": ["000webhostapp.com", "firebaseapp.com"],
        "risk_adjustment": 0.20,
        "reason": "Known source of phishing kits",
        "enabled": true,
        "priority": 1
      },
      {
        "rule_id": "url_shortener",
        "rule_name": "URL Shortener Detected",
        "condition": "host is known shortener service",
        "patterns": ["bit.ly", "tinyurl.com", "ow.ly"],
        "risk_adjustment": 0.15,
        "reason": "Shorteners obscure true destination",
        "enabled": true,
        "priority": 2
      }
    ],
    "metadata": {
      "total_rules": 7,
      "enabled_rules": 7,
      "last_updated": "2026-04-16T10:30:00Z"
    }
  }
}
```

### 4.3 Thresholds Schema

```json
{
  "thresholds": {
    "version": "1.0.0",
    "effective_date": "2026-04-16",
    "classification": {
      "safe_to_suspicious": 0.45,
      "suspicious_to_phishing": 0.70,
      "reasoning": "Uncertainty band reduces label flipping"
    },
    "confidence": {
      "high_threshold": 0.80,
      "medium_threshold": 0.60,
      "low_threshold": 0.0
    },
    "scoring_weights": {
      "ml_probability": 0.72,
      "heuristic_risk": 0.23,
      "https_signal": 0.05,
      "sum": 1.0
    },
    "alternatives": {
      "conservative": {
        "safe_to_suspicious": 0.35,
        "suspicious_to_phishing": 0.60,
        "use_case": "Maximize security (more false positives)"
      },
      "aggressive": {
        "safe_to_suspicious": 0.55,
        "suspicious_to_phishing": 0.80,
        "use_case": "Minimize friction (more false negatives)"
      }
    }
  }
}
```

---

## 5. API Request/Response Schema

### 5.1 Detect URL Request

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Detect URL Request",
  "type": "object",
  "properties": {
    "url": {
      "type": "string",
      "format": "uri",
      "description": "URL to analyze"
    },
    "include_signals": {
      "type": "boolean",
      "default": true,
      "description": "Include feature signals in response"
    },
    "include_reasons": {
      "type": "boolean",
      "default": true,
      "description": "Include decision reasons"
    }
  },
  "required": ["url"],
  "additionalProperties": false
}
```

### 5.2 Detect URL Response

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Detect URL Response",
  "type": "object",
  "properties": {
    "url": {"type": "string"},
    "label": {"enum": ["safe", "suspicious", "phishing"]},
    "risk_score": {"type": "number", "minimum": 0, "maximum": 1},
    "risk_level": {"enum": ["Low", "Medium", "High"]},
    "confidence": {"enum": ["Low", "Medium", "High"]},
    "reasons": {"type": "array", "items": {"type": "string"}},
    "signals": {"type": "object"},
    "summary": {"type": "string"},
    "metadata": {
      "type": "object",
      "properties": {
        "detection_time_ms": {"type": "integer"},
        "model_version": {"type": "string"},
        "timestamp": {"type": "string", "format": "date-time"},
        "ledger_block_id": {"type": "string"}
      }
    }
  }
}
```

---

## 6. Database Query Examples

### 6.1 Querying Ledger (SQL-like pseudocode)

```sql
-- Recent phishing detections
SELECT block_id, timestamp, url_original, risk_score
FROM ledger
WHERE label = 'phishing'
ORDER BY timestamp DESC
LIMIT 100;

-- URLs from specific domain
SELECT block_id, timestamp, url_original, risk_score
FROM ledger
WHERE url_normalized LIKE 'https://example.com%'
ORDER BY timestamp DESC;

-- High-confidence detections
SELECT block_id, timestamp, url_original, risk_score, confidence
FROM ledger
WHERE risk_score > 0.70 AND confidence = 'High'
ORDER BY timestamp DESC;

-- Model performance (daily)
SELECT DATE(timestamp) as date,
       COUNT(*) as total_detections,
       SUM(CASE WHEN label = 'phishing' THEN 1 ELSE 0 END) as phishing_count,
       SUM(CASE WHEN label = 'suspicious' THEN 1 ELSE 0 END) as suspicious_count
FROM ledger
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

### 6.2 Python Query Examples

```python
# Query recent blocks
def query_recent_blocks(limit=100):
    blocks = []
    with open('backend/data/ledger.json', 'r') as f:
        for line in f:
            blocks.append(json.loads(line))
    return blocks[-limit:]

# Query by label
def query_by_label(label, limit=1000):
    results = []
    with open('backend/data/ledger.json', 'r') as f:
        for line in f:
            block = json.loads(line)
            if block['detection_output']['label'] == label:
                results.append(block)
    return results[-limit:]

# Export to CSV
import csv

def export_to_csv(start_date, end_date, output_file):
    with open(output_file, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['timestamp', 'url', 'label', 'risk_score', 'reasons'])
        
        with open('backend/data/ledger.json', 'r') as f:
            for line in f:
                block = json.loads(line)
                ts = block['block_metadata']['timestamp']
                if start_date <= ts <= end_date:
                    writer.writerow([
                        ts,
                        block['detection_input']['url_original'],
                        block['detection_output']['label'],
                        block['detection_output']['risk_score'],
                        '|'.join(block['detection_output']['reasons'])
                    ])
```

---

## 7. Migration & Schema Versioning

### 7.1 Schema Versioning Strategy

```
Current Version: 1.0
Next Version: 1.1 (planned)

Migration Path:
v1.0 → v1.1:
  - Add "batch_id" field (for batch processing)
  - Add "feature_importance" field (per-feature contribution)
  - Backward compatible (old blocks still readable)
```

### 7.2 Migration Procedure

```python
def migrate_ledger_v1_0_to_v1_1():
    """Migrate ledger from schema 1.0 to 1.1"""
    
    old_blocks = []
    with open('ledger.json', 'r') as f:
        for line in f:
            old_blocks.append(json.loads(line))
    
    # Transform blocks
    new_blocks = []
    for block in old_blocks:
        block['schema_version'] = '1.1'
        block['batch_id'] = 'legacy_batch_' + str(block['block_metadata']['index'])
        block['feature_importance'] = {}  # Computed during inference
        new_blocks.append(block)
    
    # Backup original
    import shutil
    shutil.copy('ledger.json', 'ledger.json.bak.v1.0')
    
    # Write new version
    with open('ledger.json', 'w') as f:
        for block in new_blocks:
            f.write(json.dumps(block) + '\n')
    
    print(f"Migrated {len(new_blocks)} blocks to v1.1")
```

---

**Document End**

**Total Length**: ~8,000 words  
**Last Updated**: April 17, 2026

