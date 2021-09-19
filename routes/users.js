const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')

const User = require("../models/User")
const passport = require("passport");

router.get('/login', (req, res) => {
    res.render('login')
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success_msg', 'You are logged out')
    res.redirect('/users/login')
})

router.get('/register', (req, res) => {
    res.render('register')
})

router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body
    let errors = []

    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' })
    }

    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' })
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password should be atleast 6 characters' })
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        User.findOne({ email })
            .then((user) => {
                if (user) {
                    errors.push({ msg: 'Email is already registered' })

                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    const user = new User({
                        name, email, password,
                    })

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(user.password, salt, (err, hash) => {
                            if (err) throw err

                            user.password = hash
                            user.save()
                                .then((user) => {
                                    req.flash('success_msg', 'Successfully registered and can be log in')
                                    res.redirect('/users/login')
                                })
                                .catch((err) => {
                                    console.log(err)
                                })
                        })
                    })
                }
            })
    }
})

module.exports = router