#!/bin/bash
set -e
echo "🚀 开始本机部署..."
if [ ! -d "dist" ]; then echo "❌ dist 不存在"; exit 1; fi
sudo rm -rf /var/www/dist/*
sudo cp -r dist/* /var/www/dist/
sudo chown -R www-data:www-data /var/www/dist
sudo chmod -R 755 /var/www/dist
sudo systemctl reload nginx
echo "✅ 部署完成"
