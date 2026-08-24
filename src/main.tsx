import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { DraftBillProvider } from './draft/DraftBillContext'
import { RoomStoreProvider } from './store/RoomStoreContext'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <RoomStoreProvider>
      <DraftBillProvider>
        <App />
      </DraftBillProvider>
    </RoomStoreProvider>
  </BrowserRouter>,
)
