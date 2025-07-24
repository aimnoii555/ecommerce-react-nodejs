
const prisma = require('../config/prisma')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


exports.payment = async (req, res) => {
    try {

        const cart = await prisma.cart.findFirst({
            where: {
                userId: req.user.id
            }
        })

        // console.log('cart', cart)

        const amountTHB = cart.cartTotal * 100

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountTHB,
            currency: "thb",
            automatic_payment_methods: { enabled: true },
        });

        res.send({ clientSecret: paymentIntent.client_secret });


    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message })
    }
}
