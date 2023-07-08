import axios from 'axios'
import Noty from 'noty'

export function placeOrder(formObject) {
    axios.post('/orders', formObject).then((res) => {
        new Noty({
            type: 'success',
            timeout: 1000,
            text: res.data.message,
            progressBar: false
        }).show();
        setTimeout(() => {
            window.location.href = '/customers/orders';  //all changes are done since we are now using ajax call
        },1000);
    }).catch((err) => {
        new Noty({
            type: 'error',
            timeout: 1000,
            text: err.res.data.message,
            progressBar: false
        }).show();
    })
}