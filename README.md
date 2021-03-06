With this second part of our small talk regarding the call stack and event loop, we're going to use actual API calls, to both demonstrate the original example and test out a couple of other scenarios where Promises could alter the call stack and event loop. After all, setTImeout doesn't specifically return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) - it just alters the call stack in a different way. For these examples, I'm personally going to download [axios](https://axios-http.com) with the command:
<br/><br/>

```
npm install --save axios
```

<br/><br/>
We could use fetch for this, but I don't like having to format the data. Anyways, we're going to create another index.js file, where we will run all of our code. We're also going to take advantage of the [Star Wars API](https://swapi.dev) in these examples. Our first one will be simple, and very similar to the examples that we have been running from part one. Once this is in your editor, go ahead and run node index.js in your terminal of choice.
<br/><br/>

```
const axios = require('axios');

axios.get('https://swapi.dev/api/people/1').then(response => {
darthVaderVoice(response.data.name);
});

const darthVaderVoice = name => {
console.log(`${name}, I am your father!`);
}
// logs 'Luke Skywalker, I am your father!'
```

<br/><br/>
We discussed this a bit in part 1, but this time it's slightly different. Axios is going to return a Promise. A Promise in javascript's event loop is treated similarly to setTimeout. Javascript will see that the execution of this code is returning a Promise to be resolved later, and is going to place it in a "to do" container. After making the API call, the loop will place the next expression in the file onto the top of the call stack, which is the declaration of darthVaderVoice. Once it's current loop finishes, it will check back in this "to do" container to see if the Promise has been resolved. Because of this, the declared function darthVaderVoice is able to be hoisted up and be called in the axios.get() callback function.
<br/><br/>
Typically, we don't just see an API call out in the open like this. What would happen if we enclosed it inside of a function, and then called that function? If you read part 1, I'm sure you can guess what will happen.
<br/><br/>

```
const axios = require('axios');

const getData = () => axios.get('https://swapi.dev/api/people/1').then(response => {
darthVaderVoice(response.data.name);
});

getData();

const darthVaderVoice = name => {
console.log(`${name}, I am your father!`);
}
// logs 'Luke Skywalker, I am your father!'
```

<br/><br/>
getData() is returning a Promise, just as the standalone axios.get() returned a Promise. Once Javascript sees that the function returns a Promise, it again places getData() in it's 'to do' container, and continues on in the file.
<br/><br/>
I don't know about you, but when I use axios, I typically avoid the .then() callback, and instead use [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function). Async/await allows us to run asynchronous code, lets us avoid "callback hell", and makes our code more readable. It also returns a Promise. If we go back to our axios examples, which also returned a Promise, we can deduce then that async/await should function similarily to .then() callback syntax. First we declare an outer function as async, then inside the function declare which expression(s) Javascript should wait on by using the keyword 'await'. We will use it in our index.js like so, and then run node index.js:
<br/><br/>

```
const getData = async () => {
const response = await axios.get('https://swapi.dev/api/people/1');
console.log(response.data.name);
};
// logs 'Luke Skywalker'
```

<br/><br/>
Seems fairly simple. The async tells Javascript that this function is going to return a Promise somewhere, while the await keyword specifically tells Javascript where that Promise is being returned at. To test this out, let's try our prior example, where we defined darthVaderVoice after getData is called. What do you think will happen?
<br/><br/>

```
const axios = require('axios');

const getData = async () => {
const response = await axios.get('https://swapi.dev/api/people/1');
darthVaderVoice(response.data.name);
};

getData();

const darthVaderVoice = name => {
console.log(`${name}, I am your father!`);
}
// logs 'Luke Skywalker, I am your father!'
```

<br/><br/>
It's exactly the same behavior as using the .then callback syntax, except it looks nicer! Instead of passing the result of the Promise into a .then().catch() block, we're simply passing it into a variable. We can then work with that variable on the same block-levels as the API call, with the additional perk that the operations further down the function do not get invoked. The call to darthVaderVoice does not get invoked until the Promise returns. This is because the function is marked as async. Javascript understands that there is a Promise somewhere in the function, and when it stumbles upon that await keyword, it's execution inside of that function scope halts, and it goes on to the next function in it's call stack.
<br/><br/>
Let's see what would happen if we tried to call darthVaderVoice inside of getData outside of the .then() callback:
<br/><br/>

```
const getData = () => {
axios.get('https://swapi.dev/api/people/1').then(response => {
darthVaderVoice(response.data.name);
});
darthVaderVoice(response.data.name);
};

getData();

const darthVaderVoice = name => {
console.log(`${name}, I am your father!`);
}
// throws ReferenceError: Cannot access darthVaderVoice before initialization
```

<br/><br/>
This gets back to part one of this mini-series, where we discussed how arrow functions are not hoisted. Axios does return a Promise, but instead of async/await syntax telling javascript to stop that function's execution, we're just returning the Promise and continuing with the call stack, which is a call to the non-hoisted darthVaderVoice.
<br/><br/>
That's the main difference between how .then() and async/await handle Promises in the call stack and event loop. With .then(), current function execution will continue outside of the callback, if there is anything left to call. Async/await stops the execution of the current function. Both send out the call to the API, and continue to the next functions/operations in the call stack. Both go back to the Promise once it's resolved, although not until javascript has finished at least 1 orbit around the event loop for the given file.
<br/><br/>
Thank you for reading this post! If you'd like to look at any of the code or the post on github, feel free to click on [this link.](https://github.com/jordanlewis9/callstackblogpart2)
