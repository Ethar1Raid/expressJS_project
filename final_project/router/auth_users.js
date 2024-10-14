const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
  let userswithsamename = users.filter((user) => {
      return user.username === username;
  });
  if (userswithsamename.length > 0) {
      return true;
  } else {
      return false;
  }
}

const authenticatedUser = (username,password)=>{ 
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });

  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password){
    res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)){
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60*60 });

    req.session.authorization = { accessToken, username };

    
    res.status(200).send("User successfully logged in!");
  } else {
    res.status(208).json({ message: "Invalid login! Please check username and password" });
  }

});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;  // ISBN from the URL parameter
  const { review } = req.body;  // Review from the request body
  const { username } = req.session.authorization || {};  // Retrieve username from session

  if (!username) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  const book = Object.values(books).find(book => book.isbn === isbn);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!book.reviews) {
    book.reviews = {};
  }

  book.reviews[username] = review;

  return res.status(200).json({
    message: "Review successfully posted or updated",
    reviews: book.reviews
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;  // ISBN from the URL parameter
  const { username } = req.session.authorization || {};  // Retrieve username from session

  // Check if user is logged in
  if (!username) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  // Find the book by ISBN
  const book = Object.values(books).find(book => book.isbn === isbn);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user has posted a review
  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "Review not found for the user" });
  }

  // Delete the review
  delete book.reviews[username];

  return res.status(200).json({
    message: "Review successfully deleted",
    reviews: book.reviews
  });
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
