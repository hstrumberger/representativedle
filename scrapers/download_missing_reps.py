#!/usr/bin/env python3
"""
Try to download missing Representative portraits from the Congressional Bioguide
"""
import urllib.request
from pathlib import Path

# List of Bioguide IDs and Names that failed in previous output
missing_reps = [
    ("V000137", "Beth Van Duyne"),
    ("L000596", "Anna Paulina Luna"),
    ("M001217", "Jared Moskowitz"),
    ("J000309", "Jonathan L. Jackson"),
    ("J000307", "John James"),
    ("L000598", "Michael Lawler"),
    ("L000601", "Greg Landsman"),
    ("M001219", "Max L. Miller"),
    ("L000602", "Summer L. Lee"),
    ("K000403", "Timothy M. Kennedy"),
    ("F000480", "Vince Fong"),
    ("R000620", "Michael A. Rulli"),
    ("M001235", "LaMonica McIver"),
    ("W000829", "Tony Wied"),
    ("F000481", "Cleo Fields"),
    ("B001326", "Nicholas J. Begich III"),
    ("F000479", "Shomari Figures"),
    ("A000381", "Yassamin Ansari"),
    ("H001099", "Abraham J. Hamadeh"),
    ("S001231", "Lateefah Simon"),
    ("G000585", "Adam Gray"),
    ("L000604", "Sam T. Liccardo"),
    ("W000828", "George Whitesides"),
    ("R000621", "Luz M. Rivas"),
    ("F000482", "Laura Friedman"),
    ("T000491", "Derek Tran"),
    ("M001234", "Dave Min"),
    ("H001101", "Jeff Hurd"),
    ("C001138", "Jeff Crank"),
    ("E000301", "Gabe Evans"),
    ("M001230", "Sarah McBride"),
    ("H001103", "Mike Haridopolos"),
    ("J000311", "Brian Jack"),
    ("S001233", "Jefferson Shreve"),
    ("M001232", "Mark B. Messmer"),
    ("S001234", "Derek Schmidt"),
    ("O000176", "Johnny Olszewski, Jr."),
    ("E000302", "Sarah Elfreth"),
    ("D000636", "April McClain Delaney"),
    ("B001327", "Tom Barrett"),
    ("M001236", "Kristen McDonald Rivet"),
    ("M001233", "Kelly Morrison"),
    ("B001328", "Wesley Bell"),
    ("O000177", "Robert F. Onder, Jr."),
    ("K000404", "Kimberlyn King-Hinds"),
    ("D000637", "Troy Downing"),
    ("M001237", "Addison P. McDowell"),
    ("H001105", "Mark Harris"),
    ("H001106", "Pat Harrigan"),
    ("K000405", "Brad Knott"),
    ("M001238", "Tim Moore"),
    ("F000483", "Julie Fedorchak"),
    ("G000603", "Maggie Goodlander"),
    ("C001139", "Herbert C. Conaway, Jr."),
    ("P000621", "Nellie Pou"),
    ("G000604", "Laura Gillen"),
    ("L000605", "George Latimer"),
    ("R000622", "Josh Riley"),
    ("M001239", "John W. Mannion"),
    ("T000492", "David J. Taylor"),
    ("D000638", "Maxine Dexter"),
    ("B001329", "Janelle S. Bynum"),
    ("M001240", "Ryan Mackenzie"),
    ("B001330", "Robert P. Bresnahan, Jr."),
    ("H001107", "Pablo José Hernández"),
    ("G000605", "Craig A. Goldman"),
    ("G000606", "Brandon Gill"),
    ("J000313", "Julie Johnson"),
    ("K000406", "Mike Kennedy"),
    ("M001241", "John J. McGuire III"),
    ("V000138", "Eugene Simon Vindman"),
    ("S001235", "Suhas Subramanyam"),
    ("B001331", "Michael Baumgartner"),
    ("R000623", "Emily Randall"),
    ("M001242", "Riley M. Moore")
]

output_dir = Path("representative_portraits")
output_dir.mkdir(exist_ok=True)

# Headers to prevent 403 Forbidden errors
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

print(f"Attempting to download {len(missing_reps)} missing portraits from bioguide.congress.gov...\n")

downloaded = 0
failed_list = []

for bioguide_id, name in missing_reps:
    # Bioguide photo URL structure: /photo/FIRST_LETTER_OF_ID/FULL_ID.jpg
    image_url = f"https://bioguide.congress.gov/bioguide/photo/{bioguide_id[0]}/{bioguide_id}.jpg"
    output_file = output_dir / f"{bioguide_id}.jpg"

    try:
        print(f"Downloading {name} ({bioguide_id})...", end=" ")
        
        req = urllib.request.Request(image_url, headers=headers)
        with urllib.request.urlopen(req) as response, open(output_file, 'wb') as out_file:
            out_file.write(response.read())
            
        print("✓")
        downloaded += 1
    except Exception as e:
        print(f"✗ Failed: {e}")
        failed_list.append((bioguide_id, name))

# Final Report
print(f"\n{'='*60}")
print(f"Recovery complete.")
print(f"Successfully downloaded: {downloaded}/{len(missing_reps)}")

if failed_list:
    print(f"\nStill missing ({len(failed_list)}):")
    for b_id, name in failed_list:
        print(f"  - {name} ({b_id})")
else:
    print("\nAll targeted portraits recovered!")

print(f"\nImages are located in: {output_dir.absolute()}")