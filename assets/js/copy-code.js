(function() {
  // Add copy buttons to all code blocks
  document.addEventListener('DOMContentLoaded', function() {
    // Find all pre elements (code blocks)
    const codeBlocks = document.querySelectorAll('pre');
    
    codeBlocks.forEach(function(pre) {
      // Create copy button
      const button = document.createElement('button');
      button.className = 'copy-code-btn';
      button.setAttribute('aria-label', 'Copy code to clipboard');
      
      // Create image element
      const img = document.createElement('img');
      img.src = '/assets/images/copy.png';
      img.alt = 'Copy';
      img.className = 'copy-icon';
      button.appendChild(img);
      
      // Update button position on scroll
      function updateButtonPosition() {
        button.style.right = (8 - pre.scrollLeft) + 'px';
      }
      
      // Listen to scroll events
      pre.addEventListener('scroll', updateButtonPosition);
      
      // Add click handler
      button.addEventListener('click', function() {
        // Get the code content
        const code = pre.querySelector('code') || pre;
        const text = code.textContent;
        
        // Copy to clipboard
        navigator.clipboard.writeText(text).then(function() {
          // Show success feedback
          button.classList.add('copied');
          img.style.opacity = '0.5';
          
          // Reset after 0.5 second
          setTimeout(function() {
            button.classList.remove('copied');
            img.style.opacity = '1';
          }, 500);
        }).catch(function(err) {
          console.error('Failed to copy code:', err);
        });
      });
      
      // Add button to pre element
      pre.style.position = 'relative';
      pre.appendChild(button);
    });
  });
})();
