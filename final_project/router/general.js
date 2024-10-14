const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if(username && password){
    if (!isValid(username)){
      users.push({"username": username, "password": password});
      return res.status(200).json({message: "User has been registered and can log in now!"});
    }
    else{
      return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Registration failed"});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  let myPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(res.send(JSON.stringify(books, null, 4)))
    }, 6000)
  })

  console.log("Before calling promise");

  myPromise.then((successMessage) => {
    console.log("From Callback " + successMessage)
  })

  console.log("After calling promise");
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  findBookByProperty(isbn)
    .then(book => {
      if (book) {
        res.json(book);
      } else {
        res.status(404).json({ message: "Book not found" });
      }
    })
    .catch(err => {
      res.status(500).json({ message: "An error occurred while fetching the book", error: err });
    });
});

function findBookByProperty(property) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const book = Object.values(books).find(book => book.property === property);
      if (book) {
        resolve(book);
      } else {
        reject("Book not found");
      }
    }, 100);
  });
}
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;

  findBookByProperty(author)
    .then(book => {
      if (book) {
        res.json(book);
      } else {
        res.status(404).json({ message: "Book not found" });
      }
    })
    .catch(err => {
      res.status(500).json({ message: "An error occurred while fetching the book", error: err });
    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;

  findBookByProperty(title)
    .then(book => {
      if (book) {
        res.json(book);
      } else {
        res.status(404).json({ message: "Book not found" });
      }
    })
    .catch(err => {
      res.status(500).json({ message: "An error occurred while fetching the book", error: err });
    });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  
    const book = Object.values(books).find(book => book.isbn === isbn);
    
    if (book) {
        res.json(book.reviews);
    } else {
        res.status(404).json({ message: "Review not found" });
    }
});

module.exports.general = public_users;
