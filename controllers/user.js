const prisma = require('../config/prisma');


exports.getAllUsers = async (req, res) => {
    try {


        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                enabled: true,
                address: true,
                createdAt: true,
                updatedAt: true,
            }
        })
        res.json(users)
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}


exports.changeUserStatus = async (req, res) => {
    try {

        const { id, enabled } = req.body



        await prisma.user.update({
            where: { id: parseInt(id) },
            data: { enabled: enabled }
        })
        res.json({ message: 'Chnage user status', status: true })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server Error", error: error.message, status: false });

    }
}


exports.changeUserRole = async (req, res) => {
    try {
        const { id, role } = req.body
        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { role: role }
        })
        res.send('Change user role')
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

exports.userCart = async (req, res) => {

    try {
        const { cart } = req.body

        const user = await prisma.user.findFirst({
            where: {
                id: parseInt(req.user.id)
            }
        })

        // check quantity
        for (let i = 0; i < cart.length; i++) {

            let item = cart[i];

            const product = await prisma.product.findUnique({
                where: {
                    id: item.id
                },
                select: {
                    quantity: true,
                    title: true
                },

            })

            if (!product || item.count > product.quantity) {
                return res.status(400).json({
                    status: false,
                    message: "สินค้าไม่พอในสต็อก " + product?.title
                })
            }


        }

        // console.log(cart)

        // deleted old cart items
        await prisma.productOnCart.deleteMany({
            where: {
                carts: {
                    userId: parseInt(user.id)
                }
            }
        })

        // deleted old cart
        await prisma.cart.deleteMany({
            where: {
                userId: parseInt(user.id)
            }
        })

        let products = cart.map((e) => ({
            productId: e.id,
            count: e.count,
            price: e.price
        }))

        // calculate total price
        let cartTotal = products.reduce((sum, item) => sum + item.price * item.count, 0)


        // create new cart
        const newCart = await prisma.cart.create({
            data: {
                products: {
                    create: products
                },
                cartTotal: cartTotal,
                userId: parseInt(user.id),
            }
        })

        // console.log(newCart)

        res.send('Add cart successfully')
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}
exports.getUserCart = async (req, res) => {
    try {
        const cart = await prisma.cart.findFirst(
            {
                where: {
                    userId: parseInt(req.user.id)
                },
                include: {
                    products: {
                        include: {
                            products: true
                        }
                    }
                }
            }
        )

        res.send({
            cart_total: cart.cartTotal,
            products: cart.products,
        })
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

exports.emptyCart = async (req, res) => {
    try {
        const cart = await prisma.cart.findFirst({
            where: {
                userId: parseInt(req.user.id)
            }
        })
        if (!cart) {
            return res.status(400).json({ message: "Cart not found", status: false });
        }

        // delete all products in cart
        await prisma.productOnCart.deleteMany({
            where: {
                cartId: cart.id
            }
        })

        const result = await prisma.cart.deleteMany({
            where: {
                userId: parseInt(req.user.id)
            }
        })

        console.log(result)


        res.json({
            message: 'cart empty successfully',
            status: true
        })
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

exports.saveAddress = async (req, res) => {
    try {
        const { address } = req.body

        console.log(address)

        await prisma.user.update({
            where: {
                id: parseInt(req.user.id)
            },
            data: {
                address: address
            }
        })


        res.json({
            message: "Address saved successfully",
            status: true
        })
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

exports.createOrder = async (req, res) => {
    try {
        // stripe
        console.log(req.body)
        const { id, amount, status, currency } = req.body

        // return res.send('create order')

        const cart = await prisma.cart.findFirst({
            where: {
                userId: parseInt(req.user.id)
            },
            include: {
                products: true
            }
        })

        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ status: true, message: 'your cart is Empty' })
        }



        const amountTHB = parseFloat(amount) / 100

        // // ceate new order 
        const order = await prisma.order.create({
            data: {
                products: {
                    create: cart.products.map((e) => ({
                        productId: e.productId,
                        count: e.count,
                        price: e.price,

                    })),

                },
                userId: parseInt(req.user.id),
                cartTotal: cart.cartTotal,
                paymentId: id,
                amount: amountTHB,
                status: status,
                currency: currency
            }
        })

        // update product
        const updated = cart.products.map((e) => ({
            where: {
                id: e.productId
            },
            data: {
                quantity: {
                    decrement: e.count
                },
                sold: {
                    increment: e.count
                }
            }
        }))

        console.log('updated', updated)

        await Promise.all(
            updated.map((update) => prisma.product.update(update))
        )


        await prisma.cart.deleteMany({
            where: {
                userId: parseInt(req.user.id)
            }
        })


        res.json({
            status: true,
            data: order,
            message: 'created order successfully'
        })
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}
exports.getUserOrder = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                userId: parseInt(req.user.id)
            },
            include: {
                products: {
                    include: {
                        product: true
                    }
                }
            }
        })

        if (orders.length === 0) {
            res.status(400).json({
                status: false,
                message: 'order not found!'
            })
        }


        res.json(orders)
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}
