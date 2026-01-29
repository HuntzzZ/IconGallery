FROM php:8.1-apache

# 设置工作目录
WORKDIR /var/www/html

# 复制应用文件
COPY . /var/www/html/

# 设置正确的权限
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# 安装必要的扩展（如果需要）
RUN docker-php-ext-install mysqli

# 启用Apache rewrite模块
RUN a2enmod rewrite

# 暴露端口
EXPOSE 80

# 启动Apache
CMD ["apache2-foreground"]
