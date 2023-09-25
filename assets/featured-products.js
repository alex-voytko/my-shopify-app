document.querySelectorAll('li.featured-product-item').forEach(item => {
    const ctaBtnRef = item.querySelector('button.cta-btn');
    const variantsRef = item.querySelector('[name="select-variant"]');
    ctaBtnRef.addEventListener('click', () => {
        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];

        const formData = new FormData(this.form);
        formData.append('quantity', 1);
        formData.append('form_type', 'product');
        formData.append('sections', item.closest('section.featured-products').id);
        formData.append('sections_url', item.dataset.productUrl);
        formData.append('product-id', item.id);
        formData.append('id', item.dataset.variantId);
        config.body = formData;

        fetch(`${routes.cart_add_url}`, config)
            .then((response) => response.json())
            .then(() => updateCart(item))
            .catch((e) => {
                console.error(e);
            });
    })
    if (variantsRef) {
        variantsRef.addEventListener('change', (e) => {
            const selectedVariantId = e.target.selectedOptions[0].dataset.id;
            const productRef = e.target.closest('.featured-product-item');
            const sectionRef = e.target.closest('section.featured-products');
            fetch(`${productRef.dataset.productUrl}?variant=${selectedVariantId}&section_id=${sectionRef.id}`)
                .then((response) => response.text())
                .then((responseText) => {
                    const html = new DOMParser().parseFromString(responseText, 'text/html');
                    updatePrice(productRef.id, html, productRef);
                })
                .catch((e) => {
                    console.error(e);
                })
        })
    }
})
function updatePrice(productId, html, product) {
    const incomingProductRef = html.getElementById(productId);
    product.querySelector(`button.cta-btn`).innerHTML = incomingProductRef.querySelector(`button.cta-btn`).innerHTML;
    product.dataset.variantId = incomingProductRef.dataset.variantId;
    const selectRef = product.querySelector('[name="select-variant"]');
    const incomingSelectRef = incomingProductRef.querySelector('[name="select-variant"]');
    selectRef.dataset.selectedId = incomingSelectRef.dataset.selectedId;
    selectRef.dataset.selectedTitle = incomingSelectRef.dataset.selectedTitle;
}
function updateCart(productRef) {
    fetch(routes.cart_url)
        .then((response) => response.text())
        .then((responseText) => {
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            const incomingCartRef = html.getElementsByTagName('cart-items')[0];
            const incomingCartFooterRef = html.getElementById('main-cart-footer');
            const cartRef = document.getElementsByTagName('cart-items')[0].parentNode;
            const cartFooterRef = document.getElementById('main-cart-footer');
            const headerIconRef = document.querySelector('header #cart-icon-bubble');
            cartRef.lastElementChild.insertAdjacentElement('beforebegin', incomingCartRef);
            cartRef.lastElementChild.remove();
            cartFooterRef.insertAdjacentElement('afterend', incomingCartFooterRef);
            cartFooterRef.remove();
            headerIconRef.innerHTML = html.getElementById('cart-icon-bubble').innerHTML;
            window.scrollTo({top: 0, behavior: "smooth"});
            productRef.classList.add('hidden');
        })
        .catch((e) => {
            console.error(e);
        })
}