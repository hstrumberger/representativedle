#!/usr/bin/env python3
"""
Download portraits of all current US House Representatives from YAML source
"""
import yaml
import urllib.request
import os
from pathlib import Path

# 1. Setup - Create output directory
output_dir = Path("representative_portraits")
output_dir.mkdir(exist_ok=True)

# 2. Load YAML data
yaml_file = "legislators-current.yaml"

try:
    print(f"Loading {yaml_file}...")
    with open(yaml_file, "r") as f:
        # Using SafeLoader is best practice for YAML
        legislators = yaml.load(f, Loader=yaml.SafeLoader)
except FileNotFoundError:
    print(f"Error: '{yaml_file}' not found.")
    exit(1)
except Exception as e:
    print(f"Error parsing YAML: {e}")
    exit(1)

# 3. Filter for current Representatives
# We look at the last entry in the 'terms' list to check current status
reps = [
    leg for leg in legislators 
    if leg.get("terms") and leg["terms"][-1]["type"] == "rep"
]

print(f"Found {len(reps)} current Representatives")

# 4. Configuration
base_url = "https://unitedstates.github.io/images/congress/original"
downloaded = 0
failed = []
metadata = []

# 5. Process and Download
for rep in reps:
    bioguide_id = rep["id"]["bioguide"]
    name_info = rep.get("name", {})
    full_name = name_info.get("official_full", f"{name_info.get('first')} {name_info.get('last')}")
    
    # Get details from the most recent term
    last_term = rep["terms"][-1]
    state = last_term.get("state")
    district = last_term.get("district")
    party = last_term.get("party")

    # Image handling
    image_url = f"{base_url}/{bioguide_id}.jpg"
    output_file = output_dir / f"{bioguide_id}.jpg"

    try:
        print(f"Downloading {full_name} ({party}-{state})...", end=" ")
        # Add a User-Agent header to avoid being blocked by some CDNs
        req = urllib.request.Request(
            image_url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        
        with urllib.request.urlopen(req) as response, open(output_file, 'wb') as out_file:
            out_file.write(response.read())
            
        downloaded += 1
        print("✓")
    except Exception as e:
        print(f"✗ Failed: {e}")
        failed.append({"name": full_name, "bioguide": bioguide_id, "error": str(e)})

    # Build metadata list
    metadata.append({
        "bioguide_id": bioguide_id,
        "name": full_name,
        "first_name": name_info.get("first", ""),
        "last_name": name_info.get("last", ""),
        "state": state,
        "district": district,
        "party": party,
        "image_file": f"{bioguide_id}.jpg"
    })

# 6. Summary and Save Metadata (JSON is usually better for metadata portability)
print(f"\n{'='*60}")
print(f"Downloaded: {downloaded}/{len(reps)} portraits")

metadata_path = output_dir / "representatives_metadata.json"
import json
with open(metadata_path, "w") as f:
    json.dump(metadata, f, indent=2)

print(f"\nMetadata saved to {metadata_path}")