const Product = require('../models/Product');
const cloudinary = require("../config/cloudinary");


exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find(); 
        res.status(200).json({
            success: true,
            data: products,
            message: "Products retrieved successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.createProduct = async (req, res) => {
    try {
        const images = req.files.map( file => ({url:file.path, public_id: file.filename}) );
        const price = Number(req.body.price);
        const stock = Number(req.body.stock);

        const colors = req.body.colors
        ? req.body.colors.split(",").map(c => c.trim())
        : [];

        const sizes = req.body.sizes
        ? req.body.sizes.split(",").map(s => s.trim())
        : [];

        const product = await Product.create({
            name: req.body.name,
            description: req.body.description,
            price,
            category: req.body.category,
            stock,
            images,
            colors,
            sizes,
        });

        res.status(201).json({
            success: true,
            data: product,
            message: "Product created successfully",
        });
    }catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.getProduct = async (req,res) => {
    try{
        const product = await Product.findOne({ uuid: req.params.id });

        if(!product){
            res.status(404).json({
                success: false,
                message: "No product found with this id"
            })
        }

        res.status(200).json({
            success: true,
            data : product,
            message: "Product retrieved successfully",
        });
    }
    catch(err){
        res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}

exports.deleteProduct = async (req, res) => {
    const product = await Product.findOne({ uuid: req.params.id });
    if(!product){
        res.status(404).json({
            success: false,
            message: "No product found with this id"
        })
    }

    const publicIds = product.images.map(img => img.public_id);
    await cloudinary.api.delete_resources(publicIds);

    const data = await Product.findOneAndDelete({ uuid: req.params.id });

    res.status(200).json({
        success: true,
        data,
        message: "Product deleted successfully"
    })
}

exports.updateProduct = async (req, res) => {
    try{
        const product = await Product.findOne({ uuid: req.params.id });
        if(!product) res.status(404).json({success: false, message: "No product found with this id"});

        const allowedFields = [
            "name",
            "description",
            "price",
            "category",
            "stock",
            "colors",
            "sizes",
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                product[field] = req.body[field];
            }
        });

        await product.save();

        res.status(200).json({
            success: true,
            data: Product.find(),
            message: "Product updated successfully"
        });
    } catch(err){
        res.status(500).json({
            success: false,
            message: err
        })
    }
}

exports.deleteProductImage = async (req, res) => {
    try{
        const product = await Product.findOne({ uuid: req.params.id });
        if(!product){
            res.status(404).json({
                success: false,
                message: "No product found with this id"
            })
        }
        
        await cloudinary.api.delete_resources(req.body.public_id);

        res.status(200).json({
            success:false,
            data: Product.find(),
            message: "Image deleted successfully"
        });
    }catch(err){
        res.status(500).json({
            success: false,
            message: err
        })
    }
}

exports.addProductImage = async (req, res) => {
    try {
        const product = await Product.findOne({ uuid: req.params.id });
        if(!product){
            res.status(404).json({
                success: false,
                message: "No product found with this id"
            })
        }

        

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err
        })
    }
}