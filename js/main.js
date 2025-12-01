(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Fixed Navbar
    $(window).scroll(function () {
        if ($(window).width() < 992) {
            if ($(this).scrollTop() > 45) {
                $('.fixed-top').addClass('bg-white shadow');
            } else {
                $('.fixed-top').removeClass('bg-white shadow');
            }
        } else {
            if ($(this).scrollTop() > 45) {
                $('.fixed-top').addClass('bg-white shadow').css('top', -45);
            } else {
                $('.fixed-top').removeClass('bg-white shadow').css('top', 0);
            }
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        margin: 25,
        loop: true,
        center: true,
        dots: false,
        nav: true,
        navText : [
            '<i class="bi bi-chevron-left"></i>',
            '<i class="bi bi-chevron-right"></i>'
        ],
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });

    */
    /****************************/
    (function cartModule(){
      const CART_KEY = 'orvyn_cart_v1';

      function loadCart(){
        try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
        catch(e){ return []; }
      }
      function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

      function formatPrice(n){
        return '₹' + Number(n).toFixed(2);
      }
      function parsePrice(text){
        if (!text) return 0;
        text = String(text).replace(/[^\d.,-]/g, '').replace(',', '.');
        var v = parseFloat(text);
        return isNaN(v) ? 0 : v;
      }

      function updateCartCount(){
        var cart = loadCart();
        var count = cart.reduce(function(s,it){ return s + (Number(it.qty||1)); }, 0);
        var el = document.getElementById('mini-cart-count');
        if (el) el.textContent = count;
      }

      function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }

      function renderCartModal(){
        var cart = loadCart();
        var tbody = document.getElementById('cart-items-tbody');
        var contents = document.getElementById('cart-contents');
        var empty = document.getElementById('cart-empty');
        if (!tbody || !contents || !empty) return; // modal not present

        tbody.innerHTML = '';
        if (!cart || cart.length === 0){
          contents.style.display = 'none';
          empty.style.display = 'block';
          var subEl = document.getElementById('cart-subtotal'); if (subEl) subEl.textContent = formatPrice(0);
          return;
        }
        empty.style.display = 'none';
        contents.style.display = 'block';

        var subtotal = 0;
        cart.forEach(function(item, idx){
          var price = Number(item.price) || 0;
          var qty = Number(item.qty) || 1;
          subtotal += price * qty;

          var tr = document.createElement('tr');
          tr.innerHTML = ''
            + '<td><div class="d-flex align-items-center">'
            + (item.image ? '<img src="'+escapeHtml(item.image)+'" style="width:64px;height:64px;object-fit:cover;border-radius:6px;margin-right:12px;">' : '')
            + '<div><div class="fw-semibold">'+escapeHtml(item.name)+'</div><div class="text-muted small">'+escapeHtml(item.info||'')+'</div></div>'
            + '</div></td>'
            + '<td class="text-center">'+formatPrice(price)+'</td>'
            + '<td class="text-center"><input type="number" min="1" value="'+qty+'" data-idx="'+idx+'" class="form-control form-control-sm cart-qty" style="width:70px;margin:0 auto;"></td>'
            + '<td class="text-center">'+formatPrice(price * qty)+'</td>'
            + '<td class="text-center"><button class="btn btn-sm btn-outline-danger remove-cart-item" data-idx="'+idx+'"><i class="fa fa-trash"></i></button></td>';
          tbody.appendChild(tr);
        });

        var subEl = document.getElementById('cart-subtotal'); if (subEl) subEl.textContent = formatPrice(subtotal);

        // attach listeners
        Array.prototype.forEach.call(document.querySelectorAll('.cart-qty'), function(inp){
          inp.removeEventListener('change', qtyChangeHandler);
          inp.addEventListener('change', qtyChangeHandler);
        });
        Array.prototype.forEach.call(document.querySelectorAll('.remove-cart-item'), function(btn){
          btn.removeEventListener('click', removeHandler);
          btn.addEventListener('click', removeHandler);
        });

        function qtyChangeHandler(){
          var idx = Number(this.dataset.idx);
          var v = Number(this.value); if (isNaN(v) || v < 1) v = 1;
          var cart = loadCart();
          if (cart[idx]) cart[idx].qty = v;
          saveCart(cart);
          renderCartModal();
          updateCartCount();
        }
        function removeHandler(){
          var idx = Number(this.dataset.idx);
          var cart = loadCart();
          cart.splice(idx,1);
          saveCart(cart);
          renderCartModal();
          updateCartCount();
        }
      } // renderCartModal

      function addToCart(item){
        var cart = loadCart();
        var found = cart.find(function(ci){ return ci.name === item.name && Number(ci.price) === Number(item.price); });
        if (found) found.qty = Number(found.qty||1) + Number(item.qty||1);
        else cart.push(item);
        saveCart(cart);
        updateCartCount();
        // small feedback
        var btn = document.getElementById('mini-cart-btn');
        if (btn){
          btn.classList.add('btn-success');
          setTimeout(function(){ btn.classList.remove('btn-success'); }, 300);
        }
      }

      function extractProductInfoFromButton(btn){
        var productElem = $(btn).closest('.product-item')[0];
        if (!productElem) return null;
        var nameEl = productElem.querySelector('a.d-block.h5') || productElem.querySelector('.h5') || productElem.querySelector('a');
        var name = nameEl ? nameEl.textContent.trim() : 'Product';
        var priceEl = productElem.querySelector('.text-primary');
        var price = priceEl ? parsePrice(priceEl.textContent) : 0;
        var imgEl = productElem.querySelector('img');
        var image = imgEl ? imgEl.getAttribute('src') : '';
        var infoEl = productElem.querySelector('.text-muted') || productElem.querySelector('.text-body');
        var info = infoEl ? infoEl.textContent.trim() : '';
        return { name: name, price: price, image: image, info: info, qty: 1 };
      }

      // add-to-cart detection: delegate clicks; pick anchors/buttons with text "add to cart" or an icon .fa-shopping-bag
      $(document).on('click', 'a, button', function(e){
        var el = this;
        var txt = ($(el).text() || '').trim().toLowerCase();
        var hasBagIcon = $(el).find('.fa-shopping-bag').length > 0;
        if (txt.indexOf('add to cart') !== -1 || hasBagIcon) {
          e.preventDefault();
          var info = extractProductInfoFromButton(el);
          if (!info) { alert('Product info not found'); return; }
          addToCart(info);
        }
      });

      // init mini-cart button + modal buttons (clear + checkout)
      $(document).ready(function(){
        updateCartCount();
        // open modal
        $('#mini-cart-btn').on('click', function(){
          renderCartModal();
          var modalEl = document.getElementById('cartModal');
          if (modalEl) {
            var modal = new bootstrap.Modal(modalEl);
            modal.show();
          }
        });

        $('#clear-cart').on('click', function(){
          if (!confirm('Clear the cart?')) return;
          localStorage.removeItem(CART_KEY);
          renderCartModal();
          updateCartCount();
        });

        $('#checkout-btn').on('click', function(){
          var cart = loadCart();
          if (!cart || cart.length === 0) { alert('Your cart is empty'); return; }
          var summary = 'Order summary:\\n';
          var total = 0;
          cart.forEach(function(ci){ summary += ci.name + ' x' + ci.qty + ' - ' + formatPrice(ci.price * ci.qty) + '\\n'; total += ci.price * ci.qty; });
          summary += '\\nTotal: ' + formatPrice(total);
          alert(summary + '\\n\\n(Replace this alert with a real checkout flow)');
          localStorage.removeItem(CART_KEY);
          renderCartModal();
          updateCartCount();
          var modalEl = document.getElementById('cartModal');
          var modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();
        });
      });

    })(); // cartModule end


})(jQuery);

