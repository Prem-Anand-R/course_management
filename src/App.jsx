import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { Provider } from 'react-redux';
import { store } from './redux/store.js';
import { ProgressProvider } from './contexts/ProgressContext';

export default function App() {
  return (
    <Provider store={store}>
      <ProgressProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ProgressProvider>
    </Provider>
  );
}

