const productsDOM = document.querySelector('.products-center')
const cartItems = document.querySelector('.cart-items')
const cartTotal = document.querySelector('.cart-total')
const cartContent = document.querySelector('.cart-content')
const cartDom = document.querySelector('.cart')
const cartOverlay = document.querySelector('.cart-overlay')
const cartBtn = document.querySelector('.cart-btn')
const closeCartBtn = document.querySelector('.close-cart')
const clearCartBtn = document.querySelector('.clear-cart')



let cart = []



class Product {
  async getProducts(){
    try{
      const result = await axios.get('products.json')
      let products = result.data.items

      products = products.map((item) => {
        const {title , price} = item.fields
        const {id} = item.sys
        const image = item.fields.image.fields.file.url


        return {title , price , id , image}
      })
      
      return products
    } catch(err){
      console.log(err)
    }
  }
}

class View { 
  displayProducts(products) {
    let result = ''
    products.forEach((item) => {
      result += `
      <article class="product">
      <div class="img-container">
        <img
          src=${item.image}
          alt=${item.title}
          class="product-img"
        />
        <button class="bag-btn" data-id=${item.id}>افزودن به سبد خرید</button>
      </div>
      <h3>${item.title}</h3>
      <h4>${item.price}</h4>
    </article>
      `
    productsDOM.innerHTML = result
    })
  } 

  getButtons(){
    const buttons = [...document.querySelectorAll('.bag-btn')]
   
    buttons.forEach((item) => {
      const id = item.dataset.id
      item.addEventListener('click',(e)=>{
        let cartItem = {...Storage.getProduct(id) , amount : 1}
        cart = [...cart , cartItem]
        Storage.saveCart(cart)
        
        this.setCartValues(cart)
        this.addCartItem(cartItem)
        this.showCart()
      })
    })
  }

  setCartValues(cart){
    let totalPrice = 0
    let totalItems = 0

    cart.map((item) => {
      totalPrice += item.price * item.amount
      totalItems += item.amount
    })

    cartTotal.innerText = totalPrice
    cartItems.innerText = totalItems

   

  }

  addCartItem(item){
    const div = document.createElement('div')
    div.classList.add('cart-item')

    div.innerHTML = `
    <img src=${item.image} alt=${item.title} />
    <div>
      <h4>${item.title}</h4>
      <h5>${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>حذف</span>
    </div>
    <div>
      <i class="fas fa-chevron-up" data-id=${item.id}></i>
      <p class="item-amount">${item.amount}</p>
      <i class="fas fa-chevron-down" data-id=${item.id}></i>
    </div>
    `
    cartContent.appendChild(div)
    
  }

  showCart(){
    cartOverlay.classList.add('transparentBcg')
    cartDom.classList.add('showCart')
  }

  closeCart(){
    cartOverlay.classList.remove('transparentBcg')
    cartDom.classList.remove('showCart')
  }

  initApp(){
    cart =Storage.getCart()
    this.setCartValues(cart)
    this.populate(cart)

    cartBtn.addEventListener('click' , this.showCart)
    closeCartBtn.addEventListener('click' , this.closeCart)
  }

  populate(cart){
    cart.forEach((item) => {
      return this.addCartItem(item)
    })
  }

  cartProcess(){
     clearCartBtn.addEventListener('click', () =>{
       this.clearCart()
     })

     cartContent.addEventListener('click' , (e) => {
       if (e.target.classList.contains('remove-item')){
         let removeItem = e.target
         let id = removeItem.dataset.id
         
         cartContent.removeChild(removeItem.parentElement.parentElement)
         this.removeProduct(id)
       }

       if(e.target.classList.contains('fa-chevron-up')){
         let addAmount = e.target
         let id = addAmount.dataset.id

         let product = cart.find((item) => {
           return item.id === id 
         })

         product.amount += 1

         Storage.saveCart(cart)
         this.setCartValues(cart)

         addAmount.nextElementSibling.innerText = product.amount
       }

       if(e.target.classList.contains('fa-chevron-down')){
        let inAmount = e.target
        let inId = inAmount.dataset.id

        let product = cart.find((item) => {
          return item.id === inId 
        })

        product.amount -= 1

        if(product.amount > 0) {
          Storage.saveCart(cart)
          this.setCartValues(cart)
  
          inAmount.previousElement.innerText = product.amount
        } else{
          cartContent.removeChild(inAmount.parentElement.parentElement)
          this.removeProduct(inId)
        }

      }
     })
  }

  clearCart(){
    let cartItem = cart.map((item) => {
      return item.id
    })
    cartItem.forEach((item) => {
      return this.removeProduct(item)
    })

    while(cartContent.children.length > 0){
      cartContent.removeChild(cartContent.children[0])
    }
  }

  removeProduct(id){
    cart = cart.filter((item) => {
      return item.id !== id
    })

    this.setCartValues(cart)
    Storage.saveCart(cart)
  }
}

class Storage {
  static saveProducts(products){
    localStorage.setItem('products',JSON.stringify(products))
  }

  static getProduct(id){
    let product = JSON.parse(localStorage.getItem('products'))
    
    return product = product.find(item => item.id === id)

  }

  static saveCart(cart){
    localStorage.setItem('cart',JSON.stringify(cart))
  }

  static getCart(){
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
  }
}




document.addEventListener('DOMContentLoaded', () => {
  const product = new Product()
  const view = new View()

  view.initApp()

  product.getProducts().then((data) => { 
    view.displayProducts(data) 
    Storage.saveProducts(data) 
  }).then(() => {
    view.getButtons()
    view.cartProcess()
  })

})