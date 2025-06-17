#!/bin/sh
set -e  # exit on error

echo "Running create_admin.py..."
python scripts/create_admin.py

echo "Running seed_data.py..."
python scripts/seed_data.py

echo "All scripts completed successfully."
