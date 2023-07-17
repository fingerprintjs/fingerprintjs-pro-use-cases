#!/bin/bash
gist_raw_url="https://gist.githubusercontent.com/JuroUhlar/88e8cc17d3bdfd051d6cbc9b7df7e845/raw/313a180f94bc37004fd4db02ec06c4acbd3a6db9/deploymentUtils.tsx"
# Define the filename to save the content as
filename="client/DeploymentUtils.tsx"
# Download the content of the gist using curl
curl -L "$gist_raw_url" -o "$filename"
