"""ADR-0001 F2a test helper: validate 3MF model XML files against the 3MF core schema (lxml / libxml2).
Usage: python3 validate_model.py model1.xml [model2.xml ...]; prints one JSON line per file and exits 1 on any failure."""
import json, os, sys
from lxml import etree
here = os.path.dirname(os.path.abspath(__file__))
schema = etree.XMLSchema(etree.parse(os.path.join(here, '3mf-core-2015-02.xsd')))
parser = etree.XMLParser(huge_tree=True, resolve_entities=False, no_network=True)
bad = 0
for path in sys.argv[1:]:
    doc = etree.parse(path, parser)
    ok = schema.validate(doc)
    errors = [str(e) for e in schema.error_log][:5]
    bad += not ok
    print(json.dumps({'file': path, 'valid': ok, 'errors': errors}))
sys.exit(1 if bad else 0)
