### Costume HTTP client ( similar to axios )
---
despite the fact that axios is build on the top of node js internal api fetching and xml requests (note : Axios was build before fetch existed in JS). I decided to build a fetch wrapper but hvaing the features and work flow similar to axios. The features i have been able to add here is: <br >

1. Decent error handling
2. Timeout functionality : Implemented using the AbortController() in the fetch
3. Interceptors
4. Time-duration take in the req-res cycle (very good for developers)
5. costume headers 

I am planning to pulish it into NPM packages.