const Discord = require('discord.js');
const { prefix, token } = require('./config.json');;
const client = new Discord.Client();
const AniDb = require("anidbjs");
const AniClient = new AniDb({ client: "myclient", version: 1 });
const fetch = require('node-fetch');
const Jikan = require('jikan-node');
const mal = new Jikan();

client.once('ready', () => {

    console.log('Ready!');

});



client.on('message', async message => {


    if (!message.content.startsWith(prefix)) {
        if (message.channel.type === "dm") {
            if (message.author.id == "244536381727178752" || message.author.bot) return;
            client.users.get("244536381727178752").sendMessage(message.content + " --- yazan: " + message.author.username + "-" + message.author.tag).finally(aa => {
                return message.author.sendMessage("Mesajınız iletilmiştir").catch(err => {
                    console.log(err)
                })
            })


        } else {
            return;
        }
    }

    const args = message.content.slice(prefix.length).split(/ +/);

    const command = args.shift().toLowerCase();


    if (command === 'ping') {

        message.channel.send('Ponag.').then(console.log).catch(console.error);

    } else if (command === `senddm`) {
        //  message.channel.send('calistim abi.')

        let e = args
        let msg = message.content.slice(prefix.length + command.length + 1)
        //   debugger
        // message.channel.send('for da calisti abi')
        message.reply('Mesajlari Gonderiyorum...')
        message.guild.members.forEach(aa => {
            aa.sendMessage(msg).catch(err => {

            })
            //debugger
        })
        // debugger
        message.reply('Mesajlari gonderildi')


    } else if (command === 'roll') {
        if (args.length == 0) {
            const result = Math.floor(Math.random() * 20) + 1;
            return message.reply('Zar Sonucun: ' + result);
        } else {
            if (args.length == 1) {
                let dice = args[0].split('d')
                const count = dice[0]
                const number = dice[1]
                let toplam = 0
                let dices = []
                //   debugger
                for (let index = 0; index < count; index++) {
                    dices[index] = Math.floor(Math.random() * number) + 1;
                    toplam += dices[index]
                }
                return message.reply('Zarlarin [ ' + dices.toString() + '] Zar Sonucun: ' + toplam);
            } else if (args.length == 2) {
                let dice = args[0].split('d')
                let mod = args[1].split('+')
                const count = dice[0]
                const number = dice[1]
                let toplam = 0
                let dices = []
                let natDices = []
                // debugger
                for (let index = 0; index < count; index++) {
                    //debugger
                    const dice = Math.floor(Math.random() * number) + 1
                    natDices[index] = dice
                    dices[index] = dice + (mod.length == 1 ? parseInt(mod[0]) : parseInt(mod[1]));
                    toplam += dices[index]
                }
                return message.reply('Naturel Zarlarin : [' + natDices.toString() + '], Mod Zarlarin [' + dices.toString() + '], Zar Sonucun: ' + toplam);
            }
        }
        //debugger
    } else if (command == "oner") {
        // AniClient.randomRecommendation().then(e => {console.log(e)}).catch(err =>{console.log('err + ' + err)})
        message.reply("Senin için en güzel animelere bakıyorum")
        let file
        await fetch("https://www.anizm.tv/json/TumAnimeListe.asp").then(response => {
            file = response.json()

        }).catch(err => console.log("hata ++ " + err))
        if (args.length == 0) {

            file.then(async data => {
                data
                const id = Math.floor(Math.random() * data.Seriler.length) + 1
                var anime = data.Seriler[id]
                await mal.search("anime", anime.SeriAdi).then(myAnime => {
                    anime.SeriAdi
                    let e = myAnime.results[0]

                    const embed = new Discord.RichEmbed()
                        .setColor('#0099ff')
                        .setTitle(e.title)
                        .setURL("https://www.anizm.tv/" + anime.Link)
                        .setDescription(e.synopsis)
                        // .setDescription
                        .addBlankField()
                        .addField('Bölüm Sayısı', e.episodes, true)
                        .addField('Tip', e.type, true)
                        .addField('Çıkış Tarihi', new Date(e.start_date).toLocaleDateString("tr-TR"), true)
                        .setImage(e.image_url.split("?s")[0])
                    message.channel.lastMessage.delete(1)
                    message.reply(embed)
                })
            })
        } else if (args.length > 0) {
            let mesaj = message.content.slice(prefix.length + command.length + 1)
            file.then(async data => {
                let animeler = data.Seriler
                let anime = animeler.find(anime => anime.SeriAdi.toLowerCase() == mesaj.toLowerCase())
                if (anime == undefined) {
                    message.channel.lastMessage.delete(1)
                    return message.reply(mesaj + " böyle bir anime bulamadım. İsmini bir kontrol et istersen https://www.anizm.tv/ara?s=" +
                        mesaj.replace(/ /g, "+"))
                } else {

                    await mal.search("anime", anime.SeriAdi).then(async myAnime => {
                        anime.SeriAdi
                        let i = 0
                        let e
                        let recAnime
                        
                        function malTv() {
                            if (myAnime.results[i].type != "TV") {
                                i += 1
                                malTv()
                            } else {
                                return e = myAnime.results[i]

                            }
                        }
                        await malTv()

                        await fetch("https://api.jikan.moe/v3/anime/" + e.mal_id + "/recommendations").then(mal => {
                            recAnime = mal.json()
                        })
                        recAnime.then(data => {
                            let malRec = data.recommendations
                            let recommendations = []
                            if (malRec.length > 0) {
                                malRec.forEach(kayit =>{
                                    recommendations.push(kayit.title)
                                })
                            } else { 
                                mal.search("anime" , e.title , {genre_exclude : 1}).then(data => {
                                    let as = data.results
                                    as.forEach(anan => {
                                        if (anan.type == "TV") {
                                            recommendations.push(anan.title)
                                        }
                                    })
                                })
                            }
                            if (recommendations.length > 3) {
                                recommendations = [
                                    recommendations[0],
                                    recommendations[1],
                                    recommendations[2],
                                ]
                            }
                            message.channel.lastMessage.delete(1)
                            message.reply("Bunlarada göz atabilirsin :) " +  recommendations.toString()   )
                        })
                    }).catch(err => console.log("Hata = " + err))
                }
            })
        }

        //      console.log(file)
        //    function umut(okul){
        //     AniClient.anime(okul).then(e => {
        //         console.log(e)
        //         const embed = new Discord.RichEmbed()
        //         .setColor('#0099ff')
        //         .setTitle(e.titles[0].title)
        //         .addField('Konusu', e.description)
        //         .addBlankField()
        //         .addField('Bölüm Sayısı', e.episodeCount , true)
        //         .addField('Tip', e.type , true)
        //         .addField('Çıkış Tarihi', e.startDate , true)
        //         .setImage('https://cdn.anidb.net/images/main/' + e.picture)
        //         message.channel.send(embed)
        //     }).catch(err => {
        //         const level = Math.floor(Math.random() * 12109) +1
        //     umut(level)
        //     })
        //    }
        //    umut(id)
        //        AniClient.anime(level).then(e => {
        //         console.log(e)
        //         const embed = new Discord.RichEmbed()
        //         .setColor('#0099ff')
        //         .setTitle(e.titles[0].title)
        //         .addField('Konusu', e.description)
        //         .addBlankField()
        //         .addField('Bölüm Sayısı', e.episodeCount , true)
        //         .addField('Tip', e.type , true)
        //         .addField('Çıkış Tarihi', e.startDate , true)
        //         .setImage('https://cdn.anidb.net/images/main/' + e.picture)
        //         message.channel.send(embed)
        //     }).catch(err => {
        //    console.log(err)
        //     })



    } else if (command == "react") {
        message.react('😄')
    }

});



client.login(process.env.TOKEN);
