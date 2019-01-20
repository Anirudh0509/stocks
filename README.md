# stocks
A portfolio tracking API implemented which allows adding/deleting/updating trades and can do basic return calculations


1. Adding trades​ for a security, and updating the portfolio accordingly.
2. Updating a trade​ , and updating the portfolio accordingly.
3. Removing a trade​ from a portfolio.
4. Fetching portfolio​ : Response should include all the securities and trades corresponding to it.
5. Fetching holdings​ : It is an aggregate view of all securities in the portfolio with its final quantity and average buy price.
6. Fetching returns​ : This is something new which needs explanation. Please refer to the
                       final table above after we place sell orders for WIPRO. This API call should respond with
                       cumulative returns at any point of time of a particular portfolio.
