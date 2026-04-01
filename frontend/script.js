const pageSwitch = document.querySelectorAll('.page')
const btnShow = document.querySelectorAll('.btn-show')
const welcome = document.querySelector('.welcome')
let userName=prompt("Enter Your Name ")||"Guest"

localStorage.setItem('Name',userName)
welcome.textContent = "Welcome "+ localStorage.getItem('Name')


btnShow.forEach((btn, index) => {

    btn.addEventListener('click', () => {
        pageSwitch.forEach((page) => {
            page.classList.remove('active')

        })
        if (index === 1) {
            renderCard()
        }
        if (index === 2) {
            loadOrders()
        }
        pageSwitch[index].classList.add('active')
    })
})
function displayProducts(products) {
    const productList = document.getElementById('productList')
    productList.innerHTML = ''
    products.forEach(product => {


        const div = document.createElement('div')
        div.className = 'product-card'

        div.innerHTML = `<h3>${product.name}</h3>
        <p>Category : ${product.category}</p>
        <p>Price : ${product.price}</p>
        <p>Stock : ${product.stock}</p>

          <button onclick="addToCart(${product.id}, '${product.name}', ${product.price})">
<i class="fa-solid fa-cart-arrow-down"></i> Add to Cart
  </button>`
        productList.appendChild(div)


    })
}
let allProduct = []
async function loadproduct() {
    try {
        const response = await fetch('https://fresh-mart-5um5.onrender.com/products')
        console.log('Status:', response.status) 
        const data = await response.json()
        console.log('Data:', data)              
        allProduct = data
        displayProducts(data)
    } catch (err) {
        console.error('Fetch error:', err)      
    }
}

    
loadproduct()
document.getElementById('search-product').addEventListener('input', function () {
    const searchItem = this.value.toLowerCase()
    const filtered = allProduct.filter(product => product.name.toLowerCase().includes(searchItem) ||
        product.category.toLowerCase().includes(searchItem))
    displayProducts(filtered)
})


// add cart
let card = []
function addToCart(id, name, price) {
    const existing = card.find(item => item.product_id === id)
    if (existing) {
        existing.quantity++
    }
    else {
        card.push({ product_id: id, name, price, quantity: 1 })
    }
    counter()
    renderCard()

}


function counter() {
    const totalItems = card.reduce((sum, item) => sum + item.quantity, 0)
    document.getElementById('cardCount').textContent = totalItems
}

// cardList


function renderCard() {
    const cardList = document.getElementById('cardlist')
    cardList.innerHTML = ''

    if (card.length === 0) {
        cardList.innerHTML = `<p>Card list is empty !!!</p>`
        return

    }

    card.forEach((item) => {
        const div = document.createElement('div')
        div.className = 'card-item'
        div.innerHTML = `<h4>${item.name}</h4>
         
  
  
    <div>
    <p>₹${item.price}</p>
    <button class="inc-btn" onclick="increaseItem(${item.product_id})"><i class="fa-solid fa-plus"></i></button>
    <p>${item.quantity}</p>
    <button class="dec-btn" onclick="decreaseItem(${item.product_id})"><i class="fa-solid fa-minus"></i></button>
    
    </div>
    <button class="remove-btn" onclick="removeRender(${item.product_id})"><i class="fa-solid fa-trash-can"></i>Remove</button>`
    
        cardList.appendChild(div)
    })
    const total = card.reduce((sum, item) => sum + item.price * item.quantity, 0)
    document.querySelector('.total').textContent = `Total: ₹${total}`
}
function removeRender(product_id) {
    const find = card.findIndex(item => item.product_id === product_id)
    card.splice(find, 1)
    counter()
    renderCard()
}
function increaseItem(product_id) {
    const item = card.find(item => item.product_id === product_id)
    item.quantity++
    counter()
    renderCard()
}
function decreaseItem(product_id) {

    const item = card.find(product => product.product_id === product_id);

    if (!item) return;

    if (item.quantity === 1) {

        card = card.filter(product => product.product_id !== product_id);

    } else {

        item.quantity--;

    }

    counter();

    renderCard();

}

async function placeOrder() {
    try {
        const customerName = document.querySelector('.inputBox').value
        if (!customerName) {
            alert('Enter Customer name')
            return
        }
        if (card.length === 0) {
            alert('card is empty')
            return

        }
        const calculate = card.reduce((sum, item) => sum + item.price * item.quantity, 0)

        const response = await fetch('https://fresh-mart-5um5.onrender.com/orders', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer_name: customerName,
                total: calculate,
                items: card
            })

        })
        const data = await response.json()
        alert(`${customerName} your Order placed Successfully`)
        card = []
        counter()
        pageSwitch.forEach(page => page.classList.remove('active'))
        pageSwitch[0].classList.add('active')


    } catch (err) {
        console.error('Error : ', err);

    }
}
async function loadOrders() {
    const response = await fetch('https://fresh-mart-5um5.onrender.com/orders')
    const orders = await response.json()
    const orderList = document.getElementById('orderlist')

    orderList.innerHTML = ''
    if (orders.length === 0) {
        orderList.innerHTML = '<p>No orders yet!</p>'
        return
    }
    orders.forEach((order) => {

        const div = document.createElement('div')
        div.className = 'orderlist-child'

        div.innerHTML = `
       
  <strong>Customer Name : ${order.customer_name}</strong>
  <p>Total : ${order.total}</p>
  <p>Status : ${order.status}</p>
   ${order.items.map(item => `
  <h4>Product : ${item  .product_name}</h4>
  <p>Price : ${item.price}</p>
  <p>Quantity x ${item.quantity}</p>`).join('')}`
        orderList.appendChild(div)
    })
}