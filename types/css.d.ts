/**
 * CSS Module declarations
 * 
 * This file provides TypeScript declarations for CSS files imported in the application.
 */

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module 'leaflet/dist/leaflet.css' {
  const content: any;
  export default content;
} 