const productRows = document.querySelectorAll('#products tbody [data-id]');
const invoiceTableBody = document.querySelector('#invoice tbody');
const productsTableBody = document.querySelector('#products tbody');
const totalsOutput = document.querySelector('.total-sum');
const newProductForm = document.querySelector('#new-product');
const updatedTracker = document.querySelector('.updated');

const allProducts = JSON.parse(localStorage.getItem('products')) || [];
const allInvoiceProducts = JSON.parse(localStorage.getItem('invoiceProducts')) || [];


// CREATE

function setProductForm() {
  newProductForm.addEventListener('submit', event => {
    event.preventDefault();
    const title = document.querySelector('#title').value;
    const flatPrice = (parseFloat(document.querySelector('#price').value.replace(/,/, ".")) * 100) || 0;
    const tax = (parseFloat(document.querySelector('#tax').value)) || 0;
    const id = document.querySelector('tr[data-id]:last-child') ? (parseInt(document.querySelector('tr[data-id]:last-child').dataset.id) + 1) : 0;

    newProduct = {
      id,
      title,
      flatPrice,
      tax,
      fullPrice: (tax === 0) ? flatPrice : flatPrice * tax
    }
    allProducts.push(newProduct);
    redrawProducts();
    event.currentTarget.reset();
  })
}

// READ

// UPDATE

function resetInvoiceEventListeners() {
  invoiceTableBody.querySelectorAll('tr').forEach(row => {
    row.addEventListener('click', event => {
      event.preventDefault();
      if (!event.target.classList.contains('btn-danger')) return;
      const currentProduct = allInvoiceProducts.find(product => product.id == event.currentTarget.dataset.id);
      if (currentProduct.amount > 1) {
        currentProduct.amount--;
        redrawInvoices();
      } else {
        currentProduct.amount = 0;
        removeProduct(event);
        updateTally();
      }
    })
  })
}

function updateTally() {
  const totalFull = allInvoiceProducts.reduce((sum, item) => {
    sum += (item.fullPrice * item.amount);
    return sum;
  }, 0);;
  const totalFlat = allInvoiceProducts.reduce((sum, item) => {
    sum += (item.flatPrice * item.amount);
    return sum;
  }, 0);
  const totalTax = allInvoiceProducts.reduce((sum, item) => {
    sum += ((item.tax === 0 ? item.flatPrice : ((item.flatPrice * item.tax)) - item.flatPrice) * item.amount);
    return sum;
  }, 0);

  totalsOutput.querySelector('.flat-fee').innerText = `€ ${(totalFlat / 100).toFixed(2)}`;
  totalsOutput.querySelector('.full-fee').innerText = `€ ${(totalFull / 100).toFixed(2)}`;
  totalsOutput.querySelector('.tax-fee').innerText = `€ ${(totalTax / 100).toFixed(2)}`;
}

function resetProductEventListeners() {
  document.querySelectorAll('#products tr[data-id]').forEach(row => {
    addToInvoice(row);
  })
}

function redrawProducts() {
  productsTableBody.innerHTML = "";
  allProducts.forEach(item => {
    const newProduct = `
    <tr data-id="${item.id}">
    <td class="title">
    ${item.title}
    </td>
    <td class="flat-price" data-price="${item.flatPrice}">
    € ${(item.flatPrice / 100).toFixed(2)}
    </td>
    <td class="tax" data-tax="${item.tax}">
    ${item.tax.toString().replace(/1./, "")}%
    </td>
    <td class="full-price">
    € ${(item.fullPrice / 100).toFixed(2)}
    </td>
    <td class="actions">
    <a href="#" class="btn btn-success btn-sm">
    <i class="fas fa-plus"></i>
    </a>
    <a href="#" class="btn btn-warning btn-sm">
    <i class="fas fa-edit"></i>
    </a>
    <a href="#" class="btn btn-danger btn-sm">
    <i class="fas fa-times"></i>
    </a>
    </td>
    </tr>
    `
    productsTableBody.insertAdjacentHTML('beforeend', newProduct);
  })
  resetProductEventListeners();
}

