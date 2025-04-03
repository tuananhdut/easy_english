import { Provider } from 'react-redux'
import { ConfigProvider } from 'antd'
import AppRouter from './routes/AppRouter'
import store from './app/store'

const App = () => {
  return (
    <Provider store={store}>
      <ConfigProvider>
        <AppRouter />
      </ConfigProvider>
    </Provider>
  )
}

export default App
