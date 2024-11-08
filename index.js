const productForm = document.querySelector("#product-form");
const productList = document.querySelector("#product-list");

productForm.addEventListener("submit", handleProductFormSubmit);
productList.addEventListener("click", handleProductListClick);

function handleProductListClick(event) {
  if (event.target.matches(".delete-button")) {
      const card = event.target.closest(".card");
      const id = card.dataset.id;

      deleteProduct(id).then(() => {
          console.log(`Product ${id} deleted`);
          card.remove();
      });
  } else if (event.target.matches(".edit-button")) {
      const card = event.target.closest(".card");
      const id = card.dataset.id;

      getProductById(id).then(product => {
          openEditForm(product);
      });
  } else if (event.target.matches(".history-button")) { // Обработка клика по кнопке "История"
      const card = event.target.closest(".card");
      const id = card.dataset.id;

      getProductSalesHistory(id).then(sales => {
          displaySalesHistory(sales);
      });
  }
}

function getProductSalesHistory(productId) {
  return fetch(`http://localhost:3000/productsale?productid=${productId}`).then(response => response.json());
}

function displaySalesHistory(sales) {
  if(sales == ""){
    const salesHistoryContainer = document.createElement("div");
    salesHistoryContainer.className = "sales-history-container";
    const saleElement = document.createElement("div");
      saleElement.className = "sale-item";
      saleElement.innerHTML = `
          <button class="button-back" onClick="Back()">Назад</button>
      `;
      salesHistoryContainer.appendChild(saleElement);
      const productList = document.getElementById("product-list");
    productList.innerHTML = ''; // Очищаем список товаров
    productList.appendChild(salesHistoryContainer);
  }
  else{
    const salesHistoryContainer = document.createElement("div");
    salesHistoryContainer.className = "sales-history-container";
    
    sales.forEach(sale => {
      const saleElement = document.createElement("div");
      saleElement.className = "sale-item";
      saleElement.innerHTML = `
      <p>Дата продажи: ${new Date(sale.saledate).toLocaleString()}</p>
      <p>Количество: ${sale.quantity}</p>
      <button class="button-back" onClick="Back()">Назад</button>
      `;
      salesHistoryContainer.appendChild(saleElement);
    });
    
    const productList = document.getElementById("product-list");
    productList.innerHTML = ''; // Очищаем список товаров
    productList.appendChild(salesHistoryContainer);
  }
}

function openForm() {
    document.getElementById("myForm").style.display = "block";
}

function closeForm() {
    document.getElementById("myForm").style.display = "none";
    document.getElementById("product-form").reset(); 
}

function Back(){
  initialize();
}

function closeEditForm() {
    document.getElementById("editForm").style.display = "none";
    document.getElementById("edit-product-form").reset(); // Очистить форму
}

// Фильтрация товаров по выбранному производителю
function filterProductsByManufacturerAndSearch(manufacturerId, query, sortOrder) {
  getAllProducts().then(products => {
      let filteredProducts = products;

      if (manufacturerId) {
          filteredProducts = filteredProducts.filter(product => product.manufacturerid == manufacturerId);
      }

      if (query) {
          const lowerCaseQuery = query.toLowerCase();
          filteredProducts = filteredProducts.filter(product => {
              const titleMatch = product.title.toLowerCase().includes(lowerCaseQuery);
              const descriptionMatch = product.description && product.description.toLowerCase().includes(lowerCaseQuery);
              return titleMatch || descriptionMatch;
          });
      }

      // Сортировка товаров по цене
      if (sortOrder === 'asc') {
          filteredProducts.sort((a, b) => a.cost - b.cost);
      } else if (sortOrder === 'desc') {
          filteredProducts.sort((a, b) => b.cost - a.cost);
      }

      renderAllProducts(filteredProducts); 
  });
}

document.getElementById('sortAscButton').addEventListener('click', function() {
    const selectedManufacturerId = document.getElementById('manufacturerFilter').value;
    const searchQuery = document.getElementById('searchBox').value;
    filterProductsByManufacturerAndSearch(selectedManufacturerId, searchQuery, 'asc');
});

document.getElementById('sortDescButton').addEventListener('click', function() {
    const selectedManufacturerId = document.getElementById('manufacturerFilter').value;
    const searchQuery = document.getElementById('searchBox').value;
    filterProductsByManufacturerAndSearch(selectedManufacturerId, searchQuery, 'desc');
});

// Загрузка производителей и отображение их в выпадающем списке
function loadManufacturers() {
    fetch('http://localhost:3000/manufacturer')
        .then(response => response.json())
        .then(manufacturers => {
            const manufacturerSelect = document.getElementById("manufacturer");
            const manufacturerFilterSelect = document.getElementById("manufacturerFilter");
            const editManufacturerSelect = document.getElementById("edit-manufacturer"); 

            manufacturers.forEach(manufacturer => {
                // Для добавления товара
                const manufacturerOption = document.createElement("option");
                manufacturerOption.value = manufacturer.id;
                manufacturerOption.textContent = manufacturer.name;
                manufacturerSelect.appendChild(manufacturerOption);

                // Для фильтрации
                const filterOption = document.createElement("option");
                filterOption.value = manufacturer.id;
                filterOption.textContent = manufacturer.name;
                manufacturerFilterSelect.appendChild(filterOption);

                // Для редактирования
                const editOption = document.createElement("option");
                editOption.value = manufacturer.id;
                editOption.textContent = manufacturer.name;
                editManufacturerSelect.appendChild(editOption);
            });
        })
        .catch(error => console.error('Ошибка загрузки производителей:', error));
}

