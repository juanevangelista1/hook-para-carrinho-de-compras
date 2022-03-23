import React from 'react'
import { Link } from 'react-router-dom'
import { MdShoppingBasket } from 'react-icons/md'

import logo from '../../assets/images/logo.svg'
import { Container, Cart } from './styles'
import { useCart } from '../../hooks/useCart'

const Header = (): JSX.Element => {
  const { cart } = useCart()
  const cartSize = cart.length //Aqui vai mostrar o tamanho do carrinho

  return (
    <Container>
      <Link to="/">
        <img src={logo} alt="Rocketshoes" />
      </Link>

      <Cart to="/cart">
        <div>
          <strong>Meu carrinho</strong>
          <span data-testid="cart-size">
            {cartSize === 1 ? `${cartSize} item` : `${cartSize} itens`}{' '}
            {/*Aqui é uma condicional IF TERNÁRIO que pega o tamanho do cart size e se tiver apenas 1 produto mostra uma mensagem, se tiver mais de um mostra outra  */}
          </span>
        </div>
        <MdShoppingBasket size={36} color="#FFF" />
      </Cart>
    </Container>
  )
}

export default Header
