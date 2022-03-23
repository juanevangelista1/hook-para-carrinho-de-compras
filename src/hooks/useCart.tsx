import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { toast } from 'react-toastify'
import { api } from '../services/api'
import { Product, Stock } from '../types'

interface CartProviderProps {
  children: ReactNode
}

interface UpdateProductAmount {
  productId: number
  amount: number
}

interface CartContextData {
  cart: Product[]
  addProduct: (productId: number) => Promise<void>
  removeProduct: (productId: number) => void
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void
}

const CartContext = createContext<CartContextData>({} as CartContextData)

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    //Aqui é um estado que tem um array de produtos
    const storagedCart = localStorage.getItem('@RocketShoes:cart') //Buscar dados do localStorage e pegar o item;

    if (storagedCart) {
      return JSON.parse(storagedCart)
    } // O storagedCart pode ser uma string ou null se ela for null retorna um array vazio, se não for null, ele retorna um JSON, mas com o JSON.parse ele transforma o storagedCart como um array de produtos e retorna

    return []
  })

  const prevCartRef = useRef<Product[]>()
  // Essa lógica monitora o cart para verificar se o valor foi modificado ou não.+ se
  useEffect(() => {
    prevCartRef.current = cart
  })

  const cartPreviousValue = prevCartRef.current ?? cart

  useEffect(() => {
    if (cartPreviousValue !== cart) {
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
    }
  }, [cart, cartPreviousValue])

  const addProduct = async (productId: number) => {
    try {
      // Aqui é função para adicionar o produto ao cart => Para adicionar o produto ao cart precisamos verificar, se o produto existe no carrinho, se tiver aumentamos a quantidade, senão adicionamos o primeiro item. Assim como a conferencia da quantidade no estoque.
      const updatedCart = [...cart] //updatedCart é um novo array com os valores de cart => Então toda a alteração que fizer nele não vai refletir no cart,
      const productExists = updatedCart.find(
        product => product.id === productId
      ) // Aqui verifica se o produto existe para poder adicionar o produto no carrinho,

      const stock = await api.get(`/stock/${productId}`) //Aqui cria a rota para conferir o estoque de produtos => retorna um array com os objetos com id e amount => com o JSON server se passar o endereço com /stock/ o id do produto ele já identifica o objeto em questão

      const stockAmount = stock.data.amount
      const currentAmount = productExists ? productExists.amount : 0 // Aqui verifica se o produto existir ele acessa o amount do produto, senão ele é igual a zero e não existe no carrinho.

      const amount = currentAmount + 1 // Aqui pega a quantidade desejada + 1;
      // Aqui começa as verificações para adicionar o carrinho:
      if (amount > stockAmount) {
        // Verifica se a quantidade desejada é maior que a quantidade do estoque
        toast.error('Quantidade solicitada fora de estoque')
        return
      }

      if (productExists) {
        // verfica se o produto existe para atualizar a quantidade do produto
        productExists.amount = amount
      } else {
        // senão ele vai adicionar o produto ao carrinho
        const product = await api.get(`/products/${productId}`) // Se for um produto novo a gente pega e busca o produto na api
        // Aqui pega todos os dados retonardos da api e criar um campo amount com valor 1 porque é a primeira vez que adicinamos o produto ao carrinho

        const newProduct = {
          ...product.data, //desestruturação
          amount: 1 // define o valor 1 para o produto adicionado pela primeira vez.
        }
        updatedCart.push(newProduct) // Aqui adiciona o newProduct ao estado que atualiza o carrinho de compras.
      }
      setCart(updatedCart) // aqui é para perpetuar a atulização do updatedCart
      // Faz a conversão para string
    } catch {
      toast.error('Erro na adição do produto') //Aqui mostra a mensagem de erro no caso de falha no catch
    }
  }

  const removeProduct = (productId: number) => {
    // para remover o produto primeiro verficamos se ele existe no carrinho
    try {
      const updatedCart = [...cart]
      const productIndex = updatedCart.findIndex(
        product => product.id === productId
      )

      if (productIndex >= 0) {
        // O splice remove os elementos do array e se necessário insere novos elementos no array no lugar => Deve-se passar onde quer começar a deletar =>
        updatedCart.splice(productIndex, 1)
        setCart(updatedCart)
      } else {
        throw Error() // como já lidamos com o erro através do catch, aqui apenas força o erro no caso od if não der certo
      }
    } catch {
      toast.error('Erro na remoção do produto')
    }
  }

  const updateProductAmount = async ({
    productId,
    amount
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) {
        return
      }

      const stock = await api.get(`/stock/${productId}`)
      const stockAmount = stock.data.amount

      if (amount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque')
        return // com o return cancela a execução
      }

      const updatedCart = [...cart]
      const productExists = updatedCart.find(
        product => product.id === productId
      )

      if (productExists) {
        productExists.amount = amount
        setCart(updatedCart)
      } else {
        throw Error()
      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto')
    }
  }

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextData {
  const context = useContext(CartContext)

  return context
}
