const axios = require('axios');

// const getData = async () => {
//   const response = await axios.get('https://swapi.dev/api/people/1');
//   darthVaderVoice(response.data.name);
// };

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