import { configureStore } from '@reduxjs/toolkit'
import calculateReducer from './calculate'
export { increment } from './calculate'

const store = configureStore({
    reducer: {
        calculate:calculateReducer
    }
})

export default store
export type Store = ReturnType<typeof store.getState>