function redrawInvoices() {
  invoiceTableBody.innerHTML = "";
  allInvoiceProducts.forEach(item => {
    const newInvoiceItem = `
    <tr data-id="${item.id}">
    <td class="title">
    ${item.title}
    </td>
    <td class="flat-price" data-price="${item.flatPrice}">
    € ${(item.flatPrice / 100).toFixed(2)}
    </td>
    <td class="tax" data-tax="${item.tax}">
    ${item.tax.toString().replace(/1./, "")}%
    </td>
    <td class="full-price">
    € ${(item.fullPrice / 100).toFixed(2)}
    </td>
    <td class="actions">
    <a href="#" class="btn btn-danger btn-sm">
    <i class="fas fa-minus"></i>
    </a>
    <span class="amount">
    x ${item.amount}
    </span>
    </td>
    </tr>
    `
    invoiceTableBody.insertAdjacentHTML('beforeend', newInvoiceItem);
  })
  resetInvoiceEventListeners();
  updateTally();
}

// DESTROY

function removeProduct(event) {
  event.currentTarget.remove();
  const index = allInvoiceProducts.findIndex(product => product.id === event.currentTarget.dataset.id);
  allInvoiceProducts.splice(index, 1);
}

// HELPERS

function collapseSegmentButtons() {
  const collapseButtons = document.querySelectorAll('.collapse-segment');

  collapseButtons.forEach(button => {
    button.addEventListener('click', event => {
      const chevron = event.currentTarget.querySelector('.fas');
      const target = document.querySelector(event.currentTarget.dataset.collapse);
      if (event.currentTarget.classList.contains('closed')) {
        chevron.classList.add('fa-chevron-down');
        chevron.classList.remove('fa-chevron-up');
        event.currentTarget.classList.remove('closed');
        target.classList.remove('hidden');
      } else {
        chevron.classList.add('fa-chevron-up');
        chevron.classList.remove('fa-chevron-down');
        event.currentTarget.classList.add('closed');
        target.classList.add('hidden');
      }
    })
  })
}

function computeFullPrice(row) {
  const flatPrice = row.querySelector('.flat-price');
  const tax = row.querySelector('.tax');
  const fullPrice = row.querySelector('.full-price');
  const computedPrice = (flatPrice.dataset.price * tax.dataset.tax) / 100;
  return computedPrice;
}

function setFullPrice(row) {
  const fullPrice = row.querySelector('.full-price');
  fullPrice.innerText = `€ ${computeFullPrice(row).toFixed(2)}`;
}

function saveData() {
  localStorage.setItem('products', JSON.stringify(allProducts));
  localStorage.setItem('invoiceProducts', JSON.stringify(allInvoiceProducts));

  let date = new Date()
  , options = {hour: 'numeric', minute: 'numeric', second: 'numeric' };

  updatedTracker.innerHTML = `
  Saved at: ${date.toLocaleString('en-EN', options)}
  `
}

// BUTTONS

function addButton(event) {
  const productId = event.currentTarget.parentElement.parentElement.dataset.id;
  const currentProduct = allProducts.find(product => product.id == productId);
  const productInInvoice = allInvoiceProducts.find(product => product.id == productId);
  if (productInInvoice) {
    productInInvoice.amount++;
  } else {
    currentProduct['amount'] = 1;
    allInvoiceProducts.push(currentProduct);
  }
  redrawInvoices();
}

