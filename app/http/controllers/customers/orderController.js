const Order = require('../../../models/order')
const moment = require('moment')
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)

function orderController () {
    return {
        store(req, res) {
            //Validate request
            const { phone, address, stripeToken, paymentType } = req.body
            if(!phone || !address) {
                //req.flash('error', 'All fileds are required')
                return res.status(422).json({ message: 'All fields are required' });
            }

            const order = new Order ({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone,
                address
            })
            order.save().then(result => {
                Order.populate(result, { path:'customerId' }, (err, placedOrder) => {
                    //req.flash('success', 'Order placed successfully')
                    
                    //Stripe payment
                    if (paymentType === 'card') {
                        stripe.charges.create({
                            amount: req.session.cart.totalPrice * 100,                  //Since inr in stripe is in paise
                            source: stripeToken,
                            currency: 'inr',
                            description: `Pizza order: ${placedOrder._id}`
                        }).then(() => {
                            placedOrder.paymentStatus = true
                            placedOrder.paymentType = paymentType
                            placedOrder.save().then((ord) => {
                                //Emit
                                const eventEmitter = req.app.get('eventEmitter')
                                eventEmitter.emit('orderPlaced', ord)
                                delete req.session.cart
                                return res.json({message:'Payment successful, Order placed successfully'});
                            }).catch((err) => {
                                console.log(err)
                            })
                        }).catch((err) => {
                            delete req.session.cart
                            return res.json({message:'Order placed but payment failed, You can pay at delivery time'});
                        })
                    } else {
                        delete req.session.cart
                        return res.json({message:'Order placed successfully'});
                    }
                })
            }).catch((err) => {
                return res.status(500).json({message:'Something went wrong'});
                // req.flash('error', 'Something went wrong')
                // return res.redirect('/cart')
            })
        },
        async index(req, res) {
            const orders = await Order.find({ customerId: req.user._id }, 
                null, 
                { sort: { 'createdAt': -1 } })
            res.header('Cache-Control', 'no-store')         //As we place the order, we are redirected to teh rders list page with the popup if order places successfully, nut if we move back and forward then again this message gets diaplayed so to remove in such cases we do this by removing the cache
            res.render('customers/orders', { orders: orders, moment: moment })
        },
        async show(req, res) {
            const order = await Order.findById(req.params.id)
            //Autherise user
            if(req.user._id.toString() === order.customerId.toString()) {
                return res.render('customers/singleOrder', { order })
            }
            return res.redirect('/')
        }
    }
}

module.exports = orderController