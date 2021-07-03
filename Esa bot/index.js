
const Discord = require("discord.js")
const fetch = require("node-fetch")
const keepAlive = require("./server")
const axios = require('axios')
const Database = require("@replit/database")
const { prefix } = require('./config.json');
const db = new Database()
const client = new Discord.Client()
const mySecret = process.env['TOKEN'] 

const sadWords = ["sad", "depressed", "unhappy", "angry","poop"]


const starterEncouragements = ["Cheer up!",
"Hang in there.", "You are vjp pr0."]


// weather form
const exampleEmbed = (
	temp,
	maxTemp,
	minTemp,
	pressure,
	humidity,
	wind,
	cloudness,
	icon,
	author,
	profile,
	cityName,
	country
) => new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setAuthor(`Hello, ${author}`, profile)
		.setTitle(`There is ${temp}\u00B0 C in ${cityName}, ${country}`)
		.addField(`Maximum Temperature:`, `${maxTemp}\u00B0 C`, true)
		.addField(`Minimum Temperature:`, `${minTemp}\u00B0 C`, true)
		.addField(`Humidity:`, `${humidity} %`, true)
		.addField(`Wind Speed:`, `${wind} m/s`, true)
		.addField(`Pressure:`, `${pressure} hpa`, true)
		.addField(`Cloudiness:`, `${cloudness}`, true)
		.setThumbnail(`http://openweathermap.org/img/w/${icon}.png`)
		.setFooter('Made by Duc Thai');



db.get("encouragements").then(encouragements => {
  if( !encouragements || encouragements.length < 1 ){
    db.set("encouragements", starterEncouragements)
  }
})

db.get("responding").then(value => {
  if (value == null){
    db.set("responding", true)
  }
})

function updateEncouragements(encouragingMessage){
  db.get("encouragements").then(encouragements =>{
    encouragements.push([encouragingMessage])
    db.set("encouragements",encouragements)
  })
}

function deleteEncouragement(index){
   db.get("encouragements").then(encouragements =>{
    if(encouragements.length > index){
      encouragements.splice(index, 1)
      db.set("encouragements",encouragements)
    }
    
  })
}

function getQuote(){
  return fetch("https://zenquotes.io/api/random").then(res => {
    return res.json()
  })
  .then(data =>{
    return data[0]["q"] + "-" + data[0]["a"]
  })
}


client.on("ready",()=>{
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on("ready",()=>{
  client.user.setActivity('$help', { type: 'LISTENING' });
})


client.on("message",msg => {
  if (msg.author.bot) return 
  
  const args = msg.content.slice(prefix.length).split(' ');
  const command = args.shift().toLowerCase();




 //send a random quote
  if(msg.content === "$active"){
    getQuote().then(quote => msg.channel.send(quote))
  }



 //encourage when someone type sad words
  db.get("responding").then(responding=>{
    if(responding && sadWords.some(word => msg.content.includes(word))){
    db.get("encouragements").then(encouragements =>{
     const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)]
     msg.reply(encouragement)
    })
    
  }
})

 
//add the new cheer up line
 if (msg.content.startsWith("$new")) {
    encouragingMessage = msg.content.split("$new ")[1]
    updateEncouragements(encouragingMessage)
    msg.channel.send("New encouraging Message added. ")
  }
  
 //delete the cheer up line 
   if(msg.content.startsWith("$del")){
    index = parseInt(msg.content.split("$del ")[1])
    deleteEncouragement(index)
    msg.channel.send("New encouraging Message deleted. ")
  }


//list the cheer up lines
  if (msg.content.startsWith("$list")){
   db.get("encouragements").then(encouragements =>{
     msg.channel.send(encouragements)
   })
 }

// help  
  if (msg.content.startsWith("$help")){
   db.get("encouragements").then(encouragements =>{
     msg.channel.send("Hello, I'm Esa. ")
     msg.channel.send("You can type: ")
     msg.channel.send("$help for help. :love_letter: ")
     msg.channel.send("$active for motivation. :smiling_face_with_3_hearts: ")
     msg.channel.send("$list to list the cheer up lines. :love_letter: ")
     msg.channel.send("Type #w + the name of the city or the country to know the weather (without space): :cityscape: ")
     msg.channel.send("$responding false to disalbe be or true to enable me. :no_entry_sign: ")

   })
 }
 


//active or deactive the bot
 if (msg.content.startsWith("$responding")){
   value = msg.content.split("$responding ")[1]

   if(value.toLowerCase() == "true"){
     db.set("responding",true)
     msg.channel.send("Responding is on. Made by Duc Thai")
   } else {
     db.set("responding",false)
     msg.channel.send("Responding is off. Made by Duc Thai")
   }
 }

//weather command
else if (command === 'w') {
  return fetch(`https://api.openweathermap.org/data/2.5/weather?q=${args}&units=metric&appid=0cf9d31d9176689884c9472ae1f2d8ac`).then(res => {
return res.json()
})
.then(data =>{
let apiData = data;
         let currentTemp = apiData.main.temp;
         let maxTemp = apiData.main.temp_max;
         let minTemp = apiData.main.temp_min;
         let humidity = apiData.main.humidity;
         let wind = apiData.wind.speed;
         let author = msg.author.username
         let profile = msg.author.displayAvatarURL
         let icon = apiData.weather[0].icon
         let cityName = args
         let country = apiData.sys.country
         let pressure = apiData.main.pressure;
         let cloudness = apiData.weather[0].description;
         msg.channel.send(exampleEmbed(currentTemp, maxTemp, minTemp, pressure, humidity, wind, cloudness, icon, author, profile, cityName, country));
}).catch(err => {
         msg.reply(`Enter a valid city name`)
     })
}



})

keepAlive()
client.login(process.env.TOKEN)