function handleCheck(event) {
  event.preventDefault();
  const currentRow = event.currentTarget.parentElement.parentElement;
  const productId = event.currentTarget.parentElement.parentElement.dataset.id;
  const currentProduct = allProducts.find(product => product.id == productId);
  const currentRowTitle = currentRow.querySelector('#title-edit').value;
  const currentRowFlatPrice = currentRow.querySelector('#price-edit').value;
  const currentRowTax = currentRow.querySelector('#tax-edit').value;
  currentProduct.title = currentRowTitle;
  currentProduct.flatPrice = parseFloat(currentRowFlatPrice);
  currentProduct.tax = parseFloat(currentRowTax);
  currentProduct.fullPrice = (currentProduct.tax === 0) ? currentProduct.flatPrice : currentProduct.flatPrice * currentProduct.tax;
  const currentInvoiceProduct = allInvoiceProducts.find(product => product.id == productId);
  if (currentInvoiceProduct) {
    currentInvoiceProduct.title = currentProduct.title;
    currentInvoiceProduct.flatPrice = currentProduct.flatPrice;
    currentInvoiceProduct.tax = currentProduct.tax;
    currentInvoiceProduct.fullPrice = currentProduct.fullPrice;
  }
  redrawProducts();
  redrawInvoices();
  updateTally();
}

function setClearAllButton() {
  document.querySelector('#clear-all').addEventListener('click', event => {
    if (confirm('Are you sure?')) {
      allProducts.splice(0, allProducts.length);
      allInvoiceProducts.splice(0, allInvoiceProducts.length);
      redrawProducts();
      redrawInvoices();
      updateTally();
    } else {
      return;
    }
  })
}

function removeButton(event) {
  const currentRow = event.currentTarget.parentElement.parentElement;
  const productId = currentRow.dataset.id;
  const currentProductIndex = allProducts.findIndex(product => product.id == productId);
  const currentInvoiceProductIndex = allInvoiceProducts.findIndex(product => product.id == productId);
  allProducts.splice(currentProductIndex, 1);
  allInvoiceProducts.splice(currentInvoiceProductIndex, 1);
  redrawProducts();
  redrawInvoices();
  updateTally();
}

function setSaveButton() {
  updatedTracker.addEventListener('click', event => {
    event.preventDefault();
    saveData();
  })
}

function editButton(event) {
  const currentRow = event.currentTarget.parentElement.parentElement;
  const productId = currentRow.dataset.id;
  const currentProduct = allProducts.find(product => product.id == productId);
  const currentRowTitle = currentRow.querySelector('.title');
  const currentRowFlatPrice = currentRow.querySelector('.flat-price');
  const currentRowTax = currentRow.querySelector('.tax');

  currentRowTitle.innerHTML = `
  <input type="text" class="form-control" name="title" id="title-edit" placeholder="Title" value="${currentProduct.title}">
  `
  currentRowFlatPrice.innerHTML = `
  <input type="number" class="form-control" step="0.01" name="price" id="price-edit" placeholder="Price" value="${currentProduct.flatPrice}">
  `
  currentRowTax.innerHTML = `
  <select id="tax-edit" class="form-control" name="tax">
  <option value="">Tax</option>
  <option value="0" ${(currentProduct.tax == 0) ? 'selected' : ""}>0%</option>
  <option value="1.06" ${(currentProduct.tax == 1.06) ? 'selected' : ""}>6%</option>
  <option value="1.21" ${(currentProduct.tax == 1.21) ? 'selected' : ""}>21%</option>
  </select>
  `
  event.currentTarget.insertAdjacentHTML('beforebegin', `
    <a href="#" class="btn btn-primary btn-sm">
    <i class="fas fa-check"></i>
    </a>
    `)
  const checkButton = currentRow.querySelector('.btn-primary');
  checkButton.addEventListener('click', handleCheck);
  event.currentTarget.remove();
}

function addToInvoice(row) {
  row.querySelector('.btn-success').addEventListener('click', event => {
    event.preventDefault();
    addButton(event);
  })

  row.querySelector('.btn-warning').addEventListener('click', event => {
    event.preventDefault();
    editButton(event);
  })

  row.querySelector('.btn-danger').addEventListener('click', event => {
    event.preventDefault();
    if (confirm('Are you sure?')) {
      removeButton(event);
    } else {
      return;
    }
  })
}


document.addEventListener('DOMContentLoaded', event => {
  redrawProducts();
  redrawInvoices();
  updateTally();
  setProductForm();
  setClearAllButton();
  setSaveButton();
  collapseSegmentButtons();
  window.setInterval(saveData, 10000);
})
