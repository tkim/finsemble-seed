# Styling component scrollbars #

In order to style the scrollbars displayed on a component, who's content overflows, styles must be applied to the `<HTML>` and/or `<BODY>` tags on the page. To do so you may: 
- load the example stylesheet file [scrollbarStylingStylesheet.css](./scrollbarStylingStylesheet.css) into your component. 
- apply the a preload to your component config that dynamically loads the stylesheet into the component [scrollbarStylingPreload.js](../../preloads/scrollbarStylingPreload.js). 
  - See the [example configuration](./config.json) for how to apply the preload to your component config.