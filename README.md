ThreeThumbs is a browser driven, batched, screenshot system intended for capturing page images for use in thumbnails or web archives. It primarily consists of:

  - a client side browser automation piece capable of navigating to target pages, capturing visible content and posting the resulting images to the specified capture url
  - a node.js application which delivers the configuration data that describes which urls should be captured, as well as the url to post the captured results to
  - a node.js application which receives the posted images and stores them for thumbnail generation
  - (soon) a node.js application which generates the desired thumbnails after receiving the captured images

This package includes Silk Icons developed by Mark James and available at http://www.famfamfam.com/lab/icons/silk/ ([creativecommons 2.5](http://creativecommons.org/licenses/by/2.5/))
