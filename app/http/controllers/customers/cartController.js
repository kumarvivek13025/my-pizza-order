const { json } = require("express")

function cartController() {
    return {
        index(req, res) {
            res.render('customers/cart')
        }, 
        update(req, res) {
            // let cart = {
            //     items: {
            //         pizzaId: { item: pizzaObject, qty:0 },
            //     },
            //     totalQty: 0,
            //     totalPrice: 0
            // }

            if(!req.session.cart){              //If the session desoenot conatain a collection named cart then we are sending first pizza, so create a cart inside sesion datatbase
                req.session.cart = {
                    items: {},
                    totalQty: 0,
                    totalPrice: 0
                }
            }
            let cart = req.session.cart             //Even if new cart cereated or already exist it will go to the cart collection inside seession
            
            //Check if the pizza id already exist in cart
            if(!cart.items[req.body._id]) {
                cart.items[req.body._id] = {
                    item: req.body,
                    qty: 1
                }
                cart.totalQty = cart.totalQty + 1
                cart.totalPrice = cart.totalPrice + req.body.price
            } else {                                                         //if already present
                cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1
                cart.totalQty = cart.totalQty + 1
                cart.totalPrice = cart.totalPrice + req.body.price
            }
            return res.json({ totalQty: req.session.cart.totalQty })
        }
    }
}

module.exports = cartController