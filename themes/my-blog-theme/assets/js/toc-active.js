document.addEventListener('DOMContentLoaded', () => {
    const selectors = {
        headings: '.post-description h2, .post-description h3, .post-description h4',
        tocLinks: '.toc-nav a'
    };
    
    const elements = {
        headings: document.querySelectorAll(selectors.headings),
        tocLinks: document.querySelectorAll(selectors.tocLinks)
    };
    
    if (elements.headings.length === 0 || elements.tocLinks.length === 0) return;
    
    const SCROLL_OFFSET = 100;
    
    const getCurrentVisibleHeading = () => {
        const scrollPosition = window.scrollY + SCROLL_OFFSET;
        
        for (const heading of elements.headings) {
            const sectionTop = heading.offsetTop;
            const sectionBottom = sectionTop + heading.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                return heading.id;
            }
        }
        return '';
    };
    
    const updateActiveToc = () => {
        const currentId = getCurrentVisibleHeading();
        
        elements.tocLinks.forEach(link => {
            const isActive = link.getAttribute('href') === `#${currentId}`;
            link.classList.toggle('active', isActive);
        });
    };
    
    const events = ['scroll', 'resize'];
    events.forEach(event => window.addEventListener(event, updateActiveToc));
    
    updateActiveToc();
});

