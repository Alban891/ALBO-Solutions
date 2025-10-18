/**
 * Sections Index
 * Aggregates all section render functions
 */

import { renderSection1 } from './section-1.js';
import { renderSection2 } from './section-2.js';
import { renderSection3 } from './section-3.js';
import { renderSection4 } from './section-4.js';
import { renderSection5 } from './section-5.js';
import { renderSection6 } from './section-6.js';
import { renderSection7 } from './section-7.js';
import { renderSection8 } from './section-8.js';

/**
 * Render all sections
 */
export function renderAllSections(geschaeftsmodell) {
  return `
    ${renderSection1(geschaeftsmodell)}
    ${renderSection2(geschaeftsmodell)}
    ${renderSection3(geschaeftsmodell)}
    ${renderSection4(geschaeftsmodell)}
    ${renderSection5(geschaeftsmodell)}
    ${renderSection6(geschaeftsmodell)}
    ${renderSection7(geschaeftsmodell)}
    ${renderSection8(geschaeftsmodell)}
    
    <!-- Additional Notes -->
    <div class="form-section" style="margin-top: 32px;">
      <h4>📝 Zusätzliche Notizen</h4>
      <div class="form-group">
        <textarea 
          id="gm-notizen" 
          rows="4" 
          placeholder="Weitere Anmerkungen zum Geschäftsmodell..."
        >${geschaeftsmodell.notizen || ''}</textarea>
      </div>
    </div>
  `;
}

export {
  renderSection1,
  renderSection2,
  renderSection3,
  renderSection4,
  renderSection5,
  renderSection6,
  renderSection7,
  renderSection8
};

// Export additional functions from sections
export { addCustomStream } from './section-5.js';
export { addFeature } from './section-7.js';