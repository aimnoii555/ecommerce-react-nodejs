const prisma = require("../config/prisma");

exports.create = async (req, res) => {
    try {
        const { name } = req.body;

        const category = await prisma.category.create({
            data: {
                name: name
            }
        })
        res.send("create category", category)
    } catch (error) {
        res.status(500).json({ message: "Server Error" })
    }
}

exports.getCategory = async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories)
    } catch (error) {
        res.status(500).json({ message: "Server Error" })
    }
}
exports.deleteCategory = async (req, res) => {
    try {
        const category = await prisma.category.delete(
            {
                where: {
                    id: parseInt(req.params.id)
                }
            }
        )
        res.send("delete category " + category.name);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message })
    }
}


exports.editCategory = async (req, res) => {
    try {
        const { name } = req.body

        const updated = await prisma.category.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                name: name
            }
        })

        res.json({ status: true, message: 'Updated success' })
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message })
    }
}
