ThreeThumbs - A system consisting of:
  - a client side browser automation piece capable of navigating to target pages, capturing visible content and posting the results to the output url. 
  - a node.js application capable of delivering the target pages to acquire as well as storing the captured results

In its current form the client application has hard coded logic and data for the urls to hit and post to. This implementation detail should be decoupled and changed to a model where the client navigates to a url on the node.js piece that lists packages detailing the pages to collect and the target url to post the results to. This would allow provide the flexibility originally envisioned but not tackeled in the first iteration.