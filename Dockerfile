# 使用官方的基础镜像
FROM nginx:alpine  # 或者你使用的其他基础镜像

# 设置工作目录
WORKDIR /var/www/html

# 复制静态文件到容器内的指定位置
COPY iconweb /var/www/html

# 确保静态文件具有正确的权限
RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 755 /var/www/html

# 暴露应用监听的端口
EXPOSE 80

# 启动命令（如果使用的是Nginx，通常不需要额外命令）
CMD ["nginx", "-g", "daemon off;"]
