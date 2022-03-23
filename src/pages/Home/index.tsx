import React, { useState, useEffect } from 'react'
import { MdAddShoppingCart } from 'react-icons/md'

import { ProductList } from './styles'
import { api } from '../../services/api'
import { formatPrice } from '../../util/format'
import { useCart } from '../../hooks/useCart'

interface Product {
  id: number
  title: string
  price: number
  image: string
}

interface ProductFormatted extends Product {
  priceFormatted: string
}

interface CartItemsAmount {
  [key: number]: number
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([])
  const { addProduct, cart } = useCart()

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    const newSumAmount = { ...sumAmount }
    newSumAmount[product.id] = product.amount // o [] acessa a chave de maneira dinamica, e isso não é um array, e sim um objeto. E associa o valor desse objeto a quantidade do produto.

    return newSumAmount // Foi criado dois objetos independentes, e o sumAmount foi desestruturado,
  }, {} as CartItemsAmount)

  useEffect(() => {
    async function loadProducts() {
      // carregamento dos produtos
      const response = await api.get<Product[]>('products') // pega todos os products da api e guarda nessa variável

      const data = response.data.map(product => ({
        ...product,
        priceFormatted: formatPrice(product.price)
      }))

      setProducts(data)
    }

    loadProducts()
  }, [])

  function handleAddProduct(id: number) {
    addProduct(id) // Essa função ta dentro do hook então só precisa chamar ela
  }

  return (
    <ProductList>
      {products.map(product => (
        <li key={product.id}>
          <img src={product.image} alt={product.title} />
          <strong>{product.title}</strong>
          <span>{product.priceFormatted}</span>
          <button
            type="button"
            data-testid="add-product-button"
            onClick={() => handleAddProduct(product.id)} // Handle sempre lida com função
          >
            <div data-testid="cart-product-quantity">
              <MdAddShoppingCart size={16} color="#FFF" />
              {cartItemsAmount[product.id] || 0}
            </div>

            <span>ADICIONAR AO CARRINHO</span>
          </button>
        </li>
      ))}
    </ProductList>
  )
}

// Quando se utiliza do map o primeiro elemento tem que ter uma key para identificar de forma única

export default Home
