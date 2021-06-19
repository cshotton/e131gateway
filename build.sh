#!/bin/bash
echo "Starting docker build..."
docker build -t e131gateway .
docker tag e131gateway:latest home.shotton.us:5443/e131gateway:latest
docker push home.shotton.us:5443/e131gateway:latest
echo "Built docker version."