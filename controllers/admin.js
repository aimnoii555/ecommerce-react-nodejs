const prisma = require('../config/prisma')

exports.changeOrderStatus = async (req, res) => {
    try {

        const { orderId, orderStatus } = req.body

        const orderUpdated = await prisma.order.update({
            where: {
                id: parseInt(orderId)
            },
            data: {
                orderStatus: orderStatus
            }
        })


        res.json({
            status: true,
            message: 'Updated Order status',
            data: orderUpdated
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Server Error',
            error: error.message
        })
    }
}


exports.getOrderAdmin = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        address: true
                    }
                },
                products: {
                    include: {
                        product: true
                    }
                },

            }
        })
        res.json({
            status: true,
            data: orders,
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Server Error',
            error: error.message
        })
    }
}

