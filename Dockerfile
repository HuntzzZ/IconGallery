# 使用官方PHP Apache镜像作为基础镜像
FROM php:7.4-apache

# 安装json扩展（如果未预装）
RUN docker-php-ext-install json


# 将iconweb目录下的应用代码复制到容器内的/var/www/html
COPY iconweb /var/www/html

# 设置Apache文档根目录为项目根目录
ENV APACHE_DOCUMENT_ROOT /var/www/html

# 修改Apache配置以适应新的文档根目录
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 启用mod_rewrite模块（如果你需要URL重写功能的话）
RUN a2enmod rewrite

# 暴露80端口
EXPOSE 80

# 配置默认索引文件
RUN echo "DirectoryIndex index.php index.html" >> /etc/apache2/mods-enabled/dir.conf

# 确保图片目录存在并具有正确的权限
RUN mkdir -p /var/www/html/images/border-radius && \
    mkdir -p /var/www/html/images/circle && \
    mkdir -p /var/www/html/images/svg && \
    chmod -R 755 /var/www/html/images

# 启动Apache
CMD ["apache2-foreground"]
