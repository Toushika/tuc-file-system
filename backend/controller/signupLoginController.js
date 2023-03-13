const express = require("express");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../model/userModel');
const getCookies = require("../middleware/generateCookies");
require('dotenv').config();


//signup 
exports.singup = (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  
  bcrypt.hash(req.body.password, 10, function (err, hash) {
    if (err) {
      console.log(err);
    }
    else {
      const user = new UserModel({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hash,
        createdAt: Date.now(),
        roleId: 2
      });
      console.log("signed up user ::" + user)
      user.save().then(function (result) {
        token = jwt.sign(
          { userId: user._id, email: user.email },
          process.env.JWT_TOKEN_KEY,
          { expiresIn: '1h' }
        );
        res.status(200).json({
          token: token,
          userId: user.id,
          email: user.email,
          roleId: user.roleId
        });
      }).catch(error => {
        res.status(500).json({
          error: err
        });
      });
    }
  });

}

//login
exports.login = async (req, res) => {
  UserModel.findOne({ email: req.body.email })
    .exec()
    .then(function (user) {
      bcrypt.compare(req.body.password, user.password, function (err, result) {
        if (err) {
          return res.status(401).json({
            failed: 'Unauthorized Access'
          });
        }
        if (result) {
          const JWTToken = jwt.sign({
            email: user.email,
            _id: user._id
          },
            process.env.JWT_TOKEN_KEY,
            {
              expiresIn: '2h'
            });
          getCookies.generateCookies();
          let userName = user.firstName + " " + user.lastName;
          return res.status(200).json({
            success: 'Welcome to the JWT Auth',
            token: JWTToken,
            user: user,
            userID: user._id,
            userName: userName,
            roleId: user.roleId
          });
        }
        return res.status(401).json({
          failed: 'Unauthorized Access'
        });
      });
    })
    .catch(error => {
      res.send("Email has not matched");
    });
};

// logout
exports.logout = (req, res, next) => {
  console.log("logout")
  res.redirect("/");
};
