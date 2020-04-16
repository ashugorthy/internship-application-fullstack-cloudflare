
//Creating a dictionary with values for title,h1,p and a tags to rewwrite the HTML
var dict = {'1':{'title':'Google','h1':'Google','p':'Click on the below button to go to google homepage','a':{'url':'https://www.google.com/','text':'Go to Google'}},
           '2':{'title':'LinkedIn','h1':'LinkedIn','p':'Click on the below button to go to linkedin homepage','a':{'url':'https://www.linkedin.com/','text':'Go to LinkedIn'}}}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */

class ElementHandler {
 //This is to get the variant number which will be used as a key for the dictionary created above.
 constructor(key) {
   this.key = key
 }

 //Compare the tags and rewrite the HTML accordingly using HTMLRewriter
 element(element) {
   var tagName = element.tagName;

   if (tagName === 'a'){                        //Check if the element is an anchor tag
     element.setAttribute('href',dict[this.key][tagName]['url']);
     element.setInnerContent(dict[this.key][tagName]['text'],{ html: true });
   } else if (tagName === 'title') {            //Check if the element is a title tag
     element.setInnerContent(dict[this.key][tagName],{ html: true });
   } else if (tagName === 'h1') {               //Check if the element is a heading tag
     element.setInnerContent(dict[this.key][tagName],{ html: true });
   } else if (tagName === 'p') {                //Check if the element is a paragraph tag
     element.setInnerContent(dict[this.key][tagName],{ html: true });
   }
 }
}


async function handleRequest(request) {
  var randomValue;   //Variable to store any one of the url of the variants
  const url = 'https://cfw-takehome.developers.workers.dev/api/variants'
  let cookie = request.headers.get('Cookie');   //Get the cookie
  var data = await fetch(url);      //Fetch the contents of the url
  if (data.ok) {                    //Check the status of the fetced url
    let jsonData = await data.json();     //Get the fetched data as a json object
    let arrLen = jsonData.variants.length;    //Get the length of the array
    if (cookie === null) {        //Check if the cookie is null
      randomValue = jsonData.variants[Math.floor(Math.random() * arrLen)];   //If null then randomly pick among the two variants
    } else {
      let str = cookie.split('=')
      randomValue = str[str.length-1];   //If the cookie value is set, then assign that value to the randomValue variable
    }
    let variant = randomValue[randomValue.length-1];   //Get the number of the variant. If it is 1 or 2. This will be used as the key to the dictionary
    var newData = await fetch(randomValue)    //Fetch the contents of the URL chosen randomly
    const rewriter = new HTMLRewriter().on('*', new ElementHandler(variant))  //Get all the elements and also pass the number of the variant as an argument

    let newResponse = rewriter.transform(newData);  //Tranform with the new HTML
    newResponse.headers.set('Set-Cookie','URL='+randomValue); //Setting the value of the cookie
    return newResponse;   //Return the response of the tranformed HTML
  } else {
    alert("HTTP-Error: " + data.status);  //If there is an error fetching the contents of the url
  }

}