// Изменение выбора производителя
document.getElementById('manufacturerFilter').addEventListener('change', function(event) {
    const selectedManufacturerId = event.target.value;
    const searchQuery = document.getElementById('searchBox').value;
    filterProductsByManufacturerAndSearch(selectedManufacturerId, searchQuery);
});

// Обработчик изменения текста в поле поиска
document.getElementById('searchBox').addEventListener('input', function(event) {
    const searchQuery = event.target.value; 
    const selectedManufacturerId = document.getElementById('manufacturerFilter').value; 
    filterProductsByManufacturerAndSearch(selectedManufacturerId, searchQuery); 
});
function getTotalProductCount() {
  return fetch('http://localhost:3000/product').then(response => response.json()).then(products => products.length);
}

// Функция отображения товаров
function renderAllProducts(productsData) {
  const productList = document.getElementById('product-list');
  productList.innerHTML = ''; // Очищаем текущий список товаров

  productsData.forEach(product => renderOneProduct(product)); // Отображаем каждый товар

  // Обновляем информацию о количестве товаров
  getTotalProductCount().then(totalCount => {
      const recordsCountText = document.getElementById('recordsCountText');
      recordsCountText.textContent = `Показано товаров: ${productsData.length} из ${totalCount}`;
  });
}

// Функция отображения одного товара
function renderOneProduct(productObj) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.id = productObj.id;

  if (productObj.isactive === 0) {
      card.classList.add("inactive");
  }

  // Округляем цену до десятых
  const roundedCost = parseFloat(productObj.cost).toFixed(2);

  card.innerHTML = `
      <div class="image">
          <img src="${productObj.mainimagepath}" alt="${productObj.title}">
          <button class="button delete-button">X</button>
          <button class="button edit-button">Редактировать</button>
          <button class="button history-button">История</button> <!-- Добавляем кнопку "История" -->
      </div>
      <div class="content">
          <h4>${productObj.title}</h4>
          <p>Цена: ${roundedCost}₽</p>
          <p class="description">${productObj.description || 'Описание отсутствует'}</p>
      </div>
  `;

  const productList = document.getElementById("product-list");
  productList.append(card);
}

function openEditForm(productObj) {
    // Заполняем форму редактирования значениями товара
    const editForm = document.getElementById("editForm");
    const form = document.getElementById("edit-product-form");

    form.title.value = productObj.title;
    form.cost.value = productObj.cost;
    form.description.value = productObj.description;
    form.mainimagepath.value = productObj.mainimagepath;
    form.manufacturer.value = productObj.manufacturerid;
    form.isactive.value = productObj.isactive;

    // Открываем форму редактирования
    editForm.style.display = "block";

    // Добавляем обработчик на сохранение изменений
    form.onsubmit = function(event) {
        event.preventDefault();

        const updatedProduct = {
            id: productObj.id,
            title: form.title.value,
            cost: parseFloat(form.cost.value),
            description: form.description.value,
            mainimagepath: form.mainimagepath.value,
            manufacturerid: parseInt(form.manufacturer.value),
            isactive: parseInt(form.isactive.value)
        };

        updateProduct(updatedProduct).then(() => {
            // Обновляем отображение товара
            const card = document.querySelector(`.card[data-id="${productObj.id}"]`);
            card.querySelector("h4").textContent = updatedProduct.title;
            card.querySelector(".description").textContent = updatedProduct.description || 'Описание отсутствует';
            card.querySelector("p").textContent = `Цена: ${updatedProduct.cost}₽`;

            console.log('Product updated:', updatedProduct);
            closeEditForm(); // Закрываем форму редактирования
        });
    };
}

function updateProduct(updatedProduct) {
    return fetch(`http://localhost:3000/product/${updatedProduct.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProduct)
    })
    .then(response => response.json())
    .catch(error => console.error('Ошибка обновления товара:', error));
}

function handleProductFormSubmit(event) {
    event.preventDefault();

    const costValue = event.target.cost.value;
    const manufacturerId = event.target.manufacturer.value;
    const isActiveValue = event.target.isactive.value; 

    // Проверка, что цена содержит только цифры и не является отрицательной
    if (!/^\d+(\.\d+)?$/.test(costValue) || parseFloat(costValue) <= 0) {
        alert("Цена товара должна быть положительным числом.");
        return;
    }

    const productObj = {
        title: event.target.title.value,
        cost: parseFloat(costValue),
        description: event.target.description.value,
        mainimagepath: event.target.mainimagepath.value,
        manufacturerid: parseInt(manufacturerId),
        isactive: parseInt(isActiveValue)
    };

    createProduct(productObj)
        .then(newProductObj => {
            renderOneProduct(newProductObj);
            console.log('Product added:', newProductObj);
        });

    event.target.reset();
}

function initialize() {
    loadManufacturers(); 
    getAllProducts().then(products => {
        renderAllProducts(products); 
    }).catch(() => {
        alert("Не удалось загрузить товары!");
    });
}

initialize();