#!/bin/bash

# Vue3 前端项目部署脚本
# 作者: AI Assistant
# 日期: 2026-01-28

set -e  # 遇到错误立即退出

echo "🚀 开始部署 Vue3 前端项目到生产服务器..."
echo "================================================"

# 服务器配置
SERVER_USER="ubuntu"
SERVER_HOST="168.138.5.55"
SERVER_PATH="/var/www"
BACKUP_DIR="/var/www/dist.bac"
SSH_ALIAS="oracle555"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 dist 目录是否存在
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ dist 目录不存在，请先执行 npm run build${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} 找到 dist 目录"

# 1. 在服务器上备份旧版本
echo ""
echo "📦 步骤 1/4: 备份服务器上的旧版本..."
ssh ${SSH_ALIAS} "
    if [ -d ${SERVER_PATH}/dist ]; then
        sudo rm -rf ${BACKUP_DIR}
        sudo mv ${SERVER_PATH}/dist ${BACKUP_DIR}
        echo '旧版本已备份到 ${BACKUP_DIR}'
    else
        echo '没有找到旧版本，跳过备份'
    fi
"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} 备份完成"
else
    echo -e "${RED}❌ 备份失败${NC}"
    exit 1
fi

# 2. 上传新版本到服务器
echo ""
echo "📤 步骤 2/4: 上传文件到服务器..."
rsync -avz --progress \
    --exclude='.*' \
    --exclude='node_modules' \
    dist/ ${SSH_ALIAS}:/tmp/dist_upload/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} 文件上传完成"
else
    echo -e "${RED}❌ 上传失败${NC}"
    exit 1
fi

# 3. 移动文件到正确位置
echo ""
echo "📁 步骤 3/4: 部署文件到 /var/www/dist..."
ssh ${SSH_ALIAS} "
    sudo mkdir -p ${SERVER_PATH}/dist
    sudo rm -rf ${SERVER_PATH}/dist/*
    sudo mv /tmp/dist_upload/* ${SERVER_PATH}/dist/
    sudo chown -R www-data:www-data ${SERVER_PATH}/dist
    sudo chmod -R 755 ${SERVER_PATH}/dist
    rm -rf /tmp/dist_upload
"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} 文件部署完成"
else
    echo -e "${RED}❌ 部署失败，正在回滚...${NC}"
    # 回滚
    ssh ${SSH_ALIAS} "
        if [ -d ${BACKUP_DIR} ]; then
            sudo rm -rf ${SERVER_PATH}/dist
            sudo mv ${BACKUP_DIR} ${SERVER_PATH}/dist
            echo '已回滚到旧版本'
        fi
    "
    exit 1
fi

# 4. 重启 Nginx
echo ""
echo "🔄 步骤 4/4: 重启 Nginx..."
ssh ${SSH_ALIAS} "sudo systemctl reload nginx"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Nginx 已重启"
else
    echo -e "${YELLOW}⚠${NC} Nginx 重启可能失败，请手动检查"
fi

echo ""
echo "================================================"
echo -e "${GREEN}✅ 部署完成！${NC}"
echo ""
echo "📍 访问地址:"
echo "   🌐 https://www.huabenwuxin.com"
echo ""
echo "📝 备份位置:"
echo "   📦 ${BACKUP_DIR}"
echo ""
echo "💡 如需回滚，执行:"
echo "   ssh ${SSH_ALIAS} \"sudo rm -rf ${SERVER_PATH}/dist && sudo mv ${BACKUP_DIR} ${SERVER_PATH}/dist && sudo systemctl reload nginx\""
echo ""
