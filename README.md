# stocks
A portfolio tracking API implemented which allows adding/deleting/updating trades and can do basic return calculations


1. Adding trades​ for a security, and updating the portfolio accordingly.
2. Updating a trade​ , and updating the portfolio accordingly.
3. Removing a trade​ from a portfolio.
4. Fetching portfolio​ : Response should include all the securities and trades corresponding to it.
5. Fetching holdings​ : It is an aggregate view of all securities in the portfolio with its final quantity and average buy price.
6. Fetching returns​ : This API call should respond with cumulative returns at any point of time of a particular portfolio.
                       
IMPORTANT FEATURES - 

- Using Redis Caching system
- Using Node cluster system - The cluster can handle a large volume of requests with multi-core systems. And automatically,   this will increase the performance of your server.
- Using NODE.JS, EXPRESS.JS, MONGODB, REDIS, POSTMAN.
- Two database tables portfolio that has all the securities & security_transactions that logs and enters every activity.
