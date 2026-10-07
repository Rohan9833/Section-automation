const fs = require("fs");
const path = require("path");

const PRODUCT_DIR = path.join(__dirname, "../../products");


function getVideoPath(htmlPath) {
    const html = fs.readFileSync(htmlPath, "utf8");

    const match = html.match(
        /<source\s+src=["']([^"']+)["']/i
    );

    if (!match) {
        return null;
    }

    return match[1];
}

function getProducts() {
    const entries = fs.readdirSync(PRODUCT_DIR, {
        withFileTypes: true,
    });

    const products = [];

    for(const entry of entries) {
        if(!entry.isDirectory()) {
            continue;
        }

        const productName = entry.name;

        const htmlPath = path.join(
            PRODUCT_DIR,
            productName,
            "video.html"
        );

        if(!fs.existsSync(htmlPath)) {
            continue;
        }

        products.push({
            name: productName,
            slug: productName.toLowerCase(),
            htmlPath,
            videoPath: getVideoPath(htmlPath),
        })
    }

    return products;
}


module.exports = {
    getProducts,
}