document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const mainContent = document.getElementById('main-content');
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const scrollToTopButton = document.getElementById('scroll-to-top-button');
    const batchCopyButton = document.getElementById('batch-copy-button');
    const selectionCounter = document.getElementById('selection-counter');
    const selectedCountElement = document.getElementById('selected-count');
    const toggleSelectModeBtn = document.getElementById('toggle-select-mode');
    const gridSizeButtons = document.querySelectorAll('.grid-size-btn[data-size]');
    
    let selectedIcons = [];
    let selectModeEnabled = false;
    let currentGridSize = 'medium';
    let observer;

    // 初始化 Intersection Observer
    function initLazyLoading() {
        if ('IntersectionObserver' in window) {
            observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const imgSrc = img.getAttribute('data-src');
                        
                        const newImg = new Image();
                        newImg.onload = () => {
                            img.src = imgSrc;
                            img.classList.remove('loading');
                        };
                        newImg.onerror = () => {
                            img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50" y="50" font-size="10" text-anchor="middle" alignment-baseline="middle" fill="%23999">加载失败</text></svg>';
                            img.classList.remove('loading');
                        };
                        newImg.src = imgSrc;
                        
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
        }
    }

    // 更新网格大小
    function updateGridSize(size) {
        const grids = document.querySelectorAll('.icon-grid');
        grids.forEach(grid => {
            grid.classList.remove('small', 'medium', 'large');
            grid.classList.add(size);
        });
        currentGridSize = size;
    }

    // 切换选择模式
    function toggleSelectMode() {
        selectModeEnabled = !selectModeEnabled;
        toggleSelectModeBtn.textContent = selectModeEnabled ? '关闭多选' : '开启多选';
        
        const iconItems = document.querySelectorAll('.icon-item');
        iconItems.forEach(item => {
            const checkbox = item.querySelector('.select-checkbox');
            if (selectModeEnabled) {
                if (!checkbox) {
                    const cb = document.createElement('input');
                    cb.type = 'checkbox';
                    cb.className = 'select-checkbox';
                    cb.addEventListener('change', (e) => {
                        e.stopPropagation();
                        toggleIconSelection(item, e.target.checked);
                    });
                    item.appendChild(cb);
                }
                item.style.cursor = 'pointer';
                item.addEventListener('click', (e) => {
                    // 检查是否点击的是复制按钮或复选框本身
                    if (e.target !== item.querySelector('.copy-button') && 
                        e.target !== item.querySelector('img') &&
                        e.target !== item.querySelector('.select-checkbox')) {
                        const cb = item.querySelector('.select-checkbox');
                        if (cb) {
                            cb.checked = !cb.checked;
                            toggleIconSelection(item, cb.checked);
                        }
                    }
                });
            } else {
                if (checkbox) checkbox.remove();
                item.style.cursor = 'default';
                item.classList.remove('selected');
            }
        });
        
        updateSelectionCounter();
    }

    // 切换图标选择状态
    function toggleIconSelection(item, isSelected) {
        const img = item.querySelector('img');
        const imgSrc = img.getAttribute('data-src');
        
        if (isSelected) {
            if (!selectedIcons.includes(imgSrc)) {
                selectedIcons.push(imgSrc);
                item.classList.add('selected');
            }
        } else {
            selectedIcons = selectedIcons.filter(src => src !== imgSrc);
            item.classList.remove('selected');
        }
        
        updateSelectionCounter();
    }

    // 更新选择计数器
    function updateSelectionCounter() {
        const count = selectedIcons.length;
        selectedCountElement.textContent = count;
        
        if (count > 0) {
            selectionCounter.style.display = 'block';
        } else {
            selectionCounter.style.display = 'none';
        }
    }

    // 批量复制链接
    async function batchCopyLinks() {
        if (selectedIcons.length === 0) {
            alert('请先选择要复制的图标');
            return;
        }
        
        const links = selectedIcons.map(src => new URL(src, window.location.origin).href).join('\n');
        
        try {
            await navigator.clipboard.writeText(links);
            alert(`已复制 ${selectedIcons.length} 个图标的链接到剪贴板！`);
        } catch (err) {
            console.error('批量复制失败:', err);
            alert('批量复制失败，请检查浏览器权限');
        }
    }

    // 生成图标项
    async function generateIconItems() {
        try {
            mainContent.innerHTML = '<div class="loading-indicator">正在加载图标...</div>';
            
            // 从PHP后端获取图标数据
            const response = await fetch('./get_images.php');
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.json();

            if (data.error) {
                console.error('Error from server:', data.error);
                alert('无法加载图标: ' + data.error);
                return;
            }

            mainContent.innerHTML = '';

            const categories = Object.keys(data).sort((a, b) => {
                const order = ['border-radius', 'circle', 'svg', 'pt'];
                return order.indexOf(a) - order.indexOf(b);
            });

            for (const category of categories) {
                const icons = data[category];
                if (!Array.isArray(icons)) {
                    console.error(`Expected an array of icons for category ${category} but got:`, typeof icons);
                    continue;
                }

                if (icons.length === 0) {
                    console.warn(`No icons found in the ${category} folder.`);
                    continue;
                }

                const categoryHeader = document.createElement('div');
                categoryHeader.className = 'category-header';
                
                const categoryTitle = document.createElement('h2');
                categoryTitle.id = category;
                categoryTitle.className = 'category-title';
                categoryTitle.textContent = getCategoryName(category);
                
                const categoryActions = document.createElement('div');
                categoryActions.className = 'category-actions';
                
                const downloadAllBtn = document.createElement('button');
                downloadAllBtn.className = 'category-action-btn';
                downloadAllBtn.textContent = '下载全部';
                downloadAllBtn.title = `下载${getCategoryName(category)}分类的所有图标`;
                
                categoryActions.appendChild(downloadAllBtn);
                categoryHeader.appendChild(categoryTitle);
                categoryHeader.appendChild(categoryActions);
                
                mainContent.appendChild(categoryHeader);

                const iconGrid = document.createElement('div');
                iconGrid.className = `icon-grid ${currentGridSize}`;

                for (const icon of icons) {
                    const iconName = icon.replace(/\.(png|svg|jpg|jpeg|gif)$/i, '');
                    const imgSrc = `images/${category}/${icon}`;

                    const iconItem = document.createElement('div');
                    iconItem.className = 'icon-item loading';

                    const img = document.createElement('img');
                    img.alt = iconName;
                    img.setAttribute('data-src', imgSrc);
                    img.style.opacity = '0';
                    
                    img.onload = () => {
                        img.style.transition = 'opacity 0.3s';
                        img.style.opacity = '1';
                        iconItem.classList.remove('loading');
                    };
                    
                    img.onerror = () => {
                        img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50" y="50" font-size="10" text-anchor="middle" alignment-baseline="middle" fill="%23999">加载失败</text></svg>';
                        img.style.opacity = '1';
                        iconItem.classList.remove('loading');
                    };

                    const description = document.createElement('p');
                    description.className = 'icon-description';
                    description.textContent = iconName;

                    const copyButton = document.createElement('button');
                    copyButton.className = 'copy-button';
                    copyButton.textContent = '复制链接';

                    copyButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const fullUrl = new URL(imgSrc, window.location.origin).href;
                        navigator.clipboard.writeText(fullUrl)
                            .then(() => {
                                const originalText = copyButton.textContent;
                                copyButton.textContent = '已复制';
                                setTimeout(() => {
                                    copyButton.textContent = originalText;
                                }, 1000);
                            })
                            .catch(err => {
                                console.error('无法复制文本: ', err);
                                alert('复制失败: ' + err.message);
                            });
                    });

                    iconItem.appendChild(img);
                    iconItem.appendChild(description);
                    iconItem.appendChild(copyButton);

                    iconGrid.appendChild(iconItem);

                    if (observer) {
                        observer.observe(img);
                    }
                }

                mainContent.appendChild(iconGrid);
            }
            
            if (observer) {
                document.querySelectorAll('.icon-item img[data-src]').forEach(img => {
                    observer.observe(img);
                });
            }
        } catch (error) {
            console.error('无法加载图片:', error);
            mainContent.innerHTML = `<div class="loading-indicator">加载失败: ${error.message}</div>`;
        }
    }

    function getCategoryName(category) {
        switch (category) {
            case 'border-radius': return '圆角图标';
            case 'circle': return '圆形图标';
            case 'svg': return 'SVG 图标';
            case 'pt': return 'PT 图标';
            default: return category;
        }
    }

    // 搜索功能
    searchInput.addEventListener('input', debounce(() => {
        const query = searchInput.value.toLowerCase();
        const iconItems = mainContent.querySelectorAll('.icon-item');
        
        iconItems.forEach(item => {
            const description = item.querySelector('.icon-description').textContent.toLowerCase();
            if (description.includes(query)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }, 300));

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 网格大小控制
    gridSizeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            gridSizeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateGridSize(btn.dataset.size);
        });
    });

    // 事件监听器
    themeToggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        saveThemePreference();
    });

    batchCopyButton.addEventListener('click', batchCopyLinks);
    
    toggleSelectModeBtn.addEventListener('click', toggleSelectMode);

    scrollToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopButton.style.display = 'flex';
        } else {
            scrollToTopButton.style.display = 'none';
        }
    });

    function loadThemePreference() {
        const themePreference = localStorage.getItem('theme-preference');
        if (themePreference === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }

    function saveThemePreference() {
        const isDarkTheme = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme-preference', isDarkTheme ? 'dark' : 'light');
    }

    // 初始化
    initLazyLoading();
    generateIconItems();
    loadThemePreference();
    scrollToTopButton.style.display = 'none';
    
    // 设置默认网格大小
    updateGridSize(currentGridSize);
});
