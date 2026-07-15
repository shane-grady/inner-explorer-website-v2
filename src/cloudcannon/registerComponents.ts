// Loaded only inside CloudCannon's Visual Editor (see BaseLayout.astro).
// Shared-data changes can affect links, active-state markup, and responsive copies,
// so re-render the whole component instead of updating text nodes in isolation.
import { registerAstroComponent } from '@cloudcannon/editable-regions/astro';
import Header from '../components/layout/Header.astro';
import Footer from '../components/layout/Footer.astro';

registerAstroComponent('site-header', Header);
registerAstroComponent('site-footer', Footer);
