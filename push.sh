#!/bin/bash

# OpenClaw Admin - Git 推送脚本
# 使用方法：./push.sh

echo "📦 准备推送到 GitHub..."
echo ""

# 显示当前分支和提交
echo "当前分支："
git branch --show-current

echo ""
echo "待推送的提交："
git log origin/master..HEAD --oneline

echo ""
echo "⚠️  请确保已配置 GitHub 凭据"
echo ""
echo "方式 1：使用 Personal Access Token"
echo "  git remote set-url origin https://<token>@github.com/wj-whj/openclaw-admin.git"
echo ""
echo "方式 2：使用 SSH"
echo "  git remote set-url origin git@github.com:wj-whj/openclaw-admin.git"
echo ""

read -p "是否继续推送？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    git push origin master
    echo ""
    echo "✅ 推送完成！"
    echo "查看仓库：https://github.com/wj-whj/openclaw-admin"
else
    echo "❌ 已取消推送"
fi
