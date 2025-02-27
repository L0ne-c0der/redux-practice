import { createStore, applyMiddleware, combineReducers } from "redux";
import logger from "redux-logger"; //logs state, action, next state
import axios from "axios";
import thunk from "redux-thunk"; //middleware for async code
//this import works only for older versions of redux

//action name constants
// const init = 'accounts/init'
const inc =  'accounts/increment'
const dec = 'accounts/decrement'
const incByAmt = 'accounts/incrementByAmount'
const getAccUserPending = 'accounts/getUser/pending'
const getAccUserFulfilled = 'accounts/getUser/fulfilled'
const getAccUserRejected = 'accounts/getUser/rejected'
const incBonus = 'bonus/increment';

//store
//const store = createStore(reducer); //reducer is a function
const store = createStore(
    combineReducers({
        accounts: accountReducer,
        bonus: bonusReducer
    }), 
    applyMiddleware(logger.default, thunk.default)
); 
//middlewear redux-logger added




//reducer has state and action
//changes state based on the action
function accountReducer(state={amount:1}, action){
    //logic to increment the state

    // if(action.type=='increment'){

    // if(action.type==inc){ //makes code less vulnerable to spelling errors

    //     //using {} to create new object and immutability
    //     return {amount : state.amount+1}

    //     //don't do like this:
    //     // state.amount = state.amount + 1
    //     //because it changes the object directly
    //     //so you can't track history
    // }
    // if(action.type==dec){
    //     return {amount : state.amount-1}
    // }
    // if(action.type==incByAmt){
    //     return {amount : state.amount+ action.payload}
    // }

    //using switch case
    switch (action.type) {
        case getAccUserFulfilled:
            return {amount : action.payload, pending: false};   
            break;
        case getAccUserRejected:
            return {...state, error: action.error, pending: false};
            break;
        case getAccUserPending:
            return {...state, pending: true};
            break;
        case dec:
            return {amount : state.amount-1};
            break;
        case incByAmt:
            return {amount : state.amount + action.payload};
            break;
        default:
            return state;
            break;
    }
}

function bonusReducer(state={points:0}, action){
    switch(action.type){
        case incByAmt:
            if(action.payload>=100)
                return {points: state.points + 1}
        case incBonus:
            return {points: state.points+1}
        default:
            return state;
            break;
    }
}


//printing global state
// console.log(store.getState())

//this function runs whenever state changes
//should be used before dispatcher function

// store.subscribe(() => {
//     console.log(store.getState())
// })


//Async API call
// async function getUserAccount(){
//     const {data} = await axios.get('http://localhost:3000/accounts/1')
//     console.log(data.amount)
// }

// getUserAccount()

//problem occurs when you want to put the async and await code in the init action creator
//because action creators should return plain objects
//so we use middleware for that
//middleware is a function that runs between action and reducer
//it can be used to run async code

//action creators
//reduces need to put the action object 
// as parameter in dispatcher
//it should return plain objects
//should not have side effects and async code, use middleware for that

//using thunk middleware
//it takes the dispatch and getState as parameters
//dispatch is the same dispatch function that is used to dispatch actions
//getState is a function that returns the current state of the store

// async function getUserAccount(dispatch, getState){
//     const {data} = await axios.get('http://localhost:3000/accounts/1')
//     dispatch(initUser(data.amount))
// }

//async functions use a promise
//a promise has 2 states: pending, resolved
//when resolved, it has 2 states: fulfilled, rejected
function getUserAccount(id){
    return async (dispatch, getState)=> {
        dispatch(getAccountUserPending())
        try {
            const {data} = await axios.get(`http://localhost:3000/accounts/${id}`)
            dispatch(getAccountUserFulfilled(data.amount))
        } catch (error) {
            dispatch(getAccountUserRejected(error.message))
        }
        
    }
}

function getAccountUserFulfilled(value){
    return {type: getAccUserFulfilled,
        payload: value
    }
}
function getAccountUserRejected(error){
    return {type: getAccUserRejected,
        error: error
    }
}
function getAccountUserPending(){
    return {type: getAccUserPending
    }
}

function initUser(value){
    return {type: init,
        payload: value
    }
}

function increment(){
    return {type: inc}
}
function decrement(){
    return {type: dec}
}
function incrementByAmount(value){
    return {type: incByAmt,
        payload: value
    }
}

//for bonus
function incrementBonus(){
    return {type: incBonus}
}

//action, an object with a 'type' attribute
//dispatch function to increase the value of the state
// setTimeout(() => {
// store.dispatch(getUserAccount);
// }, 2000);

//when passing getUserAccount, you should not call it, and pass it as a reference
//store.dispatch(getUserAccount) //wrong
//store.dispatch(getUserAccount()) //wrong
//store.dispatch(getUserAccount) //right
//then redux will observe that it is an async fun
//and will cal it separately
//when logging, you can notice that it is called twice
//once for the dispatch for the action, and once for the async function
//this is because the async function is called separately

//output for store.dispatch(getUserAccount):
// action undefined @ 12:16:50.490
//    prev state { amount: 1 }
//    action     [AsyncFunction: getUserAccount]
//    next state { amount: 1 }
//  action init @ 12:16:50.529
//    prev state { amount: 1 }
//    action     { type: 'init', payload: 2000 }
//    next state { amount: 2000 }


setTimeout(() => {
    store.dispatch(getUserAccount(1));
    // store.dispatch(incrementByAmount(100));
    // store.dispatch(incrementBonus());
    }, 2000);