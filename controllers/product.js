
const prisma = require('../config/prisma');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINART_CLOUD_NAME,
    api_key: process.env.CLOUDINART_API_KEY,
    api_secret: process.env.CLOUDINART_API_SECRET
})



exports.createProdocut = async (req, res) => {
    try {
        const { title, description, price, qty, img, categoryId } = req.body

        // console.log("Product data:", { title, description, price, qty, img });

        const product = await prisma.product.create({
            data: {
                title,
                description,
                price: parseFloat(price),
                quantity: parseInt(qty),
                categoryId: parseInt(categoryId),
                images: {
                    create: img.map((item) => ({
                        asset_id: item.asset_id,
                        public_id: item.public_id,
                        url: item.url,
                        secure_url: item.secure_url
                    }))
                }
            }
        })


        res.send(product)
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message})
    }
}

exports.getProduct = async (req, res) => {

    try {
        const { count } = req.params
        const product = await prisma.product.findMany({
            take: parseInt(count),
            orderBy: {
                createdAt: "desc"
            },
            include: {
                category: true,
                images: true
            }
        })
        res.send(product)
    } catch (error) {
        res.status(500).json({ message: "Server Error" })
    }
}

exports.updateProduct = async (req, res) => {
    try {
        const { title, description, price, qty, categoryId, img } = req.body
        const { id } = req.params

        // clear img from cloud
        await prisma.image.deleteMany({
            where: {
                productId: Number(id)
            }
        })

        const product = await prisma.product.update(
            {
                where: {
                    id: parseInt(id)
                },
                data: {
                    title,
                    description,
                    price: parseFloat(price),
                    quantity: parseInt(qty),
                    categoryId: parseInt(categoryId),
                    images: {
                        create: img.map((item) => ({
                            asset_id: item.asset_id,
                            public_id: item.public_id,
                            url: item.url,
                            secure_url: item.secure_url
                        }))
                    }
                }
            }
        )

        res.send(product)
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message })
    }
}


exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params

        // delete img from cloud
        const product = await prisma.product.findFirst({
            where: {
                id: parseInt(id)
            },
            include: {
                images: true
            }
        })

        if (!product) {
            return json.status(400).json({ status: false, message: 'Product Not Found!' })
        }

        const deletedImage = product.images.map((e) => new Promise((resolve, reject) => {
            // delete from cloud
            cloudinary.uploader.destroy(e.public_id, (error, result) => {
                error ? reject(error) : resolve(result)

            })
        }))

        await Promise.all(deletedImage)
        await prisma.product.delete({
            where: {
                id: parseInt(id)
            }
        })
        res.send("delete product")
    } catch (error) {
        res.status(500).json({ message: "Server Error" })
    }
}

exports.getProductById = async (req, res) => {

    try {
        const { id } = req.params
        const product = await prisma.product.findFirst({
            where: {
                id: parseInt(id)
            },
            include: {
                category: true,
                images: true
            }
        })
        res.send(product)
    } catch (error) {
        res.status(500).json({ message: "Server Error" })
    }
}

exports.getProductBy = async (req, res) => {
    try {
        const { sort, order, limit } = req.body
        const product = await prisma.product.findMany(
            {
                take: parseInt(limit),
                orderBy: {
                    [sort]: order
                },
                include: {
                    category: true,
                    images: true
                }
            }
        )
        res.send(product)
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message })

    }
}

const handleQuery = async (req, res, query) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                title: {
                    contains: query,
                },
            },
            include: {
                category: true,
                images: true
            }
        })
        res.json(products)
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message })
    }
}

const handlePrice = async (req, res, priceRange) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                price: {
                    gte: priceRange[0],
                    lte: priceRange[1]
                }
            },
            include: {
                category: true,
                images: true
            }
        })

        res.json(products)
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message })
    }
}

const handleCategory = async (req, res, categoryId) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                categoryId: {
                    in: categoryId.map((id) => (
                        Number(id)
                    ))
                }
            },
            include: {
                category: true,
                images: true
            }
        })
        res.json(products)
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message })
    }
}

exports.searchFilters = async (req, res) => {
    try {
        const { query, category, price } = req.body

        if (query) {
            console.log("Search query:", query);
            await handleQuery(req, res, query);
        }
        if (category) {
            console.log("Search category:", category);
            await handleCategory(req, res, category);

        }
        if (price) {
            console.log("Search price:", price);
            await handlePrice(req, res, price);
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message })
    }
}



exports.createImg = async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(req.body.image, {
            public_id: `${Date.now()}`,
            resource_type: 'auto',
            folder: 'ecommerce-nodejs-reactjs'
        })

        res.json(result)
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message })
    }
}


exports.removeImg = async (req, res) => {
    try {
        const { public_id } = req.body
        cloudinary.uploader.destroy(public_id, (result) => {
            res.json({ result, status: true, message: 'remove image success' })
        })
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message })
    }
}
