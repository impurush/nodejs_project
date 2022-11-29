# nodejs_project
The project consists Express JS, Node JS and MongoDB
 index.js
 - signup
    It checks the database whether the user exists or not. If the user does not exists, then it will save the user in database and route to login page.

 - login
    It will check the database whether the user exists and check the password is matching, then it will allow to the landing page

 - landing page
    It has 2 options, update the password and logout.
    Update the password routes the user to updatepass
    Logout to route the login page and clear the cookies.

 - updatepass
    It will check the current password matching with database, then checks the current and new password are not same, then checks the new password and repeat password are same. If all the checks are passed, then it will update the password in the database, then route to the landing page again.

 - logout
    It routes to login page and clear the cookies.