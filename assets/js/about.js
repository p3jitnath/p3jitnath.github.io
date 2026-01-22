(function(){
  function showSection(id){
    var sections = Array.from(document.querySelectorAll('.about-section'));
    var links = Array.from(document.querySelectorAll('.about-nav a'));
    sections.forEach(function(s){
      var isActive = s.getAttribute('data-section') === id;
      s.classList.toggle('active', isActive);
    });
    links.forEach(function(l){
      var isActive = (l.getAttribute('href') === ('#'+id));
      l.classList.toggle('active', isActive);
      if(isActive) l.setAttribute('aria-current','true'); else l.removeAttribute('aria-current');
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    var links = Array.from(document.querySelectorAll('.about-nav a'));
    links.forEach(function(link){
      link.addEventListener('click', function(e){
        e.preventDefault();
        var target = this.getAttribute('href').replace(/^#/, '');
        showSection(target);
        // update hash without scrolling
        if(history.replaceState) history.replaceState(null, null, '#'+target);
        // align the section header with the left nav (keep same vertical position)
        alignActiveHeader({behavior: 'smooth'});
      });
    });

    // make external links inside the about content open in a new tab
    var contentLinks = Array.from(document.querySelectorAll('.about-content a'));
    contentLinks.forEach(function(a){
      var href = a.getAttribute('href');
      if(!href) return;
      // treat absolute http(s) links as external
      if(/^https?:\/\//i.test(href)){
        // avoid changing existing targets for anchors that explicitly opt out
        if(!a.getAttribute('target')) a.setAttribute('target','_blank');
        // ensure security best-practices
        var rel = a.getAttribute('rel') || '';
        if(rel.indexOf('noopener') === -1 || rel.indexOf('noreferrer') === -1){
          a.setAttribute('rel','noopener noreferrer');
        }
      }
    });

    // helper: align the active section's header with the left nav top
    function alignActiveHeader(opts){
      opts = opts || {behavior: 'auto'};
      var active = document.querySelector('.about-section.active');
      // prefer the active link position (more accurate than nav container top)
      var activeLink = document.querySelector('.about-nav a.active') || document.querySelector('.about-nav a[aria-current="true"]');
      if(!active || !activeLink) return;
      var header = active.querySelector('h1, h2, h3');
      if(!header) return;

      // run alignment in next frame so layout settles
      requestAnimationFrame(function(){
        var linkTop = activeLink.getBoundingClientRect().top;
        var headerTop = header.getBoundingClientRect().top;
        // account for header's top margin which can push its visual text down
        var headerStyle = window.getComputedStyle(header);
        var marginTop = parseFloat(headerStyle.marginTop) || 0;
        var delta = (headerTop - linkTop) - marginTop;
        // only scroll if there's a noticeable offset
        if(Math.abs(delta) > 1){
          window.scrollBy({top: delta, left: 0, behavior: opts.behavior || 'auto'});
        }
      });
    }

    // initial: check hash or default to first active section
    var initial = location.hash && location.hash.replace('#','');
    if(!initial){
      // find the section that has 'active' class in the HTML
      var activeSection = document.querySelector('.about-section.active');
      if(activeSection){
        initial = activeSection.getAttribute('data-section');
      }
    }
    if(initial){
      showSection(initial);
      // mark corresponding nav link as active
      var activeLink = document.querySelector('.about-nav a[href="#'+initial+'"]');
      if(activeLink) activeLink.classList.add('active');
    }
    // align on load (no smooth scroll)
    alignActiveHeader({behavior: 'auto'});
  });
})();
