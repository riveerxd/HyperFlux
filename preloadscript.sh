#!/bin/bash

urls=(
  "http://localhost:3000/"
  "http://localhost:3000/login"
  "http://localhost:3000/register"
)

for url in "${urls[@]}"; do
  curl -X GET "$url"
  echo -e "\n"
done

