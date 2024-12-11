document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const mainContent = document.getElementById('main-content');
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const scrollToTopButton = document.getElementById('scroll-to-top-button');

    // Function to generate icon items by category
    async function generateIconItems() {
        try {
            const response = await fetch('get_images.php');
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.json();
            console.log('Data received:', data); // Debug log

            if (data.error) {
                console.error('Error from server:', data.error);
                alert('无法加载图标: ' + data.error);
                return;
            }

            Object.keys(data).forEach(category => {
                const icons = data[category];
                if (!Array.isArray(icons)) {
                    console.error(`Expected an array of icons for category ${category} but got:`, typeof icons);
                    alert(`无法加载图标: 数据格式不正确`);
                    return;
                }

                if (icons.length === 0) {
                    console.warn(`No icons found in the ${category} folder.`);
                    return;
                }

                const categoryTitle = document.createElement('h2');
                categoryTitle.id = category; // Set ID for anchor linking
                categoryTitle.className = 'category-title';
                categoryTitle.textContent = getCategoryName(category);
                mainContent.appendChild(categoryTitle);

                const iconGrid = document.createElement('div');
                iconGrid.className = 'icon-grid';

                icons.forEach(icon => {
                    const iconName = icon.replace(/\.(png|svg)$/, '');
                    const imgSrc = `images/${category}/${icon}`;

                    const iconItem = document.createElement('div');
                    iconItem.className = 'icon-item';

                    const img = document.createElement('img');
                    img.src = imgSrc;
                    img.alt = iconName;
                    img.setAttribute('data-src', imgSrc);

                    const description = document.createElement('p');
                    description.className = 'icon-description';
                    description.textContent = iconName;

                    const copyButton = document.createElement('button');
                    copyButton.className = 'copy-button';
                    copyButton.textContent = '复制链接';

                    copyButton.addEventListener('click', () => {
                        const fullUrl = new URL(imgSrc, window.location.origin).href;
                        navigator.clipboard.writeText(fullUrl)
                            .then(() => {
                                alert('链接已复制到剪贴板: ' + fullUrl);
                            })
                            .catch(err => {
                                console.error('无法复制文本: ', err);
                            });
                    });

                    iconItem.appendChild(img);
                    iconItem.appendChild(description);
                    iconItem.appendChild(copyButton);

                    iconGrid.appendChild(iconItem);
                });

                mainContent.appendChild(iconGrid);
            });
        } catch (error) {
            console.error('无法加载图片:', error);
            alert('无法加载图片: ' + error.message);
        }
    }

    // Function to get category name based on folder name
    function getCategoryName(category) {
        switch (category) {
            case 'border-radius':
                return '圆角图标';
            case 'circle':
                return '圆形图标';
            case 'svg':
                return 'SVG 图标';
            default:
                return category;
        }
    }

    // Search functionality
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const iconItems = mainContent.querySelectorAll('.icon-item');
        iconItems.forEach(item => {
            const description = item.querySelector('.icon-description').textContent.toLowerCase();
            if (description.includes(query)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Theme toggle functionality
    themeToggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        saveThemePreference();
    });

    // Load saved theme preference
    function loadThemePreference() {
        const themePreference = localStorage.getItem('theme-preference');
        if (themePreference === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }

    // Save current theme preference
    function saveThemePreference() {
        const isDarkTheme = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme-preference', isDarkTheme ? 'dark' : 'light');
    }

    // Scroll to top functionality
    scrollToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Generate icon items on page load
    generateIconItems();

    // Load theme preference on page load
    loadThemePreference();
});



