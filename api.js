function getAllProducts() {
   // return fetch('http://localhost:3000/product').then(response => response.json())
    return fetch('http://localhost:3000/product?include=manufacturer').then(response => response.json())
}

function createProduct(productObj) {
    return fetch('http://localhost:3000/product', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productObj),
    }).then(response => response.json())
}

function getProductById(id) {
    return fetch(`http://localhost:3000/product/${id}`).then(response => response.json());
}

function deleteProduct(id) {
    return fetch(`http://localhost:3000/product/${id}`, {
        method: 'DELETE',
    }).then(response => response.json())
}


