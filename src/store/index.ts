import { createStore } from 'vuex'
export default createStore({
    state: {
        nftDetail: null
    },
    mutations: {
        setNftDetail(state: any, token) {
            state.nftDetail = token;
        },

    },
    actions: {
    },
    modules: {
    }
})