(function() {
  'use strict';

  let climateData = null;

  // Load HadCRUT5 data from CSV
  async function loadClimateData() {
    try {
      const response = await fetch('/assets/data/HadCRUT5.annual.global.mean.22012026.csv');
      const text = await response.text();
      
      // Parse CSV
      const lines = text.trim().split('\n');
      const data = [];
      
      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        const year = parseInt(cols[0]);
        const anomaly = parseFloat(cols[1]);
        
        if (!isNaN(year) && !isNaN(anomaly)) {
          data.push({
            year: year,
            anomaly: anomaly
          });
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error loading climate data:', error);
      throw error;
    }
  }

  // Color scale based on temperature anomaly
  function getColor(anomaly) {
    // Color palette from blue (cold) to red (warm)
    const colors = [
      { temp: -0.7, color: '#08306b' },  // Dark blue
      { temp: -0.5, color: '#2171b5' },
      { temp: -0.3, color: '#4292c6' },
      { temp: -0.1, color: '#6baed6' },
      { temp: 0.0, color: '#c6dbef' },   // Light blue/white
      { temp: 0.1, color: '#fee090' },   // Light yellow
      { temp: 0.3, color: '#fc8d59' },   // Orange
      { temp: 0.5, color: '#e34a33' },
      { temp: 0.7, color: '#d73027' },   // Red
      { temp: 1.0, color: '#67001f' }    // Dark red
    ];

    // Find the two nearest colors and interpolate
    let lower = colors[0];
    let upper = colors[colors.length - 1];
    
    for (let i = 0; i < colors.length - 1; i++) {
      if (anomaly >= colors[i].temp && anomaly <= colors[i + 1].temp) {
        lower = colors[i];
        upper = colors[i + 1];
        break;
      }
    }

    // Linear interpolation between colors
    const ratio = (anomaly - lower.temp) / (upper.temp - lower.temp);
    return interpolateColor(lower.color, upper.color, ratio);
  }

  function interpolateColor(color1, color2, ratio) {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    
    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);
    
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  function drawClimateStripes(startYear, endYear) {
    const container = document.getElementById('climate-stripes-container');
    
    if (!climateData) {
      container.innerHTML = '<div class="climate-error">Climate data not loaded.</div>';
      return;
    }
    
    // Filter by year range
    const filteredData = climateData.filter(d => d.year >= startYear && d.year <= endYear);
    
    // Create SVG
    const width = container.offsetWidth || 800;
    const height = 200;
    const stripeWidth = width / filteredData.length;
    
    let svg = `<svg class="climate-stripes" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    
    // Draw each stripe
    filteredData.forEach((d, i) => {
      const x = i * stripeWidth;
      const color = getColor(d.anomaly);
      svg += `<rect x="${x}" y="0" width="${stripeWidth}" height="${height}" fill="${color}" />`;
    });
    
    svg += '</svg>';
    
    container.innerHTML = svg;
    
    // Add legend below stripes
    container.innerHTML += `
      <div class="climate-legend" style="margin-top: 10px;">
        <span>Cooler</span>
        <div class="legend-gradient"></div>
        <span>Warmer</span>
      </div>
    `;
    
    // Add info about current selection
    const avgAnomaly = filteredData.reduce((sum, d) => sum + d.anomaly, 0) / filteredData.length;
    const recent3yr = filteredData.slice(-3).reduce((sum, d) => sum + d.anomaly, 0) / 3;
    const recent5yr = filteredData.slice(-5).reduce((sum, d) => sum + d.anomaly, 0) / 5;
    const recent10yr = filteredData.slice(-10).reduce((sum, d) => sum + d.anomaly, 0) / 10;
    const latestYear = filteredData[filteredData.length - 1];
    const previousYear = filteredData.length > 1 ? filteredData[filteredData.length - 2] : null;
    
    container.innerHTML += `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 20px;">
        <div style="background: #f5f5f5; border-radius: 6px; padding: 16px; text-align: center;">
          <div style="font-size: 1.2rem; color: #666; margin-bottom: 8px;">Period Average</div>
          <div style="font-size: 1.8rem; font-weight: bold; color: #333;">${avgAnomaly.toFixed(3)}°C</div>
          <div style="font-size: 1.2rem; color: #999; margin-top: 4px;">${startYear}–${endYear}</div>
        </div>
        <div style="background: #f5f5f5; border-radius: 6px; padding: 16px; text-align: center;">
          <div style="font-size: 1.2rem; color: #666; margin-bottom: 8px;">3-Year Average</div>
          <div style="font-size: 1.8rem; font-weight: bold; color: #333;">${recent3yr.toFixed(3)}°C</div>
          <div style="font-size: 1.2rem; color: #999; margin-top: 4px;">Recent</div>
        </div>
        <div style="background: #f5f5f5; border-radius: 6px; padding: 16px; text-align: center;">
          <div style="font-size: 1.2rem; color: #666; margin-bottom: 8px;">5-Year Average</div>
          <div style="font-size: 1.8rem; font-weight: bold; color: #333;">${recent5yr.toFixed(3)}°C</div>
          <div style="font-size: 1.2rem; color: #999; margin-top: 4px;">Recent</div>
        </div>
        <div style="background: #f5f5f5; border-radius: 6px; padding: 16px; text-align: center;">
          <div style="font-size: 1.2rem; color: #666; margin-bottom: 8px;">10-Year Average</div>
          <div style="font-size: 1.8rem; font-weight: bold; color: #333;">${recent10yr.toFixed(3)}°C</div>
          <div style="font-size: 1.2rem; color: #999; margin-top: 4px;">Recent</div>
        </div>
        ${previousYear ? `
        <div style="background: #f5f5f5; border-radius: 6px; padding: 16px; text-align: center;">
          <div style="font-size: 1.2rem; color: #666; margin-bottom: 8px;">Previous Year</div>
          <div style="font-size: 1.8rem; font-weight: bold; color: #333;">${previousYear.anomaly.toFixed(3)}°C</div>
          <div style="font-size: 1.2rem; color: #999; margin-top: 4px;">${previousYear.year}</div>
        </div>
        ` : ''}
        <div style="background: #f5f5f5; border-radius: 6px; padding: 16px; text-align: center;">
          <div style="font-size: 1.2rem; color: #666; margin-bottom: 8px;">Latest Year</div>
          <div style="font-size: 1.8rem; font-weight: bold; color: #333;">${latestYear.anomaly.toFixed(3)}°C</div>
          <div style="font-size: 1.2rem; color: #999; margin-top: 4px;">${latestYear.year}</div>
        </div>
      </div>
    `;
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', async function() {
    const periodSelect = document.getElementById('period-select');
    const container = document.getElementById('climate-stripes-container');
    
    try {
      container.innerHTML = '<div class="climate-loading">Loading HadCRUT5 data...</div>';
      
      // Load real data
      climateData = await loadClimateData();
      
      function updateStripes() {
        const period = periodSelect.value.split('-');
        const startYear = parseInt(period[0]);
        const endYear = parseInt(period[1]);
        
        try {
          drawClimateStripes(startYear, endYear);
        } catch (error) {
          container.innerHTML = 
            '<div class="climate-error">Error generating climate stripes. Please try again.</div>';
          console.error('Climate stripes error:', error);
        }
      }
      
      // Event listeners
      periodSelect.addEventListener('change', updateStripes);
      
      // Initial draw
      updateStripes();
      
      // Redraw on window resize
      let resizeTimer;
      window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateStripes, 250);
      });
      
    } catch (error) {
      container.innerHTML = '<div class="climate-error">Failed to load climate data. Please refresh the page.</div>';
      console.error('Failed to load climate data:', error);
    }
  });
})();
