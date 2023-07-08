import { loadStripe } from '@stripe/stripe-js'
import { placeOrder } from './apiService'
import { CardWidget } from './CardWidget'

export async function initStripe () {
    const stripe = await loadStripe('pk_test_51JHQflSCaXRC5YS9K0D8MHnHHI2V9Di0nldVjEKWCn56UWojsOt4unw6lUuF3ZxTqz04NO1opiWmq64vut7RLmGL00v8LCX0dj');
    let card = null;

    // function mountWidget() {
    //     const elements = stripe.elements()
    //     let style = {
    //         base: {
    //             color: '#32325d',
    //             fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    //             fontSmoothing: 'antialiased',
    //             fontSize: '16px',
    //             '::placeholder': {
    //                 color: '#aab7c4'
    //             }
    //         },
    //         invalid: {
    //             color: '#fa755a',
    //             iconColor: '#fa755a'
    //         }
    //     }
    
    //     card = elements.create('card', { style , hidePostalCode: true })
    //     card.mount('#card-element')
    // }

    const paymentType = document.querySelector('#paymentType');
    if(!paymentType){
        return;
    }
    paymentType.addEventListener('change', (e) => {
        if(e.target.value === 'card') {
            //Display Widget
            card = new CardWidget(stripe)               //CALL THE CALSSwe created
            card.mount()
            // mountWidget()
        } else {
            card.destroy()
        }
    })
    //Ajax call 
    const paymentForm = document.querySelector('#payment-form');
    if(paymentForm){
        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();                             //Not to submit form in the default form action location
            let formData = new FormData(paymentForm);
            let formObject = {}
            for(let [key, value] of formData.entries()) {
                formObject[key] = value
            }

            if (!card) {
                //Ajax
                placeOrder(formObject);
                return;
            }
            const token = await card.createToken()
            formObject.stripeToken = token.id;
            placeOrder(formObject);

            // //Verify card
            // stripe.createToken(card).then((result) => {
            //     console.log(result)
            //     formObject.stripeToken = result.token.id;
            //     placeOrder(formObject);
            // }).catch(() => {
            //     console.log(result.error)
            // })
            
        })
    }
}
